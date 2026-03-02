// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { useToast } from '@chakra-ui/react';
import { Account, Cedra, CedraConfig, Network } from '@cedra-labs/ts-sdk';
import useWalletState from 'core/hooks/useWalletState';
import { getAccountExists } from 'core/queries/account';
import {
  CedraNetwork,
  getFaucetNetworkFromCedraNetwork,
  networkUriMap,
} from 'core/utils/network';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { decryptByVaultKey } from 'core/utils/seedPhrase';

interface UseSwitchNetworkMutationProps {
  event: CedraNetwork;
  localTestnetIsLive: boolean | undefined;
}

export const useSwitchNetwork = () => {
  const queryClient = useQueryClient();
  const { cedraAccount, cedraNetwork, updateNetworkState, updateWalletState,getAccountInfoByAddress } =
    useWalletState();
  const toast = useToast();

  const mutation = async ({
    event,
    localTestnetIsLive,
  }: UseSwitchNetworkMutationProps): Promise<void> => {
    const newcedraNetwork = event;
    const newFaucetNetwork = getFaucetNetworkFromCedraNetwork(newcedraNetwork);
    // switching to local testnet
    if (newcedraNetwork === Network.LOCAL && !localTestnetIsLive) {
      return;
    }
    const accountExists = await getAccountExists({
      address: cedraAccount?.accountAddress,
      nodeUrl: newcedraNetwork,
    });

    if (!accountExists && cedraAccount && newFaucetNetwork) {
      const faucetClient = new Cedra(
        new CedraConfig({ network: newcedraNetwork, faucet: newFaucetNetwork }),
      );

      try {
        const adress = cedraAccount.accountAddress;
        if (adress) {
          await faucetClient.fundAccount({ accountAddress: adress, amount: 0 });
        } else {
          return;
        }
        const mnemonic = await decryptByVaultKey()
        const accountInfo = getAccountInfoByAddress(cedraAccount.accountAddress.toString())
        if(!accountInfo || !mnemonic) return;
        const account = Account.fromDerivationPath({
          mnemonic : mnemonic,
          path : accountInfo.path,
        })
        updateWalletState({account : account, path : accountInfo.path, walletName: accountInfo.walletName});
        toast({
          description: `No account with your credentials existed on ${networkUriMap[newcedraNetwork]}, a new account was initialized`,
          duration: 5000,
          isClosable: true,
          status: 'success',
          title: `Created new account on ${networkUriMap[newcedraNetwork]}`,
          variant: 'solid',
        });
      } catch (err) {
        toast({
          description: `Unable to access ${newFaucetNetwork}, you are still on ${cedraNetwork}`,
          duration: 5000,
          isClosable: true,
          status: 'error',
          title: 'Error accessing faucet',
          variant: 'solid',
        });
        throw new Error(
          `Unable to access ${newFaucetNetwork}, you are still on ${cedraNetwork}`,
        );
      }
    }
    updateNetworkState(newcedraNetwork);
    queryClient.invalidateQueries({ queryKey: ['getAccountResources'] });
  };

  return useMutation({ mutationFn: mutation });
};

export default useSwitchNetwork;
