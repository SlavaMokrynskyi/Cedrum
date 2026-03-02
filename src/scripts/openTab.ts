export const openTab = () => {
  try {
    let extensionURL = chrome.runtime.getURL("index.html");
    return new Promise((resolve) => {
      chrome.tabs
        .create({ url: `${extensionURL}?fullScreen=true` })
        .then((newTab: any) => {
          return resolve(newTab);
        });
    });
  } catch (error) {
    console.error(error);
  }
};
