// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('inpage.js');
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error('Cedra injection failed.', error);
  }
}

injectScript();

// inpage -> contentscript
window.addEventListener('message', function (event) {
  if (event.source !== window) return;
  if (!event.data?.method) return;

  // contentscript -> background
  chrome.runtime.sendMessage(event.data, function (response) {
    let normalizedResponse = response;

    if (chrome.runtime.lastError) {
      normalizedResponse = { error: chrome.runtime.lastError.message };
    } else if (typeof normalizedResponse === "undefined") {
      normalizedResponse = { error: "Empty response from extension background" };
    }

    // contentscript -> inpage
    window.postMessage({
      responseMethod: event.data.method,
      id: event.data.id,
      response: normalizedResponse,
    });
  });
});
