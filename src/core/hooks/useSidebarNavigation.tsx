// core/hooks/useSidebarNavigation.ts
import { PENDING_PAGE } from "core/constants";
import { updateSidebarState, getSidebarState } from "core/utils/sidebar";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useSidebarNavigation = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const location = useLocation();

  useEffect(() => {
    const getIsOpened = async () => {
      setIsOpened(await getSidebarState());
    };
    getIsOpened();
  });

  const openInSidebar = useCallback(
    async (customPath?: string) => {
      if (!chrome.sidePanel) return;

      // Використати customPath або поточний location.pathname
      const pathToOpen = customPath || location.pathname;

      // Зберегти сторінку та стан
      await chrome.storage.local.set({
        [PENDING_PAGE]: pathToOpen,
      });
      setIsOpened(true);
      updateSidebarState(true);
      await chrome.sidePanel
        .setPanelBehavior({
          openPanelOnActionClick: true,
        })
        .catch(console.error);

      // Відкрити sidebar
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.windowId) {
        await chrome.sidePanel.open({
          windowId: tab.windowId,
        });
      }
      window.close();
    },
    [location.pathname],
  );
  const openInPopup = async () => {
    setIsOpened(false);
    updateSidebarState(false);
    await chrome.sidePanel
      .setPanelBehavior({
        openPanelOnActionClick: false,
      })
      .catch(console.error);
    window.close();
  };

  return { openInSidebar, openInPopup, isOpened };
};
