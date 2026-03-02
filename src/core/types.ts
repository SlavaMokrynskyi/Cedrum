/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

export type SelectedCedraAccount = {
  address : string,
  publicKey : string,
  walletName : string | null,
  path : string
}

export interface TokenAttributes {
  description?: string;
  imageUri?: string;
  metadata?: any;
  name: string;
  supply?: number;
  uri: string;
  collectionName?: string;
  createdBy?: string;
  id?: any;
  nftId: number;
}


export const MessageMethod = Object.freeze({ 
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  GET_ACCOUNT: 'getAccount',
  GET_PENDING_APPROVAL: "getPendingApproval",
  GET_NETWORK: 'getNetwork',
  SWITCH_NETWORK: 'switchNetwork',
  GET_BALANCE: 'getBalance',
  IS_CONNECTED: 'is_connected',
  SIGN_AND_SUBMIT_TRANSACTION: 'signAndSubmitTransaction',
  SIGN_TRANSACTION: 'signTransaction',
  SIGN_MESSAGE: 'signMessage',
  SEND_CONFIRM: 'sendConfirm',
  // Used by Unlock page to tell background script to continue the request
  // that was paused while the wallet session was locked.
  UNLOCK_AND_CONTINUE: "unlockAndContinue",
  OPEN_SIDEPANEL: "openSidePanel"
} as const);

export const NextActionMethod = Object.freeze({
  CONFIRM_CONNECT: 'confirmConnect',
  SIGN_TRANSACTION: 'signTransaction',
  SIGN_MESSAGE: 'signMessage',
  CLOSE_WINDOW: 'closeWindow',
} as const);

export class Ok<T, E> {
  public constructor(public readonly value: T) {
    this.value = value;
  }

  public isOk(): this is Ok<T, E> {
    return true;
  }

  public isErr(): this is Err<T, E> {
    return false;
  }
}

export class Err<T, E> {
  public constructor(public readonly error: E) {
    this.error = error;
  }

  public isOk(): this is Ok<T, E> {
    return false;
  }

  public isErr(): this is Err<T, E> {
    return true;
  }
}

export type Result<T, E> =
  | Ok<T, E> // contains a success value of type T
  | Err<T, E>; // contains a failure value of type E

export const ok = <T, E>(value: T): Ok<T, E> => new Ok(value);

export const err = <T, E>(error: E): Err<T, E> => new Err(error);
