import { ADDRESSBOOK } from "core/constants";
import { UpdateAddressbookListProps } from "core/hooks/useWalletState";

export const validName = (name: string | null) => !!name?.trim();

const setAddressbookToChromeStorage = async (
  addressbook: UpdateAddressbookListProps[] | null,
) => {
  await chrome.storage.local.set({
    [ADDRESSBOOK]: JSON.stringify(addressbook),
  });
};

const getAddressbookFromChromeStorage = async (): Promise<
  UpdateAddressbookListProps[] | null
> => {
  try {
    const item = await chrome.storage.local.get([ADDRESSBOOK]);
    const raw = item[ADDRESSBOOK];

    if (!raw) return null;

    const parsed = JSON.parse(raw) as UpdateAddressbookListProps[] | null;
    return parsed;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeAddressBook = async () => {
  await chrome.storage.local.remove([ADDRESSBOOK]);
};

export const updateAddressbookState = async (
  addressbook: UpdateAddressbookListProps[] | null,
) => {
  await setAddressbookToChromeStorage(addressbook);
};

export const getAddressbookState = async (): Promise<
  UpdateAddressbookListProps[] | null
> => {
  return await getAddressbookFromChromeStorage();
};
