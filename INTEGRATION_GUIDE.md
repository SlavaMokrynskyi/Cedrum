# Cedrum Wallet Integration Guide

## Overview

Cedrum is a browser extension wallet for the Cedra blockchain. This guide provides comprehensive documentation for integrating Cedrum wallet into your dApp.

## Installation

Users need to install the Cedrum browser extension before your dApp can interact with it.

## Basic Integration

All wallet functions are accessible through the global `window.cedrum` object.

```javascript
// Check if Cedrum is installed
if (typeof window.cedrum !== 'undefined') {
  console.log('Cedrum wallet is installed!');
} else {
  console.log('Please install Cedrum wallet');
}
```

---

## API Reference

### 1. `connect()`

Requests permission to connect to the user's wallet. This opens a popup window where the user can approve or reject the connection request.

**Usage:**
```javascript
const response = await window.cedrum.connect();
```

**Response:**
```javascript
{
  accountAddress: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**Example:**
```javascript
async function connectWallet() {
  try {
    const result = await window.cedrum.connect();
    if (result.accountAddress) {
      console.log('Connected to:', result.accountAddress);
      // Store the address for later use
      localStorage.setItem('walletAddress', result.accountAddress);
    }
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

---

### 2. `disconnect()`

Disconnects the current site from the wallet, revoking all permissions.

**Usage:**
```javascript
const response = await window.cedrum.disconnect();
```

**Response:**
```javascript
{
  success: true
}
```

**Example:**
```javascript
async function disconnectWallet() {
  try {
    const result = await window.cedrum.disconnect();
    if (result.success) {
      console.log('Wallet disconnected successfully');
      localStorage.removeItem('walletAddress');
    }
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
}
```

---

### 3. `isConnected()`

Checks if the current site is connected to the wallet.

**Usage:**
```javascript
const response = await window.cedrum.isConnected();
```

**Response:**
```javascript
true  // or false
```

**Example:**
```javascript
async function checkConnection() {
  try {
    const isConnected = await window.cedrum.isConnected();
    if (isConnected) {
      console.log('Site is connected to wallet');
      // Proceed with wallet operations
    } else {
      console.log('Site is not connected');
      // Show connect button
    }
  } catch (error) {
    console.error('Error checking connection:', error);
  }
}
```

---

### 4. `account()`

Retrieves the currently connected account's address and public key.

**Usage:**
```javascript
const response = await window.cedrum.account();
```

**Response:**
```javascript
{
  address: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  publicKey: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Example:**
```javascript
async function getAccountInfo() {
  try {
    const account = await window.cedrum.account();
    console.log('Account Address:', account.address);
    console.log('Public Key:', account.publicKey);
    return account;
  } catch (error) {
    console.error('Failed to get account:', error);
  }
}
```

---

### 5. `signAndSubmitTransaction(payload)`

Signs and submits a transaction to the Cedra blockchain in a single operation.

**Parameters:**
```javascript
{
  data: {
    function: "0xmodule_address::module_name::function_name",
    functionArguments: [arg1, arg2, ...]
  }
}
```

**Usage:**
```javascript
const response = await window.cedrum.signAndSubmitTransaction({
  data: {
    function: "0x1::coin::transfer",
    functionArguments: [recipientAddress, amount]
  }
});
```

**Response:**
```javascript
{
  success: true,
  hash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd"
}
```

**Example:**
```javascript
async function transferTokens(recipient, amount) {
  try {
    const payload = {
      data: {
        function: "0x1::coin::transfer",
        functionArguments: [recipient, amount.toString()]
      }
    };
    
    const result = await window.cedrum.signAndSubmitTransaction(payload);
    
    if (result.success) {
      console.log('Transaction submitted!');
      console.log('Transaction hash:', result.hash);
      // You can use this hash to track the transaction
      return result.hash;
    }
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

// Usage
await transferTokens(
  "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
  1000000  // amount in smallest unit
);
```

---

### 6. `signTransaction(payload)`

Signs a transaction without submitting it. Returns the signed transaction and authenticator, which can be submitted later.

**Parameters:**
```javascript
{
  data: {
    function: "0xmodule_address::module_name::function_name",
    functionArguments: [arg1, arg2, ...]
  }
}
```

**Usage:**
```javascript
const response = await window.cedrum.signTransaction({
  data: {
    function: "0x1::cedra_account::transfer",
    functionArguments: [recipientAddress, amount]
  }
});
```

**Response:**
```javascript
{
  success: true,
  senderAuthenticator: [1, 2, 3, ...],  // Array of bytes
  transaction: [4, 5, 6, ...]            // Array of bytes
}
```

**Example:**
```javascript
async function signTransactionOnly() {
  try {
    const payload = {
      data: {
        function: "0x1::cedra_account::transfer",
        functionArguments: [
          "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
          "1000000"
        ]
      }
    };
    
    const result = await window.cedrum.signTransaction(payload);
    
    if (result.success) {
      console.log('Transaction signed');
      // Store the signed transaction for later submission
      const signedTx = {
        authenticator: result.senderAuthenticator,
        transaction: result.transaction
      };
      
      // You can submit this later using the Cedra SDK
      return signedTx;
    }
  } catch (error) {
    console.error('Signing failed:', error);
  }
}
```

---

### 7. `signMessage(payload)`

Signs an arbitrary message with the user's private key. Useful for authentication or proving ownership.

**Parameters:**
```javascript
{
  message: [byte1, byte2, byte3, ...]  // Array of bytes
}
```

**Usage:**
```javascript
const message = new TextEncoder().encode("Hello, Cedra!");
const messageArray = Array.from(message);

const response = await window.cedrum.signMessage({
  message: messageArray
});
```

**Response:**
```javascript
{
  success: true,
  signedMessage: [1, 2, 3, 4, ...]  // Array of bytes (BCS serialized signature)
}
```

**Example:**
```javascript
async function signAuthMessage() {
  try {
    // Create a message to sign
    const message = `Sign in to MyDApp
Timestamp: ${Date.now()}
Nonce: ${Math.random().toString(36)}`;
    
    // Convert string to bytes
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    const messageArray = Array.from(messageBytes);
    
    const result = await window.cedrum.signMessage({
      message: messageArray
    });
    
    if (result.success) {
      console.log('Message signed successfully');
      // Send the signature to your backend for verification
      const signature = result.signedMessage;
      
      return signature;
    }
  } catch (error) {
    console.error('Message signing failed:', error);
  }
}
```

---

### 8. `getNetwork()`

Returns the currently selected network (e.g., mainnet, testnet, devnet, local).

**Usage:**
```javascript
const response = await window.cedrum.getNetwork();
```

**Response:**
```javascript
{
  network: "devnet"  // or "testnet", "mainnet", "local"
}
```

**Example:**
```javascript
async function checkNetwork() {
  try {
    const result = await window.cedrum.getNetwork();
    console.log('Current network:', result.network);
    
    if (result.network !== 'mainnet') {
      console.warn('Please switch to mainnet');
      // Show warning to user
    }
    
    return result.network;
  } catch (error) {
    console.error('Failed to get network:', error);
  }
}
```

---

### 9. `switchNetwork(payload)`

Requests to switch to a different network.

**Parameters:**
```javascript
{
  network: "devnet"  // or "testnet", "mainnet", "local"
}
```

**Usage:**
```javascript
const response = await window.cedrum.switchNetwork({
  network: "devnet"
});
```

**Response:**
```javascript
{
  success: true,
  network: "devnet"
}
```

**Example:**
```javascript
async function switchToTestnet() {
  try {
    const result = await window.cedrum.switchNetwork({
      network: "testnet"
    });
    
    if (result.success) {
      console.log('Switched to:', result.network);
      // Reload your dApp data for the new network
      await reloadDappData();
    }
  } catch (error) {
    console.error('Network switch failed:', error);
  }
}
```

---

### 10. `getBalance()`

Retrieves the account balance for the connected wallet on the current network.

**Usage:**
```javascript
const response = await window.cedrum.getBalance();
```

**Response:**
```javascript
{
  balance: 1234567890  // Balance in smallest unit (octas)
}
```

**Example:**
```javascript
async function displayBalance() {
  try {
    const result = await window.cedrum.getBalance();
    
    if (typeof result.balance === 'number') {
      // Convert from octas to full units (divide by 10^8)
      const balanceInCedra = result.balance / 100000000;
      console.log(`Balance: ${balanceInCedra.toFixed(8)} CEDRA`);
      
      // Display in UI
      document.getElementById('balance').textContent = 
        `${balanceInCedra.toFixed(8)} CEDRA`;
      
      return balanceInCedra;
    }
  } catch (error) {
    console.error('Failed to get balance:', error);
  }
}
```

---

## Complete Integration Examples

### Example 1: Basic React Integration

Here's a simple example of integrating Cedrum wallet into a React dApp:

```typescript
import React, { useState, useEffect } from 'react';

function WalletIntegration() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if Cedrum is installed
  useEffect(() => {
    if (typeof window.cedrum === 'undefined') {
      alert('Please install Cedrum wallet extension');
    } else {
      checkConnection();
    }
  }, []);

  // Check connection status
  const checkConnection = async () => {
    try {
      const result = await window.cedrum.isConnected();
      setIsConnected(result);
      
      if (result) {
        await loadWalletData();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  // Load wallet data
  const loadWalletData = async () => {
    try {
      // Get account info
      const accountData = await window.cedrum.account();
      setAccount(accountData);

      // Get balance
      const balanceData = await window.cedrum.getBalance();
      setBalance(Number(balanceData.balance) / 100000000);

      // Get network
      const networkData = await window.cedrum.getNetwork();
      setNetwork(networkData.network);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  // Connect wallet
  const handleConnect = async () => {
    try {
      const result = await window.cedrum.connect();
      if (result.accountAddress) {
        setIsConnected(true);
        await loadWalletData();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await window.cedrum.disconnect();
      setIsConnected(false);
      setAccount(null);
      setBalance(null);
      setNetwork(null);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  // Send transaction
  const handleSendTransaction = async () => {
    try {
      const recipient = prompt('Enter recipient address:');
      const amount = prompt('Enter amount (in CEDRA):');
      
      if (!recipient || !amount) return;

      const amountInOctas = Math.floor(parseFloat(amount) * 100000000);

      const result = await window.cedrum.signAndSubmitTransaction({
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [recipient, amountInOctas.toString()]
        }
      });

      if (result.success) {
        alert(`Transaction sent! Hash: ${result.hash}`);
        // Reload balance
        await loadWalletData();
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed: ' + error);
    }
  };

  // Sign message
  const handleSignMessage = async () => {
    try {
      const message = `Login to MyDApp\nTimestamp: ${Date.now()}`;
      const encoder = new TextEncoder();
      const messageBytes = Array.from(encoder.encode(message));

      const result = await window.cedrum.signMessage({
        message: messageBytes
      });

      if (result.success) {
        console.log('Message signed:', result.signedMessage);
        alert('Message signed successfully!');
      }
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return (
    <div className="wallet-integration">
      <h1>Cedrum Wallet Integration</h1>
      
      {!isConnected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <div>
          <div className="wallet-info">
            <p><strong>Address:</strong> {account?.address}</p>
            <p><strong>Balance:</strong> {balance?.toFixed(8)} CEDRA</p>
            <p><strong>Network:</strong> {network}</p>
          </div>
          
          <div className="actions">
            <button onClick={handleSendTransaction}>Send Transaction</button>
            <button onClick={handleSignMessage}>Sign Message</button>
            <button onClick={loadWalletData}>Refresh Data</button>
            <button onClick={handleDisconnect}>Disconnect</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletIntegration;
```

---

### Example 2: Advanced Integration with Cedra SDK

This example shows how to integrate Cedrum wallet with the Cedra TypeScript SDK for advanced operations:

```typescript
import { useState, useEffect } from "react";
import {
  Cedra,
  CedraConfig,
  Network,
  AccountAddress,
  Account,
  SimpleTransaction,
  AccountAuthenticator,
  Deserializer,
  Ed25519Signature,
} from "@cedra-labs/ts-sdk";

const CedrumAdvancedIntegration = () => {
  const [address, setAddress] = useState<AccountAddress | null>(null);
  const [recipientAccount, setRecipientAccount] = useState<Account | null>(null);
  const [cedra, setCedra] = useState<Cedra | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [network, setNetwork] = useState<string>("");

  // Initialize Cedra SDK
  useEffect(() => {
    const cedraInstance = new Cedra(
      new CedraConfig({ network: Network.DEVNET })
    );
    setCedra(cedraInstance);

    // Generate a recipient account for testing
    const recipient = Account.generate();
    setRecipientAccount(recipient);
  }, []);

  // Connect to wallet
  const handleConnect = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    try {
      const acc = await window.cedrum.connect();
      console.log("Connected account:", acc);
      
      const accountAddress = AccountAddress.fromString(acc.accountAddress || acc.address);
      setAddress(accountAddress);

      // Load initial data
      await loadWalletData();
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect: " + error);
    }
  };

  // Disconnect from wallet
  const handleDisconnect = async () => {
    if (!window.cedrum) return;

    try {
      const response = await window.cedrum.disconnect();
      console.log("Disconnected:", response);
      setAddress(null);
      setBalance("0");
      setNetwork("");
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  // Check connection status
  const handleIsConnected = async () => {
    if (!window.cedrum) return;

    try {
      const result = await window.cedrum.isConnected();
      console.log("Is connected:", result);
      alert(`Connection status: ${result ? "Connected" : "Not connected"}`);
    } catch (error) {
      console.error("isConnected error:", error);
    }
  };

  // Get account information
  const handleGetAccount = async () => {
    if (!window.cedrum) return;

    try {
      const acc = await window.cedrum.account();
      console.log("Account address:", acc.address);
      console.log("Account publicKey:", acc.publicKey);
      
      const accountAddress = AccountAddress.fromString(acc.address);
      setAddress(accountAddress);
      
      alert(`Address: ${acc.address}\nPublic Key: ${acc.publicKey}`);
    } catch (error) {
      console.error("Get account error:", error);
    }
  };

  // Load wallet data (balance and network)
  const loadWalletData = async () => {
    if (!window.cedrum) return;

    try {
      const balanceData = await window.cedrum.getBalance();
      setBalance(String(balanceData.balance));

      const networkData = await window.cedrum.getNetwork();
      setNetwork(networkData.network);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    }
  };

  // Sign and submit transaction (one-step process)
  const handleSignAndSubmitTransaction = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!cedra || !recipientAccount) {
      alert("SDK not initialized");
      return;
    }

    try {
      console.log("Sending to:", recipientAccount.accountAddress.toString());

      // Submit transaction directly
      const submittedTnx = await window.cedrum.signAndSubmitTransaction({
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [recipientAccount.accountAddress.toString(), 10000],
        }
      });

      console.log("Transaction hash:", submittedTnx.hash);

      // Wait for transaction confirmation
      const response = await cedra.waitForTransaction({
        transactionHash: submittedTnx.hash
      });

      console.log("Transaction response:", response);
      alert(`Transaction successful!\nHash: ${submittedTnx.hash}`);

      // Reload balance
      await loadWalletData();
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Transaction failed: " + error);
    }
  };

  // Sign transaction only (without submitting)
  const handleSignTransaction = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!cedra || !recipientAccount) {
      alert("SDK not initialized");
      return;
    }

    try {
      // Step 1: Sign the transaction
      const response = await window.cedrum.signTransaction({
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [recipientAccount.accountAddress.toString(), 10000],
        }
      });

      console.log("Signed transaction response:", response);

      // Step 2: Deserialize the signed transaction and authenticator
      const transactionBytes = new Uint8Array(response.transaction);
      const senderAuthenticatorBytes = new Uint8Array(response.senderAuthenticator);

      console.log("Transaction bytes:", transactionBytes);
      console.log("Sender authenticator bytes:", senderAuthenticatorBytes);

      const transaction = SimpleTransaction.deserialize(
        new Deserializer(transactionBytes)
      );
      const senderAuthenticator = AccountAuthenticator.deserialize(
        new Deserializer(senderAuthenticatorBytes)
      );

      // Step 3: Submit the signed transaction
      const submittedTnx = await cedra.transaction.submit.simple({
        senderAuthenticator: senderAuthenticator,
        transaction: transaction
      });

      console.log("Submitted transaction hash:", submittedTnx.hash);

      // Step 4: Wait for confirmation
      const tnxResponse = await cedra.waitForTransaction({
        transactionHash: submittedTnx.hash
      });

      console.log("Transaction confirmed:", tnxResponse);
      alert(`Transaction successful!\nHash: ${submittedTnx.hash}`);

      // Reload balance
      await loadWalletData();
    } catch (error) {
      console.error("Sign transaction error:", error);
      alert("Sign transaction failed: " + error);
    }
  };

  // Sign a message
  const handleSignMessage = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    try {
      const message = "Hello, Cedrum! This is a test message.";
      
      // Convert message to bytes
      const serializedMessage = Array.from(new TextEncoder().encode(message));
      
      // Sign the message
      const signedMessage = await window.cedrum.signMessage({ 
        message: serializedMessage 
      });

      console.log("Signed message (raw):", signedMessage);

      // Deserialize the signature for verification
      const deserializedSignature = Ed25519Signature.deserialize(
        new Deserializer(new Uint8Array(signedMessage.signedMessage))
      );
      
      console.log("Deserialized signature:", deserializedSignature);
      console.log("Signature bytes:", deserializedSignature.toUint8Array());
      
      alert("Message signed successfully!\nCheck console for signature details.");
    } catch (error) {
      console.error("Sign message error:", error);
      alert("Sign message failed: " + error);
    }
  };

  // Get current balance
  const handleGetBalance = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    try {
      const balanceData = await window.cedrum.getBalance();
      const balanceInCedra = Number(balanceData.balance) / 100000000;
      
      setBalance(String(balanceData.balance));
      console.log("Balance (octas):", balanceData.balance);
      console.log("Balance (CEDRA):", balanceInCedra);
      
      alert(`Balance: ${balanceInCedra.toFixed(8)} CEDRA`);
    } catch (error) {
      console.error("Get balance error:", error);
      alert("Get balance failed: " + error);
    }
  };

  // Get current network
  const handleGetNetwork = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    try {
      const networkData = await window.cedrum.getNetwork();
      setNetwork(networkData.network);
      
      console.log("Current network:", networkData.network);
      alert(`Current network: ${networkData.network}`);
    } catch (error) {
      console.error("Get network error:", error);
      alert("Get network failed: " + error);
    }
  };

  // Switch network
  const handleSwitchNetwork = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    try {
      const targetNetwork = Network.TESTNET;
      
      const switchResult = await window.cedrum.switchNetwork({ 
        network: targetNetwork 
      });
      
      console.log("Switch network result:", switchResult);
      setNetwork(switchResult.network);
      
      alert(`Switched to network: ${targetNetwork}`);
      
      // Reload wallet data for new network
      await loadWalletData();
    } catch (error) {
      console.error("Switch network error:", error);
      alert("Switch network failed: " + error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Cedrum Advanced Integration</h1>
      
      {/* Connection Status */}
      <div style={{ marginBottom: "20px", padding: "15px", background: "#f0f0f0", borderRadius: "8px" }}>
        <h2>Status</h2>
        <p><strong>Account:</strong> {address?.toString() || "Not connected"}</p>
        <p><strong>Balance:</strong> {(parseFloat(balance) / 100000000).toFixed(8)} CEDRA</p>
        <p><strong>Network:</strong> {network || "Unknown"}</p>
        <p style={{ fontSize: "12px", color: "#666" }}>
          {cedra ? "✓ Cedra SDK initialized" : "Initializing Cedra SDK..."}
        </p>
        {recipientAccount && (
          <p style={{ fontSize: "12px", color: "#666" }}>
            ✓ Test recipient: {recipientAccount.accountAddress.toString()}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={handleConnect}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Connect Wallet
        </button>
        <button
          onClick={handleDisconnect}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Disconnect Wallet
        </button>
        <button
          onClick={handleIsConnected}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Check Connection
        </button>
        <button
          onClick={handleGetAccount}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!window.cedrum}
        >
          Get Account
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={handleSignAndSubmitTransaction}
          style={{ padding: "10px 20px", cursor: "pointer", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px" }}
          disabled={!cedra || !address}
        >
          Sign & Submit Transaction
        </button>
        <button
          onClick={handleSignTransaction}
          style={{ padding: "10px 20px", cursor: "pointer", background: "#2196F3", color: "white", border: "none", borderRadius: "4px" }}
          disabled={!cedra || !address}
        >
          Sign Transaction Only
        </button>
        <button
          onClick={handleSignMessage}
          style={{ padding: "10px 20px", cursor: "pointer", background: "#FF9800", color: "white", border: "none", borderRadius: "4px" }}
          disabled={!cedra || !address}
        >
          Sign Message
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <button
          onClick={handleGetBalance}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Get Balance
        </button>
        <button
          onClick={handleGetNetwork}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Get Network
        </button>
        <button
          onClick={handleSwitchNetwork}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Switch to Testnet
        </button>
      </div>
    </div>
  );
};

export default CedrumAdvancedIntegration;
```

---

### Example 3: Message Signing for Authentication

```typescript
import { Ed25519Signature, Deserializer } from "@cedra-labs/ts-sdk";

async function authenticateUser() {
  try {
    // Create authentication message
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(7);
    const message = `Authenticate to MyDApp\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
    
    // Convert to bytes
    const messageBytes = Array.from(new TextEncoder().encode(message));
    
    // Request signature from wallet
    const result = await window.cedrum.signMessage({ message: messageBytes });
    
    if (!result.success) {
      throw new Error("User rejected signature request");
    }
    
    // Deserialize signature
    const signature = Ed25519Signature.deserialize(
      new Deserializer(new Uint8Array(result.signedMessage))
    );
    
    // Get account info
    const account = await window.cedrum.account();
    
    // Send to backend for verification
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageBytes,
        signature: Array.from(signature.toUint8Array()),
        publicKey: account.publicKey,
        address: account.address
      })
    });
    
    const data = await response.json();
    
    if (data.verified) {
      console.log("Authentication successful!");
      return data.token;
    } else {
      throw new Error("Signature verification failed");
    }
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
}

// Usage
const authToken = await authenticateUser();
```

---

## Data Deserialization Guide

When working with Cedrum wallet responses, you often need to deserialize binary data back into usable objects. Here's a comprehensive guide on how to deserialize different types of data.

### Understanding BCS Serialization

Cedra uses BCS (Binary Canonical Serialization) format. All responses from the wallet that contain binary data (arrays of numbers) need to be deserialized using the Cedra SDK's `Deserializer` class.

### Example 4: Deserializing Signed Messages

```typescript
import { Ed25519Signature, Deserializer } from "@cedra-labs/ts-sdk";

async function signAndDeserializeMessage() {
  try {
    const message = "Hello, Cedrum!";
    const serializedMessage = Array.from(new TextEncoder().encode(message)); 
    const signedMessage = await window.cedrum.signMessage({ message: serializedMessage });

    console.log("Signed Message (raw):", signedMessage);

    const deserializedSignature = Ed25519Signature.deserialize(new Deserializer(new Uint8Array(signedMessage.signedMessage)));
    console.log("Signed Message:", deserializedSignature);
  } catch (error) {
    console.error("Sign Message error:", error);
    alert("Sign Message failed: " + error);
  }
}
```

### Example 5: Deserializing Signed Transactions

```typescript
import { 
  SimpleTransaction, 
  AccountAuthenticator, 
  Deserializer 
} from "@cedra-labs/ts-sdk";

async function signAndDeserializeTransaction() {
  try {
    const response = await window.cedrum.signTransaction({
      data: {
        function: "0x1::cedra_account::transfer",
        functionArguments: ["0x123...", 10000],
      }
    });

    console.log("response : ", response);

    const transactionBytes = new Uint8Array(response.transaction);
    const senderAuthenticatorBytes = new Uint8Array(response.senderAuthenticator);

    console.log("transactionBytes : ", transactionBytes);
    console.log("senderAuthenticatorBytes : ", senderAuthenticatorBytes);

    const transaction = SimpleTransaction.deserialize(new Deserializer(transactionBytes));
    const senderAuthenticator = AccountAuthenticator.deserialize(new Deserializer(senderAuthenticatorBytes));

    console.log("transaction : ", transaction);
    console.log("senderAuthenticator : ", senderAuthenticator);
  } catch (error) {
    console.error("Sign Tnx error:", error);
    alert("Sign Tnx failed: " + error);
  }
}
```

### Example 6: Complete Transaction Flow with Deserialization

```typescript
import { 
  Cedra, 
  CedraConfig, 
  Network,
  SimpleTransaction, 
  AccountAuthenticator, 
  Deserializer 
} from "@cedra-labs/ts-sdk";

async function completeTransactionFlow(recipient: string, amount: number) {
  const cedra = new Cedra(new CedraConfig({ network: Network.DEVNET }));
  
  try {
    const response = await window.cedrum.signTransaction({
      data: {
        function: "0x1::cedra_account::transfer",
        functionArguments: [recipient, amount],
      }
    });

    console.log("response : ", response);

    const transactionBytes = new Uint8Array(response.transaction);
    const senderAuthenticatorBytes = new Uint8Array(response.senderAuthenticator);

    console.log("transactionBytes : ", transactionBytes);
    console.log("senderAuthenticatorBytes : ", senderAuthenticatorBytes);

    const transaction = SimpleTransaction.deserialize(new Deserializer(transactionBytes));
    const senderAuthenticator = AccountAuthenticator.deserialize(new Deserializer(senderAuthenticatorBytes));

    const submittedTnx = await cedra.transaction.submit.simple({
      senderAuthenticator: senderAuthenticator,
      transaction: transaction
    });

    const tnxResponse = await cedra.waitForTransaction({
      transactionHash: submittedTnx.hash
    });

    console.log("Transaction response:", tnxResponse);
    alert("Sign Transaction successful!");
  } catch (error) {
    console.error("Sign Tnx error:", error);
    alert("Sign Tnx failed: " + error);
  }
}
```

### Example 7: Working with Message Signatures

```typescript
import { 
  Ed25519Signature, 
  Deserializer 
} from "@cedra-labs/ts-sdk";

async function signMessage() {
  try {
    const message = "Hello, Cedrum!";
    const serializedMessage = Array.from(new TextEncoder().encode(message)); 
    
    const signedMessage = await window.cedrum.signMessage({ message: serializedMessage });

    console.log("Signed Message (raw):", signedMessage);

    const deserializedSignature = Ed25519Signature.deserialize(
      new Deserializer(new Uint8Array(signedMessage.signedMessage))
    );
    
    console.log("Signed Message:", deserializedSignature);
  } catch (error) {
    console.error("Sign Message error:", error);
    alert("Sign Message failed: " + error);
  }
}
```

### Key Points for Deserialization

1. **Always convert to Uint8Array**: Wallet returns array of numbers, convert it first
   ```typescript
   const bytes = new Uint8Array(response.transaction);
   ```

2. **Use Deserializer wrapper**: Wrap Uint8Array in Deserializer
   ```typescript
   const transaction = SimpleTransaction.deserialize(new Deserializer(transactionBytes));
   ```

3. **For signatures**: Use Ed25519Signature
   ```typescript
   const signature = Ed25519Signature.deserialize(new Deserializer(signatureBytes));
   ```

4. **For transactions**: Use SimpleTransaction and AccountAuthenticator
   ```typescript
   const transaction = SimpleTransaction.deserialize(new Deserializer(transactionBytes));
   const authenticator = AccountAuthenticator.deserialize(new Deserializer(authenticatorBytes));
   ```

---

## Best Practices

### 1. Check Wallet Installation
Always check if Cedrum is installed before attempting to use it:

```javascript
if (typeof window.cedrum === 'undefined') {
  console.error('Cedrum wallet not found');
  // Show installation instructions
}
```

### 2. Handle Connection State
Store and monitor the connection state:

```javascript
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  checkConnectionStatus();
}, []);

async function checkConnectionStatus() {
  const result = await window.cedrum.isConnected();
  setIsConnected(result);
}
```

### 3. Validate Network
Ensure users are on the correct network:

```javascript
const requiredNetwork = 'mainnet';
const currentNetwork = await window.cedrum.getNetwork();

if (currentNetwork.network !== requiredNetwork) {
  await window.cedrum.switchNetwork({ network: requiredNetwork });
}
```

### 4. Convert Units Properly
Remember that balances are in octas (10^-8):

```javascript
// Convert CEDRA to octas
const cedraAmount = 1.5;
const octasAmount = Math.floor(cedraAmount * 100000000);

// Convert octas to CEDRA
const octasBalance = 150000000;
const cedraBalance = octasBalance / 100000000;
```

---

## TypeScript Support

If you're using TypeScript, you can define types for better development experience:

```typescript
interface CedrumWallet {
  connect(): Promise<{ accountAddress?: string; address?: string; error?: string }>;
  disconnect(): Promise<{ success?: boolean; error?: string }>;
  isConnected(): Promise<boolean>;
  account(): Promise<{
    address?: string;
    publicKey?: string;
    error?: string;
  }>;
  signAndSubmitTransaction(payload: {
    data: {
      function: string;
      functionArguments: any[];
    };
  }): Promise<{ success?: boolean; hash?: string; error?: string }>;
  signTransaction(payload: {
    data: {
      function: string;
      functionArguments: any[];
    };
  }): Promise<{
    success?: boolean;
    senderAuthenticator?: number[];
    transaction?: number[];
    error?: string;
  }>;
  signMessage(payload: {
    message: number[];
  }): Promise<{ success?: boolean; signedMessage?: number[]; error?: string }>;
  getNetwork(): Promise<{ network?: string; error?: string }>;
  switchNetwork(payload: {
    network: string;
  }): Promise<{ success?: boolean; network?: string; error?: string }>;
  getBalance(): Promise<{ balance?: number; error?: string }>;
}

declare global {
  interface Window {
    cedrum?: CedrumWallet;
  }
}
```

---
