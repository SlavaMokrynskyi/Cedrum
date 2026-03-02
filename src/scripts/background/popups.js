import { NextActionMethod } from "../../core/types";
import { getSenderFavicon, getSenderOrigin, getSenderUrl } from "./sender";
import { getRequestKey } from "./requestUtils";

const createPopupHandlers = (currRes) => {
  const openUnlockWindowForAction = async (
    request,
    sender,
    sendResponse,
    nextAction,
  ) => {
    try {
      // eslint-disable-next-line no-undef
      const extensionURL = chrome.runtime.getURL("index.html");

      const reqKey = getRequestKey(request, sender);
      currRes[reqKey] = sendResponse;
      currRes[request.id] = sendResponse;

      const searchParams = new URLSearchParams();
      searchParams.set("id", String(request.id));
      searchParams.set("unlock", "true");
      searchParams.set("nextAction", nextAction);

      const type =
        nextAction === NextActionMethod.CLOSE_WINDOW ? "normal" : "popup";

      // eslint-disable-next-line no-undef
      await chrome.windows.create({
        url: `${extensionURL}?${searchParams.toString()}#/wallet/unlock`,
        type: type,
        width: 360,
        height: 640,
        focused: true,
      });
    } catch (error) {
      console.error("Failed to open unlock window:", error);
      const reqKey = getRequestKey(request, sender);
      delete currRes[reqKey];
      delete currRes[request.id];
      sendResponse({ error: "Failed to open unlock window" });
    }
  };

  const openConfirmConnectionSite = (
    request,
    sender,
    sendResponse,
    accountAddress = null,
  ) => {
    try {
      // eslint-disable-next-line no-undef
      let extensionURL = chrome.runtime.getURL("index.html");
      const requestKey = getRequestKey(request, sender);
      currRes[requestKey] = sendResponse;
      currRes[request.id] = sendResponse;

      const origin = getSenderOrigin(sender);
      const url = getSenderUrl(sender);
      const favIconUrl = getSenderFavicon(sender);

      const searchParams = new URLSearchParams();
      searchParams.set("confirm", "true");
      searchParams.set("id", request.id);
      searchParams.set("requestKey", requestKey);
      searchParams.set("address", accountAddress);
      searchParams.set("origin", origin);
      searchParams.set("favIconUrl", favIconUrl || "");
      searchParams.set("url", url);

      if (accountAddress) {
        // eslint-disable-next-line no-undef
        chrome.windows.create({
          url: `${extensionURL}?${searchParams.toString()}#/popup/confirm-connect`,
          type: "popup",
          width: 360,
          height: 640,
          top: 60,
          left: Math.max(0, (sender?.tab?.width || 1200) - 300),
          focused: true,
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      sendResponse({ error: error.toString() });
    }
  };

  const openSignTxnPopup = (
    request,
    sender,
    sendResponse,
    accountAddress = null,
  ) => {
    try {
      // eslint-disable-next-line no-undef
      let extensionURL = chrome.runtime.getURL("index.html");
      const requestKey = getRequestKey(request, sender);
      currRes[requestKey] = sendResponse;
      currRes[request.id] = sendResponse;

      const origin = getSenderOrigin(sender);
      const url = getSenderUrl(sender);
      const favIconUrl = getSenderFavicon(sender);

      const searchParams = new URLSearchParams();
      searchParams.set("signTxn", "true");
      searchParams.set("id", request.id);
      searchParams.set("requestKey", requestKey);
      searchParams.set("address", accountAddress);
      searchParams.set("origin", origin);
      searchParams.set("favIconUrl", favIconUrl || "");
      searchParams.set("url", url);

      if (accountAddress) {
        // eslint-disable-next-line no-undef
        chrome.windows.create({
          url: `${extensionURL}?${searchParams.toString()}#/popup/sign-transaction`,
          type: "popup",
          width: 360,
          height: 640,
          top: 60,
          left: Math.max(0, (sender?.tab?.width || 1200) - 300),
          focused: true,
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      sendResponse({ error: error.toString() });
    }
  };

  const openSignMessagePopup = (
    request,
    sender,
    sendResponse,
    accountAddress = null,
  ) => {
    try {
      // eslint-disable-next-line no-undef
      let extensionURL = chrome.runtime.getURL("index.html");
      const requestKey = getRequestKey(request, sender);
      currRes[requestKey] = sendResponse;
      currRes[request.id] = sendResponse;

      const origin = getSenderOrigin(sender);
      const url = getSenderUrl(sender);
      const favIconUrl = getSenderFavicon(sender);

      const searchParams = new URLSearchParams();
      searchParams.set("signMsg", "true");
      searchParams.set("id", request.id);
      searchParams.set("requestKey", requestKey);
      searchParams.set("address", accountAddress);
      searchParams.set("origin", origin);
      searchParams.set("favIconUrl", favIconUrl || "");
      searchParams.set("url", url);

      if (accountAddress) {
        // eslint-disable-next-line no-undef
        chrome.windows.create({
          url: `${extensionURL}?${searchParams.toString()}#/popup/sign-message`,
          type: "popup",
          width: 360,
          height: 640,
          top: 60,
          left: Math.max(0, (sender?.tab?.width || 1200) - 300),
          focused: true,
        });
      }

      return true;
    } catch (error) {
      console.error(error);
      sendResponse({ error: error.toString() });
    }
  };

  return {
    openUnlockWindowForAction,
    openConfirmConnectionSite,
    openSignTxnPopup,
    openSignMessagePopup,
  };
};

export { createPopupHandlers };
