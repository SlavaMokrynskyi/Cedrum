// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { MessageMethod } from "../core/types";

class Web3 {
  requestId;

  constructor() {
    this.requestId = 0;
  }

  connect() {
    return this._message(MessageMethod.CONNECT, {});
  }

  disconnect() {
    return this._message(MessageMethod.DISCONNECT, {});
  }

  isConnected() {
    return this._message(MessageMethod.IS_CONNECTED, {});
  }

  account() {
    return this._message(MessageMethod.GET_ACCOUNT, {});
  }

  signAndSubmitTransaction(payload) {
    return this._message(MessageMethod.SIGN_AND_SUBMIT_TRANSACTION, {
      payload,
    });
  }

  signTransaction(payload) {
    return this._message(MessageMethod.SIGN_TRANSACTION, {
      payload,
    });
  }

  signMessage(payload) {
    return this._message(MessageMethod.SIGN_MESSAGE, {
      payload,
    });
  }
  getNetwork() {
    return this._message(MessageMethod.GET_NETWORK, {});
  }

  switchNetwork(payload) {
    return this._message(MessageMethod.SWITCH_NETWORK, {
      payload,
    });
  }

  getBalance() {
    return this._message(MessageMethod.GET_BALANCE, {});
  }

  _message(method, args) {
    const id = this.requestId++;

    return new Promise((resolve, reject) => {
      const handler = (event) => {
        if (event.data?.responseMethod === method && event.data?.id === id) {
          window.removeEventListener("message", handler);

          const response = event.data.response;
          if (response?.error) {
            reject(response.error);
          } else {
            resolve(response);
          }
        }
      };
      window.addEventListener("message", handler);
      window.postMessage({ method, args, id }, "*");
    });
  }
}

const cedrum = new Web3();

cedrum.isCedrum = true;
cedrum.isWallet = true;
cedrum.version = "0.2.0";

window.cedrum = cedrum;
