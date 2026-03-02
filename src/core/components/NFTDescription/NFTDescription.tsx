import React from "react";
import styles from "./NFTDescription.module.css";
import { ArrowLeftSvg } from "../../image/ArrowLeftSvg";
import { InfoIconSvg } from "../../image/InfoIconSvg";
import { useNavigate, useLocation } from "react-router-dom";
import { TokenAttributes } from "core/types";

export default function NFTDescription() {
    const navigate = useNavigate();
    const location = useLocation();
    const nft = location.state?.nft as TokenAttributes | undefined;

    const handleSend = () => {
        if (nft) {
            navigate("/wallet/send-nft", { state: { nft } });
        }
    };

    if (!nft) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <ArrowLeftSvg className={styles.icon} />
                    </button>
                    <h1 className={styles.title}>NFTs</h1>
                    <button className={styles.infoButton}>
                        <InfoIconSvg className={styles.icon} />
                    </button>
                </div>
                <div className={styles.errorState}>
                    <p>NFT not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <ArrowLeftSvg className={styles.icon} />
                </button>
                <h1 className={styles.title}>NFTs</h1>
                <button className={styles.infoButton}>
                    <InfoIconSvg className={styles.icon} />
                </button>
            </div>
            <div className={styles.imageContainer}>
                {nft.imageUri ? (
                    <img 
                        src={nft.imageUri} 
                        alt={nft.name} 
                        className={styles.nftImage}
                    />
                ) : (
                    <div className={styles.imagePlaceholder} />
                )}
            </div>
            <div className={styles.infoSection}>
                <h2 className={styles.nftName}>{nft.name}</h2>
                
                <div className={styles.detailsCard}>
                    <h3 className={styles.detailsLabel}>Details:</h3>
                    <p className={styles.detailsText}>
                        {nft.description || "No description available"}
                    </p>
                </div>
            </div>
            <button className={styles.sendButton} onClick={handleSend}>
                Send
            </button>
        </div>
    );
}