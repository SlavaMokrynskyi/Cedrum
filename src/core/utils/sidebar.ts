import { SIDEBAR_STATE } from "core/constants";
/**
 * Sets sidebar state (true / false)
 */
async function setSidebarStateToLocalStorage(isOpened: boolean) {
  try {
    await chrome.storage.local.set({ [SIDEBAR_STATE]: isOpened });
  } catch (error) {
    console.error(error);
  }
}
/**
 * Return sidebar state (true / false)
 */
async function getSidebarStateFromLocalStorage(): Promise<boolean> {
  try {
    const storedData = await chrome.storage.local.get(SIDEBAR_STATE);
    return storedData[SIDEBAR_STATE] ?? false;
  } catch (error) {
    console.error(error);
    return false;
  }
}
/**
 * Deletes sidebar state
 */
async function removeSidebarStateFromLocalStorage() {
  try {
    await chrome.storage.local.remove(SIDEBAR_STATE);
  } catch (error) {
    console.error(error);
  }
}

export async function getSidebarState() {
  return await getSidebarStateFromLocalStorage();
}
export async function updateSidebarState(isOpened: boolean) {
  await setSidebarStateToLocalStorage(isOpened);
}
export async function removeSidebarState() {
  await removeSidebarStateFromLocalStorage();
}
