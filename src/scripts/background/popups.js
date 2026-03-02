import { NextActionMethod } from "../../core/types";
import {
  EXTENSION_POPUP_HEIGHT,
  EXTENSION_POPUP_SIDE_OFFSET,
  EXTENSION_POPUP_TOP_OFFSET,
  EXTENSION_POPUP_WIDTH,
} from "../../core/constants";
import { getSenderFavicon, getSenderOrigin, getSenderUrl } from "./sender";
import { getRequestKey } from "./requestUtils";

const createPopupHandlers = (currRes) => {
  const getExtensionUrl = () => chrome.runtime.getURL("index.html");

  const getPopupPosition = (sender) => ({
    top: EXTENSION_POPUP_TOP_OFFSET,
    left: Math.max(
      0,
      (sender?.tab?.width || 1200) - EXTENSION_POPUP_SIDE_OFFSET,
    ),
  });

  const openUnlockWindowForAction = async (
    request,
    sender,
    sendResponse,
    nextAction,
  ) => {
    try {
      const extensionURL = getExtensionUrl();

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
        width: EXTENSION_POPUP_WIDTH,
        height: EXTENSION_POPUP_HEIGHT,
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
      const extensionURL = getExtensionUrl();
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
          width: EXTENSION_POPUP_WIDTH,
          height: EXTENSION_POPUP_HEIGHT,
          ...getPopupPosition(sender),
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
      const extensionURL = getExtensionUrl();
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
          width: EXTENSION_POPUP_WIDTH,
          height: EXTENSION_POPUP_HEIGHT,
          ...getPopupPosition(sender),
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
      const extensionURL = getExtensionUrl();
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
          width: EXTENSION_POPUP_WIDTH,
          height: EXTENSION_POPUP_HEIGHT,
          ...getPopupPosition(sender),
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
