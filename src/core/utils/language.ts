import { DEFAULT_LANGUAGE, LANGUAGE } from "core/constants";
import { UpdateLanguageProps } from "core/hooks/useWalletState";

const setLanguageToChromeStorage = async (language: UpdateLanguageProps | null) => {
  await chrome.storage.local.set({ [LANGUAGE]: JSON.stringify(language) });
};

const getLanguageFromChromeStorage = async () => {
  try {
    const item = await chrome.storage.local.get([LANGUAGE]);

    return item[LANGUAGE]
      ? JSON.parse(item[LANGUAGE])
      : DEFAULT_LANGUAGE;
  } catch (error) {
    console.log(error);
    return DEFAULT_LANGUAGE;
  }
};

export const getLanguageState = async () => {
  return await getLanguageFromChromeStorage();
};

export const updateLanguageState = (language: UpdateLanguageProps | null) => {
  setLanguageToChromeStorage(language);
};
export const removeLanguageState = async() =>{
  try{
    await chrome.storage.local.remove([LANGUAGE])
  }catch(error){
    console.error(error);
  }
}
export const languages = [
  {
    name: DEFAULT_LANGUAGE.name,
    shortName: DEFAULT_LANGUAGE.shortName,
  },
];
