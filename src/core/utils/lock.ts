import { LOCK_STATE, SESSION_VAULT_KEY } from "core/constants";
import {
  base64ToBuf,
  bufToBase64,
  checkPasswordByDecrypt,
  deriveKeyBytesPBKDF2,
  getMnemonicVault,
} from "./seedPhrase";


const scheduleAutoLock = () => {
  setTimeout(async () => {
    await chrome.storage.session.remove([SESSION_VAULT_KEY, LOCK_STATE]);
    console.log("SessionVaultKey will be deleted in 30 minutes");
  }, 30 * 60 * 1000); 
};

export const unlockSession = async (password: string) => {
  const vault = await getMnemonicVault();
  if (!vault) throw new Error("VAULT_NOT_FOUND");

  const salt = base64ToBuf(vault.salt);
  const keyBytes = await deriveKeyBytesPBKDF2(password, salt);

  const isValid = await checkPasswordByDecrypt(password);
  if (!isValid) throw new Error("INVALID_PASSWORD");

  await chrome.storage.session.set({
    [SESSION_VAULT_KEY]: bufToBase64(keyBytes),
    [LOCK_STATE]: Date.now() + 30 * 60 * 1000, 
  });

  scheduleAutoLock();
  
};

export const lockSessionNow = async () => {
  try {
    await chrome.storage.session.remove([SESSION_VAULT_KEY, LOCK_STATE]);
  } catch (error) {
    console.error(error);
  }
};

export const checkIsLocked = async (): Promise<boolean> => {
  try {
    const { [LOCK_STATE]: until, [SESSION_VAULT_KEY]: keyB64 } =
      await chrome.storage.session.get([LOCK_STATE, SESSION_VAULT_KEY]);

    // якщо немає ключа або until — вважаємо locked
    if (typeof until !== "number" || typeof keyB64 !== "string") return true;

    // якщо час вийшов — лочимо й повертаємо true
    if (Date.now() > until) {
      await lockSessionNow();
      return true;
    }

    return false; // ще дійсно => unlocked
  } catch (error) {
    console.error(error);
    await lockSessionNow();
    return true;
  }
};


export const getSessionVaultKey = async (): Promise<Uint8Array | null> => {
  const raw = await chrome.storage.session.get([SESSION_VAULT_KEY]);

  const keyB64 = raw?.[SESSION_VAULT_KEY] as string | undefined;

  if (!keyB64) return null;

  return base64ToBuf(keyB64);
};
