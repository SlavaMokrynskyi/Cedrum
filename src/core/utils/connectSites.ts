import { CONNECT_SITES } from "core/constants";

export interface SiteDataProps {
  origin: string;
  url: string;
  favIconUrl: string;
}

const setSitesToChromeStorage = async (sites: SiteDataProps[] | null) => {
  try {
    await chrome.storage.local.set({ connectSites: JSON.stringify(sites) });
  } catch (error) {
    console.error(error);
  }
};

const getSitesFromChromeStorage = async () => {
  try {
    const item = await chrome.storage.local.get([CONNECT_SITES]);

    return item[CONNECT_SITES] ? JSON.parse(item[CONNECT_SITES]) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateSitesState = async (sites: SiteDataProps[] | null) => {
  await setSitesToChromeStorage(sites);
};

export const getSitesState = async () => {
  return await getSitesFromChromeStorage();
};

export const removeSitesState = async () => {
  try {
    await chrome.storage.local.remove([CONNECT_SITES]);
  } catch (error) {
    console.error(error);
  }
};
