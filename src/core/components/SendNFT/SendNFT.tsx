import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SendNFT.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { TokenAttributes } from "core/types";
import { Cedra, AccountAddress, CedraConfig } from "@cedra-labs/ts-sdk";
import useWalletState from "core/hooks/useWalletState";
import { STATIC_GAS_AMOUNT } from "core/constants";

export default function SendNFT() {
    const [sendLoading, setSendLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const nft = location.state?.nft as TokenAttributes | undefined;
    const {cedraAccount, cedraNetwork} = useWalletState();
    const [address, setAddress] = useState<string | null>(null);
    const [addressError, setAddressError] = useState<string | null>(null);
    const digitalAssetAddress = nft?.id;
    
    const cedra = useMemo(() => {
        const config = new CedraConfig({ network: cedraNetwork});
        return new Cedra(config);
    }, [cedraNetwork]);

    const senderAddress = useMemo(() => {
    if (!cedraAccount) {
      return null;
    }

    return cedraAccount.accountAddress?.toString();
    }, [cedraAccount]);

    const signer = cedraAccount;

    const handleTransfer = async () => {
        setAddressError(null);
        
        if (!digitalAssetAddress) {
            setAddressError("NFT data not found. Please select an NFT again");
            return;
        }
        
        try {
            if (!address || !senderAddress || !signer) {
                setAddressError("Please enter a recipient address");
                return;
            }
            
            if (!address.startsWith("0x") || address.length !== 66) {
                setAddressError("Invalid address format. Address must start with 0x and be 66 characters long");
                return;
            }
            
            setSendLoading(true);
            try {
                await cedra.getAccountInfo({ accountAddress: address });
            } catch {
                setAddressError("Account does not exist");
                setSendLoading(false);
                return;
            }
            const balance = await cedra.getAccountCEDRAAmount({
                accountAddress: senderAddress,
            });
            if (Number(balance) < STATIC_GAS_AMOUNT) {
                setAddressError("Insufficient balance for gas fee");
                setSendLoading(false);
                return;
            }
            
            const tx = await cedra.transferDigitalAssetTransaction({
                sender: signer,
                digitalAssetAddress: digitalAssetAddress,
                recipient: AccountAddress.fromString(address),
            });

            const pending = await cedra.signAndSubmitTransaction({
                signer: signer,
                transaction: tx,
            });
            const response = await cedra.waitForTransaction({
                transactionHash: pending.hash,
                options: { timeoutSecs: 120, checkSuccess: true },
            });
            console.log("Transfer successful:", response);
            setSendLoading(false);
            navigate("/wallet/success");
        } catch (error: any) {
            console.error("Transfer error:", error);
            setAddressError(error?.message || "Transfer failed. Please try again.");
            setSendLoading(false);
        }
    };
    
    const handleBack = () => {
        navigate(-1);
    };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeftSvg className={styles.backIcon} />
        </button>
        <h1 className={styles.title}>Send NFT</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.nftImageContainer}>
          {nft?.imageUri ? (
            <img src={nft.imageUri} alt={nft.name} className={styles.nftImage} />
          ) : (
            <div className={styles.nftImagePlaceholder} />
          )}
        </div>

        <div className={styles.nftInfo}>
          <span className={styles.nftName}>{nft?.name}</span>
          {nft?.collectionName && (
            <span className={styles.nftCollection}>{nft.collectionName}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Recipient address</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="0x..."
              value={address || ""}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
      </div>
      {addressError && (
        <div className={styles.errorContainer}>
          <span className={styles.errorMessage}>{addressError}</span>
          <span className={styles.errorHint}>Example: 0x1234567890abcdef1234567890abcdef12345678</span>
        </div>
      )}

      <div className={styles.footer}>
        <button
          className={styles.transferButton}
          onClick={handleTransfer}
          type="button"
          disabled={sendLoading}
        >
          {sendLoading ? "Transferring..." : "Transfer"}
        </button>
      </div>
    </div>
  );
};

