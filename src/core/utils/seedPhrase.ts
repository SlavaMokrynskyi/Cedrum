import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import {
  ENCRYPTED_MNEMONIC_VAULT,
  ITERATIONS,
} from "core/constants";
import { CedraNetwork } from "./network";
import { Network } from "@cedra-labs/ts-sdk";
import { getSessionVaultKey } from "./lock";

export const getGenerateSeedPhrase: any = async (cedraNetwork: Network) => {
  try {
    return bip39.generateMnemonic(wordlist);
  } catch (error) {
    console.error(error);
  }
};

export const getSeedPhrase = async (
  setSeedPhrase: (value: React.SetStateAction<string | null>) => void,
  cedraNetwork: CedraNetwork,
  existingMnemonic?: string,
) => {
  if (existingMnemonic) {
    setSeedPhrase(existingMnemonic);
    return;
  }
  const generateSeedPhrase = await getGenerateSeedPhrase(cedraNetwork);
  setSeedPhrase(() => {
    return generateSeedPhrase;
  });
};

/* ====== CRYPTOGRAPHY SEED PHRASE ====== */

const enc = new TextEncoder();
const dec = new TextDecoder();

// Uint8Array -> string
export const bufToBase64 = (buf: Uint8Array): string =>
  Buffer.from(buf).toString("base64");
// string -> Uint8Array
export const base64ToBuf = (base64: string): Uint8Array =>
  new Uint8Array(Buffer.from(base64, "base64"));
// TS wants data as ArrayBuffer
export const toArrayBuffer = (u8: Uint8Array): ArrayBuffer =>
  u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;

export type EncryptedMnemonicVault = {
  encrypted: string; // base64 encrypted data (seed phrase)
  salt: string; // base64 salt for PBKDF2
  iv: string; // base64 nonce/iv for AES-GCM (12 bytes)
};

// 1 space between words, better for BIP39/Unicode
const normalizeSeed = (seed: string) =>
  seed.trim().replace(/\s+/g, " ").normalize("NFKD");

// key derivation for encrypt/decrypt functions
export async function deriveKeyBytesPBKDF2(password: string, salt: Uint8Array) {
  // Importing password as "raw" key-material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  // getting 256 bits(32 bytes) using PBKDF(SHA-256)
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(bits);
}

async function importAesGcmKey(keyBytes: Uint8Array) {
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(keyBytes),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

async function setEncryptedMnemonicToChromeStorage(
  mnemonic: string,
  password: string,
) {
  const salt = crypto.getRandomValues(new Uint8Array(16)); // random salt (16 bytes)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // random iv (12 bytes)

  const keyBytes = await deriveKeyBytesPBKDF2(password, salt);

  const aesKey = await importAesGcmKey(keyBytes);

  const plain = enc.encode(normalizeSeed(mnemonic));

  const encryptedMnemonic = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plain,
  );

  const vault: EncryptedMnemonicVault = {
    encrypted: bufToBase64(new Uint8Array(encryptedMnemonic)),
    iv: bufToBase64(iv),
    salt: bufToBase64(salt),
  };

  console.log("Vault : ", vault);

  await chrome.storage.local.set({ [ENCRYPTED_MNEMONIC_VAULT]: vault });
}

async function getMnemonicVaultFromChromeStorage(): Promise<EncryptedMnemonicVault | null> {
  try {
    const raw = await chrome.storage.local.get([ENCRYPTED_MNEMONIC_VAULT]);

    const value = raw[ENCRYPTED_MNEMONIC_VAULT];

    if (!value) return null;

    const encryptedMnemonic : EncryptedMnemonicVault = {
      encrypted : value.encrypted,
      iv : value.iv,
      salt: value.salt
    }
    return encryptedMnemonic;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const decryptMnemonic = async (password: string): Promise<string> => {
  const vault = await getMnemonicVaultFromChromeStorage();
  if (!vault?.encrypted || !vault?.iv || !vault?.salt) throw new Error("VAULT_NOT_FOUND");

  const salt = base64ToBuf(vault.salt);
  const iv = new Uint8Array(base64ToBuf(vault.iv));
  const encrypted = toArrayBuffer(base64ToBuf(vault.encrypted));

  const keyBytes = await deriveKeyBytesPBKDF2(password, salt); // бажано ArrayBuffer/Uint8Array 32 bytes
  const aesKey = await importAesGcmKey(keyBytes); // import raw -> AES-GCM, usages: ["decrypt"]

  try {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encrypted
    );

    return dec.decode(plainBuf);
  } catch (e) {
    console.error("AES-GCM decrypt failed:", e);
    throw new Error("DECRYPT_FAILED");
  }
};


export const checkPasswordByDecrypt = async (
  password: string,
): Promise<boolean> => {
  try {
    await decryptMnemonic(password);
    return true;
  } catch (error) {
    return false;
  }
};

export const decryptByVaultKey = async() =>{
  const vault = await getMnemonicVaultFromChromeStorage();
  const vaultKey = await getSessionVaultKey();
  if (!vault || !vaultKey) return null;

  const iv = toArrayBuffer(base64ToBuf(vault.iv));
  const encrypted = toArrayBuffer(base64ToBuf(vault.encrypted));
  const aesKey = await importAesGcmKey(vaultKey)
  
  const plainBuf = await crypto.subtle.decrypt(
    {name: "AES-GCM", iv},
    aesKey,
    encrypted
  )
  
  return dec.decode(plainBuf);
}


export const clearVault = async () => {
  try{
    await chrome.storage.local.remove(ENCRYPTED_MNEMONIC_VAULT);
  }catch(error){
    console.error(error)
  }
};
export const getMnemonicVault = async () => {
  return await getMnemonicVaultFromChromeStorage();
};
export const setMnemonicVault = async (mnemonic: string, password: string) => {
  await setEncryptedMnemonicToChromeStorage(mnemonic, password);
};
export const getDecryptedMnemonic = async (password: string) => {
  await decryptMnemonic(password);
};
export const removeMnemonicVault = async() => {
  try{
    await chrome.storage.local.remove([ENCRYPTED_MNEMONIC_VAULT])
  }catch(error){
    console.error(error)
  }
}
