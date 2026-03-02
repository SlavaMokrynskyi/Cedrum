// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import {AccountAddress, Cedra, CedraConfig, Network} from '@cedra-labs/ts-sdk';

export interface FundAccountWithFaucetProps {
  address: AccountAddress;
  faucetUrl: string;
  nodeUrl: Network;
}

export const fundAccountWithFaucet = async ({
  address,
  faucetUrl,
  nodeUrl,
}: FundAccountWithFaucetProps): Promise<void> => {
  const faucetClient = new Cedra( new CedraConfig({network : nodeUrl, faucet: faucetUrl}));
  await faucetClient.fundAccount({accountAddress: address, amount: 100000000});
};
