// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import {
  Account,
  Cedra,
  CedraConfig,
  Ed25519Account,
  Ed25519PrivateKey,
  AccountAddress,
} from "@cedra-labs/ts-sdk";

import { AxiosResponse } from "axios";

import { ClipboardEvent } from "react";

import { CedraNetwork, FaucetNetwork } from "./network";

import { checkPasswordByDecrypt } from "./seedPhrase";

/* --------------------------- Errors --------------------------- */

export class RequestError extends Error {
  response?: AxiosResponse<any>;
  requestBody?: string;

  constructor(
    message?: string,
    response?: AxiosResponse<any>,
    requestBody?: string,
  ) {
    if (response) {
      const data = JSON.stringify(response.data);
      const hostAndPath = [response.request?.host, response.request?.path]
        .filter((e) => !!e)
        .join("");

      super(
        `${message} - ${data}${hostAndPath ? ` @ ${hostAndPath}` : ""}${
          requestBody ? ` : ${requestBody}` : ""
        }`,
      );

      this.response = response;
      this.requestBody = requestBody;
      Object.setPrototypeOf(this, new.target.prototype);
    } else {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
}

/* --------------------------- Accounts --------------------------- */

export const getNewCedraAccount = (privateKey: string): Ed25519Account => {
  const encodedkey = formatPrivateKey(privateKey);
  const pk = new Ed25519PrivateKey(encodedkey);
  return Account.fromPrivateKey({ privateKey: pk });
};

export const shortenAddress = (address: string | undefined) =>
  address !== undefined
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : undefined;

export const toggle = (currentState: boolean) => !currentState;

/* --------------------------- Password / clipboard --------------------------- */


export const checkPassword = async (input: string) => {
  return await checkPasswordByDecrypt(input);
};

export const recoveryPhraseInputFields = new Array(12).fill(null);

export const parseSecretRecoveryPhrase = (seedPhrase: string) => {
  if (!seedPhrase) return null;
  const trimSeedPhrase = seedPhrase.trim();
  return trimSeedPhrase.toLowerCase().match(/\w+/gu) || null;
};

export const getTextFromClipboard = (
  e: ClipboardEvent<HTMLInputElement>,
  value: string,
) => e.clipboardData.getData(value);

export const clearClipboard = () => {
  window.navigator.clipboard.writeText("");
};

/* --------------------------- Cedra client factories --------------------------- */

export const createClient = (cedraNetwork: CedraNetwork) => {
  try {
    if (!cedraNetwork) return null;

    const config = new CedraConfig({
      network: cedraNetwork,
    });

    return new Cedra(config);
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Аналог FaucetClient -> Faucet з Cedra SDK
 */
export const createFaucetClient = (
  cedraNetwork: CedraNetwork,
  faucetNetwork: FaucetNetwork | null | undefined,
) => {
  try {
    if (!cedraNetwork || !faucetNetwork) return null;

    const config = new CedraConfig({
      network: cedraNetwork,
      faucet: faucetNetwork,
    });

    return new Cedra(config);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createTokenClient = (cedra: Cedra | null) => {
  if (!cedra) return null;

  return {
    async getTokens(accountAddress: string) {
      const anyCedra: any = cedra;
      if (typeof anyCedra.getAccountOwnedTokens !== "function") {
        throw new Error(
          "Cedra SDK: getAccountOwnedTokens is not available in this version",
        );
      }
      return anyCedra.getAccountOwnedTokens({ accountAddress });
    },
  };
};



export const receiveNFTFields = [
  {
    id: 1,
    name: "NFT Address",
    shortName: "nft-address",
    placeholder:
      "0x2f11578511322051c605403fa0399263f1b5eb2bbc869f7297c7efd3669f7a79",
  },
  {
    id: 2,
    name: "Sender",
    shortName: "sender",
    placeholder:
      "0x2f11578511322051c605403fa0399263f1b5eb2bbc869f7297c7efd3669f7a79",
  },
  {
    id: 3,
    name: "Receiver",
    shortName: "receiver",
    placeholder:
      "0x2f11578511322051c605403fa0399263f1b5eb2bbc869f7297c7efd3669f7a79",
  },
];

// export const fieldEmpty = (
//   fieldName: string,
//   fieldValue: string | null,
//   action: React.Dispatch<React.SetStateAction<FieldsErrorProps>>,
// ) => {
//   if (!fieldValue) {
//     action((currentState: any) => ({
//       ...currentState,
//       [fieldName]: "Please enter correct data",
//     }));
//     return true;
//   }

//   return false;
// };

// export const receiveNFTAddressExistsError = async (
//   fieldName: string,
//   fieldValue: AccountAddress,
//   network: CedraNetwork,
//   action: React.Dispatch<React.SetStateAction<FieldsErrorProps>>,
// ) => {
//   try {
//     const toAccountExists = await getAccountExists({
//       address: fieldValue,
//       nodeUrl: network,
//     });

//     if (!toAccountExists) {
//       action((currentState: FieldsErrorProps) => ({
//         ...currentState,
//         [fieldName]: "Wrong address",
//       }));
//       return true;
//     }

//     return false;
//   } catch (error) {
//     console.error(error);
//     action((currentState: FieldsErrorProps) => ({
//       ...currentState,
//       [fieldName]: "Wrong address",
//     }));
//     return true;
//   }
// };

// export const handleErrors = (
//   setError: (value: SetStateAction<boolean>) => void,s
// ) => {
//   setError(true);
//   setPrivatePolicy(false);
// };

export const formatPrivateKey = (key: string) => {
  const keySlices = key.split("-");
  return keySlices[2].startsWith("0x")
    ? keySlices[2].substring(2)
    : keySlices[2];
};

export const getAccountBalance = async (
  accountAdress: AccountAddress,
  cedraNetwork: CedraNetwork,
): Promise<number> => {
  try {
    if (cedraNetwork) {
      const client = new Cedra(new CedraConfig({ network: cedraNetwork }));
      const cedBalance = await client.getAccountCoinAmount({
        accountAddress: accountAdress,
        coinType: "0x1::cedra_coin::CedraCoin",
      });
      return cedBalance;
    } else {
      throw new Error("Network is undefined");
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const validPassword =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const validField = (validRegExp: any, field: string | null) => {
  return validRegExp.test(field);
};

/* Formatting */
export const formatBalance = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
