const FULLSCREEN_QUERY_PARAM = "fullScreen";

export const isFullscreenExtensionView = (
  search = window.location.search,
) => {
  const searchParams = new URLSearchParams(search);
  return searchParams.get(FULLSCREEN_QUERY_PARAM) === "true";
};

export const closeFullscreenExtensionView = async (): Promise<boolean> => {
  if (!isFullscreenExtensionView()) {
    return false;
  }

  try {
    const currentTab = await chrome.tabs.getCurrent();

    if (typeof currentTab?.id === "number") {
      await chrome.tabs.remove(currentTab.id);
      return true;
    }
  } catch (error) {
    console.error(error);
  }

  window.close();
  return true;
};
