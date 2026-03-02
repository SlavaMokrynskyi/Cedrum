import React, { useEffect, useState } from "react";
import styles from "./NFT.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { InfoIconSvg } from "core/image/InfoIconSvg";
import { SearchIconSvg } from "core/image/SearchIconSvg";
import { useNavigate } from "react-router-dom";
import { createClient } from "core/utils/helper";
import useWalletState from "core/hooks/useWalletState";
import { TokenAttributes } from "core/types";

const ImagePlaceholderSvg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
);

export default function NFT() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [NFTs, setNFTs] = useState<TokenAttributes[]>([]);
    const [filteredNFTs, setFilteredNFTs] = useState<TokenAttributes[]>([]);

    const { cedraNetwork, cedraAccount } = useWalletState()

    const handleNFTClick = (nft: TokenAttributes) => {
        navigate(`/wallet/nft-description`, { state: { nft } });
    };

    useEffect(() => {
        const getNFTs = async () => {
            if (!cedraAccount || !cedraNetwork) return;

            const client = await createClient(cedraNetwork);
            if (!client) return;

            const owned = await client.getAccountOwnedTokens({
                accountAddress: cedraAccount.accountAddress,
            });
            const list = owned ?? [];
            const nfts: TokenAttributes[] = list
                .filter((o: any) => o?.is_fungible_v2 !== true && o?.current_token_data?.is_fungible_v2 !== true)
                .filter((o: any) => o?.current_token_data)
                .map((o: any, idx: number) => {
                    const td = o.current_token_data!;
                    const col = td.current_collection ?? null;

                    return {
                        name: td.token_name,
                        description: td.description,
                        imageUri: td.token_uri,
                        uri: td.token_uri,
                        metadata: td.token_properties,
                        supply: td.supply ? Number(td.supply) : undefined,
                        collectionName: col?.collection_name,
                        createdBy: col?.creator_address,
                        id: td.token_data_id,
                        nftId: idx,
                    }
                });

            setNFTs(nfts);
            setFilteredNFTs(nfts);
        };
        getNFTs();
    }, [cedraAccount, cedraNetwork]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredNFTs(NFTs);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = NFTs.filter(nft => 
            nft.name?.toLowerCase().includes(query) ||
            nft.collectionName?.toLowerCase().includes(query)
        );
        setFilteredNFTs(filtered);
    }, [searchQuery, NFTs]);

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
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredNFTs.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateCard}>
                        <ImagePlaceholderSvg className={styles.emptyStateIcon} />
                        <h2 className={styles.emptyStateTitle}>
                            {searchQuery ? "No results found" : "No NFTs"}
                        </h2>
                        <p className={styles.emptyStateText}>
                            {searchQuery 
                                ? "Try a different search term"
                                : "Get started with your first NFT by visiting your favorite marketplace."
                            }
                        </p>
                    </div>
                </div>
            ) : (
                <div className={styles.nftGrid}>
                    {filteredNFTs.map((nft) => (
                        <button
                            key={String(nft.id)}
                            className={styles.nftCard}
                            onClick={() => handleNFTClick(nft)}
                        >
                            <div className={styles.nftImage}>
                                {nft.imageUri ? (
                                    <img 
                                        src={nft.imageUri} 
                                        alt={nft.name}
                                        className={styles.nftImg}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder} />
                                )}
                            </div>
                            <div className={styles.nftInfo}>
                                <span className={styles.nftText}>
                                    {nft.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )
            }
        </div>)
}