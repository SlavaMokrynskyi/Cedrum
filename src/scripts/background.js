// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { Account, Cedra, CedraConfig } from "@cedra-labs/ts-sdk";

import { MessageMethod, NextActionMethod } from "../core/types";

import { getSitesState, updateSitesState } from "../core/utils/connectSites";

import { openTab } from "./openTab";
import { getNetworkState, setNetworkState } from "../core/utils/network";
import { getAccountBalance } from "../core/utils/helper";
import { checkIsLocked } from "../core/utils/lock";
import { decryptByVaultKey } from "../core/utils/seedPhrase";
import {
  getAccountsStateFromStorage,
  getSelectedAccountPublicDataFromStorage,
  getSelectedAccountFromStorage,
} from "../core/utils/account";
import { getSenderFavicon, getSenderOrigin, getSenderUrl } from "./background/sender";
import {
  createSelectedAccountDataResolver,
  getAccountAddressFromRuntimeAccount,
} from "./background/accountData";
import { createPopupHandlers } from "./background/popups";
import {
  getNextActionForMethod,
  getRequestKey,
  requiresAccountMethod,
  isApprovalAccepted,
} from "./background/requestUtils";
import {
  buildTransaction,
  buildTxPreview,
  getErrorMessage,
  normalizeTransactionPayload,
  simulateTransaction,
} from "./background/transactionUtils";

const currRes = {};
const pendingApprovals = {};
const pendingUnlockRequests = {};
const LOCKED_REQUEST_SENT = "__LOCKED_REQUEST_SENT__";
const getSelectedAccountData = createSelectedAccountDataResolver({
  getSelectedAccountPublicDataFromStorage,
  getAccountsStateFromStorage,
});
const {
  openUnlockWindowForAction,
  openConfirmConnectionSite,
  openSignTxnPopup,
  openSignMessagePopup,
} = createPopupHandlers(currRes);

const getCedraAccount = async (request, sender, sendResponse, nextAction) => {
  const isLocked = await checkIsLocked();

  if (isLocked) {
    pendingUnlockRequests[request.id] = { request, sender };
    currRes[request.id] = sendResponse;

    await openUnlockWindowForAction(
      request,
      sender,
      sendResponse,
      nextAction,
    );
    return LOCKED_REQUEST_SENT;
  }

  let accountState = await getSelectedAccountFromStorage();
  if (!accountState) {
    const accounts = await getAccountsStateFromStorage();
    if (Array.isArray(accounts) && accounts.length > 0) {
      accountState = accounts[0];
    }
  }
  const mnemonic = await decryptByVaultKey();

  if (!mnemonic || !accountState) return null;

  return Account.fromDerivationPath({
    path: accountState.path,
    mnemonic,
  });
};

const resolveAccountAddressForConnect = async (
  request,
  sender,
  sendResponse,
  runtimeAccount = null,
) => {
  const runtimeAddress = getAccountAddressFromRuntimeAccount(runtimeAccount);
  if (runtimeAddress) return runtimeAddress;

  const accountData = await getSelectedAccountData();
  if (accountData?.address) return accountData.address;

  const unlockedAccount = await getCedraAccount(
    request,
    sender,
    sendResponse,
    NextActionMethod.CONFIRM_CONNECT,
  );

  if (unlockedAccount === LOCKED_REQUEST_SENT) return LOCKED_REQUEST_SENT;

  return getAccountAddressFromRuntimeAccount(unlockedAccount);
};

const getApprovalKeyFromRequest = (request) =>
  request?.requestKey || request?.data?.requestKey || String(request.id);

const getPendingApprovalEntry = (request) => {
  const approvalKey = getApprovalKeyFromRequest(request);
  return pendingApprovals[approvalKey] || pendingApprovals[request.id] || null;
};

const getPendingResponse = (request) => {
  const approvalKey = getApprovalKeyFromRequest(request);
  return currRes[approvalKey] || currRes[request.id] || null;
};

const clearPendingByRequest = (request) => {
  const approvalKey = getApprovalKeyFromRequest(request);
  delete pendingApprovals[approvalKey];
  delete currRes[approvalKey];

  if (String(request.id) !== approvalKey) {
    delete pendingApprovals[request.id];
    delete currRes[request.id];
  }
};

const decodeMessagePreview = (bytes) => {
  try {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  } catch {
    return "";
  }
};

const normalizeMessagePayload = (payload) => {
  if (typeof payload === "string") {
    const bytes = Array.from(new TextEncoder().encode(payload));
    return { bytes, preview: payload };
  }

  if (payload instanceof Uint8Array) {
    const bytes = Array.from(payload);
    return { bytes, preview: decodeMessagePreview(bytes) };
  }

  if (Array.isArray(payload)) {
    return { bytes: payload, preview: decodeMessagePreview(payload) };
  }

  const message = payload?.message ?? payload?.data?.message;
  if (typeof message === "string") {
    const bytes = Array.from(new TextEncoder().encode(message));
    return { bytes, preview: message };
  }

  if (message instanceof Uint8Array) {
    const bytes = Array.from(message);
    return { bytes, preview: decodeMessagePreview(bytes) };
  }

  if (Array.isArray(message)) {
    return { bytes: message, preview: decodeMessagePreview(message) };
  }

  return { error: "Invalid message payload provided" };
};

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  (async () => {
    try {
      if (request.method === MessageMethod.UNLOCK_AND_CONTINUE) {
        await continueAfterUnlock(request, sendResponse);
        return;
      }

      let account = null;
      if (requiresAccountMethod(request.method)) {
        const nextAction = getNextActionForMethod(request.method);
        account = await getCedraAccount(
          request,
          sender,
          sendResponse,
          nextAction,
        );

        if (account === LOCKED_REQUEST_SENT) return;
        if (!account) {
          sendResponse({ error: "No Accounts" });
          return;
        }
      }

      const network = await getNetworkState();
      const client = new Cedra(new CedraConfig({ network: network }));

      switch (request.method) {
        case MessageMethod.CONNECT:
          connect(request, sender, sendResponse, account);
          break;

        case MessageMethod.DISCONNECT:
          disconnect(sender, sendResponse);
          break;

        case MessageMethod.IS_CONNECTED:
          handleIsConnected(sender, sendResponse);
          break;

        case MessageMethod.GET_ACCOUNT:
          getAccount(sender, sendResponse);
          break;

        case MessageMethod.GET_PENDING_APPROVAL:
          getPendingApprovalDetails(request, sendResponse);
          break;

        case MessageMethod.SIGN_AND_SUBMIT_TRANSACTION:
          signAndSubmitTransaction(
            request,
            sender,
            request.args.payload,
            sendResponse,
            account,
          );
          break;

        case MessageMethod.SIGN_TRANSACTION:
          signTransactionAndSendResponse(
            request,
            sender,
            request.args.payload,
            sendResponse,
            account,
          );
          break;

        case MessageMethod.SIGN_MESSAGE:
          signMessage(
            request,
            sender,
            request.args.payload,
            sendResponse,
            account,
          );
          break;

        case MessageMethod.GET_NETWORK:
          getNetwork(client, sender, sendResponse);
          break;

        case MessageMethod.SWITCH_NETWORK:
          switchNetwork(client, sender, request.args.payload, sendResponse);
          break;

        case MessageMethod.GET_BALANCE:
          getBalance(client, sender, sendResponse);
          break;

        case MessageMethod.SEND_CONFIRM:
          if (await handlePendingApproval(request)) {
            sendResponse({
              status: 200,
            });
            break;
          }

          const resp = getPendingResponse(request);
          if (resp) {
            resp(request.data);
          }
          sendResponse({
            status: 200,
          });
          clearPendingByRequest(request);
          break;
      }
    } catch (error) {
      console.error(error);
      sendResponse({ error: error.toString() });
    }
  })();

  return true;
});

async function isConnected(sender) {
  try {
    const senderOrigin = getSenderOrigin(sender);
    if (!senderOrigin) {
      return false;
    }

    const sitesList = await getSitesState();

    if (!Array.isArray(sitesList) || sitesList.length === 0) {
      return false;
    }

    const siteApproved = sitesList.some(
      (site) => site.origin === senderOrigin,
    );

    return siteApproved;
  } catch (error) {
    console.error("Error checking connection status:", error);
    return false;
  }
}

const ensureSiteConnected = async (sender, sendResponse) => {
  const connected = await isConnected(sender);
  if (connected) return true;

  sendResponse({ error: "Site not connected" });
  return false;
};

async function connect(request, sender, sendResponse, runtimeAccount = null) {
  //register caller for permission checking purposes
  try {
    const accountAddress = await resolveAccountAddressForConnect(
      request,
      sender,
      sendResponse,
      runtimeAccount,
    );

    if (accountAddress === LOCKED_REQUEST_SENT) {
      return;
    }

    if (!accountAddress) {
      sendResponse({ error: "No accounts signed in" });
      return;
    }

    const senderOrigin = getSenderOrigin(sender);
    const senderUrl = getSenderUrl(sender);
    const senderFavicon = getSenderFavicon(sender);

    const connected = await isConnected(sender);
    if (connected) {
      sendResponse({ accountAddress, address: accountAddress });
      return;
    }

    const approvalKey = getRequestKey(request, sender);
    pendingApprovals[approvalKey] = {
      method: MessageMethod.CONNECT,
      sender,
      senderOrigin,
      senderUrl,
      senderFavicon,
      accountAddress,
    };

    openConfirmConnectionSite(request, sender, sendResponse, accountAddress);
  } catch (error) {
    sendResponse({ error: "No accounts signed in" });
  }
}

async function disconnect(sender, sendResponse) {
  //unregister caller
  try {
    const senderOrigin = getSenderOrigin(sender);
    const sitesList = await getSitesState();
    const normalizedSites = Array.isArray(sitesList) ? sitesList : [];
    const newSites = normalizedSites.filter(
      (site) => site.origin !== senderOrigin,
    );
    await updateSitesState(newSites);
    sendResponse({ success: true });
  } catch (error) {
    console.error(error);
    sendResponse({ error: error.toString() });
  }
}

async function handleIsConnected(sender, sendResponse) {
  try {
    const connected = await isConnected(sender);
    sendResponse(connected);
  } catch (error) {
    console.error("Error checking connection status:", error);
    sendResponse(false);
  }
}

async function getAccount(sender, sendResponse) {
  try {
    if (!(await ensureSiteConnected(sender, sendResponse))) return;
    const accountData = await getSelectedAccountData();
    const accountAddress = accountData?.address || null;
    const publicKey = accountData?.publicKey || null;

    if (accountAddress) {
      sendResponse({
        address: accountAddress,
        ...(publicKey ? { publicKey } : {}),
      });
    } else {
      sendResponse({ error: "No accounts signed in" });
    }
  } catch (error) {
    sendResponse({ error: "No accounts signed in" });
  }
}

const openTransactionApproval = async (
  request,
  sender,
  payload,
  sendResponse,
  account,
  method,
) => {
  if (!(await ensureSiteConnected(sender, sendResponse))) return;

  if (!account) {
    sendResponse({ error: "No accounts signed in" });
    return;
  }

  const normalizedPayload = normalizeTransactionPayload(payload);
  if (normalizedPayload.error) {
    sendResponse({ error: normalizedPayload.error });
    return;
  }

  const accountData = await getSelectedAccountData();
  const accountAddress = accountData?.address || null;
  if (!accountAddress) {
    sendResponse({ error: "No accounts signed in" });
    return;
  }

  const network = await getNetworkState();
  const client = new Cedra(new CedraConfig({ network: network }));
  const transaction = await buildTransaction(
    client,
    accountAddress,
    normalizedPayload.data,
  );
  const simulation = await simulateTransaction(client, account, transaction);

  const senderOrigin = getSenderOrigin(sender);
  const senderUrl = getSenderUrl(sender);
  const senderFavicon = getSenderFavicon(sender);

  const approvalKey = getRequestKey(request, sender);
  pendingApprovals[approvalKey] = {
    method,
    sender,
    senderOrigin,
    senderUrl,
    senderFavicon,
    payload: normalizedPayload,
    txPreview: buildTxPreview(normalizedPayload),
    simulation,
    account,
    accountAddress,
  };

  openSignTxnPopup(request, sender, sendResponse, accountAddress);
};

async function signAndSubmitTransaction(
  request,
  sender,
  payload,
  sendResponse,
  account,
) {
  try {
    await openTransactionApproval(
      request,
      sender,
      payload,
      sendResponse,
      account,
      MessageMethod.SIGN_AND_SUBMIT_TRANSACTION,
    );
  } catch (error) {
    console.error(`error : ${error}`);
    sendResponse({ error: getErrorMessage(error) });
  }
}

async function signTransactionAndSendResponse(
  request,
  sender,
  payload,
  sendResponse,
  account,
) {
  try {
    await openTransactionApproval(
      request,
      sender,
      payload,
      sendResponse,
      account,
      MessageMethod.SIGN_TRANSACTION,
    );
  } catch (error) {
    console.error(`error : ${error}`);
    sendResponse({ error: getErrorMessage(error) });
  }
}

async function signMessage(request, sender, payload, sendResponse, account) {
  try {
    if (!(await ensureSiteConnected(sender, sendResponse))) return;
    if (!payload) {
      sendResponse({ error: "No message payload provided" });
      return;
    }
    const normalizedMessage = normalizeMessagePayload(payload);
    if (normalizedMessage.error) {
      sendResponse({ error: normalizedMessage.error });
      return;
    }

    if (!account) {
      sendResponse({ error: "No accounts signed in" });
      return;
    }

    const senderOrigin = getSenderOrigin(sender);
    const senderUrl = getSenderUrl(sender);
    const senderFavicon = getSenderFavicon(sender);
    const approvalKey = getRequestKey(request, sender);
    pendingApprovals[approvalKey] = {
      method: MessageMethod.SIGN_MESSAGE,
      sender,
      senderOrigin,
      senderUrl,
      senderFavicon,
      payload: { message: normalizedMessage.bytes },
      messagePreview: normalizedMessage.preview || "",
      account,
    };

    const accountData = await getSelectedAccountData();
    const accountAddress = accountData?.address || null;
    if (!accountAddress) {
      sendResponse({ error: "No accounts signed in" });
      return;
    }

    pendingApprovals[approvalKey].accountAddress = accountAddress;
    openSignMessagePopup(request, sender, sendResponse, accountAddress);
  } catch (error) {
    console.error(`error : ${error}`);
    sendResponse({ error: error.toString() });
  }
}

function getPendingApprovalDetails(request, sendResponse) {
  try {
    const pending = getPendingApprovalEntry(request);
    if (!pending) {
      sendResponse({ error: "Pending request not found" });
      return;
    }

    const senderOrigin = pending.senderOrigin || getSenderOrigin(pending.sender);
    const senderUrl = pending.senderUrl || getSenderUrl(pending.sender);

    let txPreview = null;
    let messagePreview = null;
    if (
      pending.method === MessageMethod.SIGN_TRANSACTION ||
      pending.method === MessageMethod.SIGN_AND_SUBMIT_TRANSACTION
    ) {
      txPreview = pending.txPreview || buildTxPreview(pending.payload);
    } else if (pending.method === MessageMethod.SIGN_MESSAGE) {
      messagePreview = pending.messagePreview || "";
    }

    sendResponse({
      success: true,
      approval: {
        method: pending.method,
        origin: senderOrigin,
        url: senderUrl,
        accountAddress: pending.accountAddress || null,
        simulation: pending.simulation || null,
        txPreview,
        messagePreview,
      },
    });
  } catch (error) {
    sendResponse({ error: getErrorMessage(error) });
  }
}

const continueAfterUnlock = async (request, sendResponse) => {
  const pendingUnlock = pendingUnlockRequests[request.id];
  const originalSendResponse = currRes[request.id];

  if (!pendingUnlock) {
    sendResponse({ status: 404, error: "Pending unlock request not found" });
    return;
  }

  if (request?.data?.success !== true) {
    if (originalSendResponse) {
      originalSendResponse({ error: "Unlock cancelled" });
    }
    delete pendingUnlockRequests[request.id];
    delete currRes[request.id];
    sendResponse({ status: 200 });
    return;
  }

  const originalRequest = pendingUnlock.request;
  const originalSender = pendingUnlock.sender;
  const nextAction = getNextActionForMethod(originalRequest.method);

  const account = await getCedraAccount(
    originalRequest,
    originalSender,
    originalSendResponse,
    nextAction,
  );

  if (account === LOCKED_REQUEST_SENT) {
    sendResponse({ status: 423, error: "Wallet is still locked" });
    return;
  }

  if (!account) {
    if (originalSendResponse) {
      originalSendResponse({ error: "No Accounts" });
    }
    delete pendingUnlockRequests[request.id];
    delete currRes[request.id];
    sendResponse({ status: 200 });
    return;
  }

  // Unlock succeeded, so we can remove "waiting for unlock" state.
  // For approval flows we keep currRes[request.id] until user confirms in popup.
  delete pendingUnlockRequests[request.id];

  switch (originalRequest.method) {
    case MessageMethod.CONNECT:
      await connect(
        originalRequest,
        originalSender,
        originalSendResponse,
        account,
      );
      break;
    case MessageMethod.SIGN_AND_SUBMIT_TRANSACTION:
      await signAndSubmitTransaction(
        originalRequest,
        originalSender,
        originalRequest.args.payload,
        originalSendResponse,
        account,
      );
      break;
    case MessageMethod.SIGN_TRANSACTION:
      await signTransactionAndSendResponse(
        originalRequest,
        originalSender,
        originalRequest.args.payload,
        originalSendResponse,
        account,
      );
      break;
    case MessageMethod.SIGN_MESSAGE:
      await signMessage(
        originalRequest,
        originalSender,
        originalRequest.args.payload,
        originalSendResponse,
        account,
      );
      break;
    case MessageMethod.GET_ACCOUNT:
      await getAccount(originalSender, originalSendResponse);
      delete currRes[request.id];
      break;
    case MessageMethod.GET_BALANCE: {
      const network = await getNetworkState();
      const client = new Cedra(new CedraConfig({ network: network }));
      await getBalance(client, originalSender, originalSendResponse);
      delete currRes[request.id];
      break;
    }
  }

  sendResponse({ status: 200 });
};

async function handlePendingApproval(request) {
  const pending = getPendingApprovalEntry(request);

  if (!pending) return false;

  const response = getPendingResponse(request);
  const isApproved = isApprovalAccepted(request.data);

  try {
    if (!isApproved) {
      if (response) {
        response({ error: "User rejected request" });
      }
      return true;
    }

    switch (pending.method) {
      case MessageMethod.CONNECT: {
        const sitesList = await getSitesState();
        const normalizedSites = Array.isArray(sitesList) ? sitesList : [];
        const siteOrigin =
          pending.senderOrigin || getSenderOrigin(pending.sender);
        const siteUrl = pending.senderUrl || getSenderUrl(pending.sender);
        const siteFavicon =
          pending.senderFavicon || getSenderFavicon(pending.sender);

        if (!siteOrigin) {
          if (response) {
            response({ error: "Unable to detect dApp origin" });
          }
          return true;
        }

        const alreadyConnected = normalizedSites.some(
          (site) => site.origin === siteOrigin,
        );

        if (!alreadyConnected) {
          await updateSitesState([
            ...normalizedSites,
            {
              origin: siteOrigin,
              url: siteUrl,
              favIconUrl: siteFavicon,
            },
          ]);
        }

        if (response) {
          response({
            accountAddress: pending.accountAddress,
            address: pending.accountAddress,
          });
        }
        break;
      }

      case MessageMethod.SIGN_AND_SUBMIT_TRANSACTION: {
        if (pending.simulation?.success === false) {
          if (response) {
            response({
              error:
                pending.simulation.error ||
                "Transaction simulation failed. Check transaction details.",
            });
          }
          return true;
        }

        const network = await getNetworkState();
        const client = new Cedra(new CedraConfig({ network: network }));
        const accountData = await getSelectedAccountData();
        const signerAddress = pending.accountAddress || accountData?.address;

        if (!signerAddress) {
          if (response) {
            response({ error: "No accounts signed in" });
          }
          return true;
        }

        const transaction = await buildTransaction(
          client,
          signerAddress,
          pending.payload.data,
        );

        const submitedTxn = await client.transaction.signAndSubmitTransaction({
          signer: pending.account,
          transaction,
        });

        if (response) {
          response({ success: true, hash: submitedTxn.hash });
        }
        break;
      }

      case MessageMethod.SIGN_TRANSACTION: {
        if (pending.simulation?.success === false) {
          if (response) {
            response({
              error:
                pending.simulation.error ||
                "Transaction simulation failed. Check transaction details.",
            });
          }
          return true;
        }

        const network = await getNetworkState();
        const client = new Cedra(new CedraConfig({ network: network }));
        const accountData = await getSelectedAccountData();
        const signerAddress = pending.accountAddress || accountData?.address;

        if (!signerAddress) {
          if (response) {
            response({ error: "No accounts signed in" });
          }
          return true;
        }

        const transaction = await buildTransaction(
          client,
          signerAddress,
          pending.payload.data,
        );

        const senderAuthenticator = await client.transaction.sign({
          signer: pending.account,
          transaction,
        });

        const senderAuthenticatorSerialized = Array.from(
          senderAuthenticator.bcsToBytes(),
        );
        const transactionSerialized = Array.from(transaction.bcsToBytes());

        if (response) {
          response({
            success: true,
            senderAuthenticator: senderAuthenticatorSerialized,
            transaction: transactionSerialized,
          });
        }
        break;
      }

      case MessageMethod.SIGN_MESSAGE: {
        const messageBytes = Uint8Array.from(pending.payload.message);
        const signedMsg = pending.account.sign(messageBytes);

        const serializedMsg = Array.from(signedMsg.bcsToBytes());

        if (response) {
          response({ success: true, signedMessage: serializedMsg });
        }
        break;
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    if (response) {
      response({ error: error.toString() });
    }
    return true;
  } finally {
    clearPendingByRequest(request);
  }
}

async function getNetwork(client, sender, sendResponse) {
  try {
    if (!(await ensureSiteConnected(sender, sendResponse))) return;
    sendResponse({ network: client.config.network });
  } catch (error) {
    console.error(`error : ${error}`);
    sendResponse({ error: error.toString() });
  }
}

async function switchNetwork(client, sender, payload, sendResponse) {
  try {
    if (!(await ensureSiteConnected(sender, sendResponse))) return;
    if (!payload) {
      sendResponse({ error: "No network payload provided" });
      return;
    }
    client.config.network = payload.network;
    setNetworkState(payload.network);

    sendResponse({ success: true, network: client.config.network });
  } catch (error) {
    console.error(`error : ${error}`);
    sendResponse({ error: error.toString() });
  }
}

async function getBalance(client, sender, sendResponse) {
  try {
    if (!(await ensureSiteConnected(sender, sendResponse))) return;
    const accountData = await getSelectedAccountData();
    const accountAddress = accountData?.address || null;
    if (!accountAddress) {
      sendResponse({ error: "No accounts signed in" });
      return;
    }

    const balance = await getAccountBalance(accountAddress, client.config.network);
    if (balance !== null) {
      sendResponse({ balance: balance });
    } else {
      sendResponse({ error: "Unable to fetch balance" });
    }
  } catch (error) {
    console.error(`error : ${error}`);
    sendResponse({ error: error.toString() });
  }
}

// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    openTab();
  }
});
