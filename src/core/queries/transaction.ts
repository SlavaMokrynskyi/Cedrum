// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { Account, Cedra, CedraConfig, isPendingTransactionResponse, isUserTransactionResponse, Network, TransactionResponse, } from'@cedra-labs/ts-sdk';
import { COIN_DEPOSIT_EVENT, COIN_WITHDRAW_EVENT } from 'core/constants';

export interface GetTransactionProps {
  nodeUrl: Network;
  txnHashOrVersion?: string;
}

export const getUserTransactions = async (account: Account, cedra: Cedra) => {
  try {
    if (!account || !account.accountAddress) return [];
    const accountAddress = account.accountAddress.toString();

    const activities = await cedra.getFungibleAssetActivities({
      options: {
        where: {
          owner_address: { _eq: accountAddress },
        },
      },
    });

    const versions : number[] = Array.from(
      new Set(
        activities
          .filter(
            (a) =>
              a.type === COIN_DEPOSIT_EVENT || a.type === COIN_WITHDRAW_EVENT,
          )
          .map((a) => Number(a.transaction_version))
          .filter((v) => Number.isFinite(v))
      ),
    );

    const txns: TransactionResponse[] = await Promise.all(
      versions.map((v) => cedra.getTransactionByVersion({ledgerVersion: BigInt(v)}))
    )

    const filteredTxns = txns.filter(
      (txn) =>
        isUserTransactionResponse(txn) || isPendingTransactionResponse(txn),
    );
    console.log("Filtered transactions : ", filteredTxns);

    return [...filteredTxns].reverse();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const getTransaction = async ({
  nodeUrl,
  txnHashOrVersion,
}: GetTransactionProps) => {
  const cedraClient = new Cedra(new CedraConfig ({network: nodeUrl}));
  if (txnHashOrVersion) {
    const txn = await cedraClient.getTransactionByHash({ transactionHash: txnHashOrVersion});
    return txn;
  }
  return undefined;
};