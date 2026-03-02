// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import {
  Ed25519Account,
  Cedra,
  CedraConfig,
  Network,
  AccountAddress,
  PublicKey,
} from "@cedra-labs/ts-sdk";

export const TransferResult = Object.freeze({
  AmountOverLimit: "Amount is over limit",
  AmountWithGasOverLimit: "Amount with gas is over limit",
  IncorrectPayload: "Incorrect transaction payload",
  Success: "Transaction executed successfully",
  UndefinedAccount: "Account does not exist",
} as const);

export interface TransactionProps {
  fromAccount: Ed25519Account;
  nodeUrl: Network;
  entryFunctionPayload: {
    function: `${string}::${string}::${string}`;
    functionArguments: any[];
  };
  publicKey?: PublicKey
}

export const simulateTransaction = async ({
  fromAccount,
  nodeUrl,
  entryFunctionPayload,
  publicKey
}: TransactionProps) => {
  try{
    const client = new Cedra(new CedraConfig({ network : nodeUrl}))
    const txn = await client.transaction.build.simple({
      sender: fromAccount.accountAddress,
      data: {
        function: entryFunctionPayload.function,
        functionArguments: entryFunctionPayload.functionArguments,
      },
    });

    const [simulatedTxn] = await client.transaction.simulate.simple({
      signerPublicKey : publicKey,
      transaction : txn
    })

    return simulatedTxn;
  } catch(error) {
    console.error("Cedra simulating error : ", error)
    throw error;
  }
};

export const submitTransaction = async ({
  fromAccount,
  nodeUrl,
  entryFunctionPayload,
}: TransactionProps) => {
  try {
    const client = new Cedra(new CedraConfig({ network: nodeUrl }));
    const txn = await client.transaction.build.simple({
      sender: fromAccount.accountAddress,
      data: {
        function: entryFunctionPayload.function,
        functionArguments: entryFunctionPayload.functionArguments,
      },
    });
    const committedTxn = await client.signAndSubmitTransaction({
      signer: fromAccount,
      transaction: txn,
    });

    const executedTxn = await client.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    return executedTxn.hash;
  } catch (error) {
    console.error("Cedra transaction error:", error);
    throw error;
  }
};

export interface TestCoinTransferTransactionPayload {
  amount: number;
  toAddress: AccountAddress;
}

export interface SendCoinTransactionProps {
  amount: number;
  fromAccount: Ed25519Account;
  nodeUrl: Network;
  toAddress: AccountAddress;
}

export const sendCoinTransaction = async ({
  amount,
  fromAccount,
  nodeUrl,
  toAddress,
}: SendCoinTransactionProps) => {
  try {
    const client = new Cedra(new CedraConfig({ network: nodeUrl }));

    const txn = await client.transaction.build.simple({
      sender: fromAccount.accountAddress,
      data: {
        function: "0x1::cedra_account::transfer",
        functionArguments: [toAddress, amount],
      },
    });

    const committed = await client.signAndSubmitTransaction({
      signer: fromAccount,
      transaction: txn,
    });

    const executed = await client.waitForTransaction({
      transactionHash: committed.hash,
    });

    return executed.hash;
  } catch (error) {
    console.error("Cedra transfer error:", error);
    throw error;
  }
};

export interface SubmitCoinTransferTransactionProps {
  amount: number;
  fromAccount: Ed25519Account; // ✔ Cedra Account
  nodeUrl: Network;
  onClose: () => void;
  toAddress: AccountAddress;
}

export const submitCoinTransferTransaction = async ({
  amount,
  fromAccount,
  nodeUrl,
  onClose,
  toAddress,
}: SubmitCoinTransferTransactionProps) => {
  const txnHash = await sendCoinTransaction({
    amount,
    fromAccount,
    nodeUrl,
    toAddress,
  });

  onClose();
  return txnHash;
};
