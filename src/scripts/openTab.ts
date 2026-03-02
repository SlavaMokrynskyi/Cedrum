export const openTab = () => {
  try {
    const extensionURL = new URL(chrome.runtime.getURL("index.html"));
    extensionURL.searchParams.set("fullScreen", "true");

    return chrome.tabs.create({
      url: extensionURL.toString(),
    });
  } catch (error) {
    console.error(error);
  }
};
