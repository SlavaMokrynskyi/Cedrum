import { CedrumLogoSvg } from 'core/image/CedrumLogoSvg';
import { EditPencilSvg } from 'core/image/EditPencilSvg';
import styles from './WalletCard.module.css'
import React, { useEffect, useState } from 'react'
import useWalletState from 'core/hooks/useWalletState';
import { Account } from '@cedra-labs/ts-sdk';
import { shortenAddress } from 'core/utils/helper';
import { decryptByVaultKey } from 'core/utils/seedPhrase';
import { useNavigate } from 'react-router-dom';
import { setAccountsStateToStorage, setSelectedAccountToStorage } from 'core/utils/account';
import { SelectedCedraAccount } from 'core/types';

interface Props {
    accountAddress: string;
    walletName: string;
    publicKey: string;
    path: string;
    onCopySuccess?: () => void;
}

export default function WalletCard({ accountAddress, walletName, publicKey, path, onCopySuccess }: Props) {
    const [isSelected, setIsSelected] = useState<boolean>();
    const { cedraAccount, cedraAccounts, updateSelectedCedraAccountState } = useWalletState()

    const navigate = useNavigate()

    const handleCopyAddress = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (accountAddress) {
            navigator.clipboard.writeText(accountAddress);
            if (onCopySuccess) {
                onCopySuccess();
            }
        } else {
            console.error("Can`t get account address")
        }
    };

    const handleEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newName = prompt("Enter new account name:", walletName);
        const name = newName?.trim();

        if (!name) return;

        const updated: SelectedCedraAccount = {
            address: accountAddress,
            publicKey: publicKey,
            path: path,
            walletName: name,
        };

        await setSelectedAccountToStorage(updated);

        const nextAccounts = (cedraAccounts ?? []).map((a) =>
            a.address === updated.address ? { ...a, walletName: name } : a
        );

        await setAccountsStateToStorage(nextAccounts);
        
        window.location.reload();
    };

    const handleSelectAccount = async () => {
        const meta = (cedraAccounts ?? []).find(a => a.address === accountAddress);
        if (!meta) return;

        const mnemonic = await decryptByVaultKey();
        
        if (!mnemonic) return;

        const account = Account.fromDerivationPath({
            mnemonic: mnemonic,
            path : meta.path,
        })

        await updateSelectedCedraAccountState(account,{
            address: meta.address,
            publicKey: meta.publicKey,
            path: meta.path,
            walletName: meta.walletName,
        });
        navigate("/wallet/portfolio")
    };

    useEffect(() => {
        if (!cedraAccount) return;
        setIsSelected(cedraAccount.accountAddress.toString() === accountAddress);
    }, [cedraAccount,accountAddress])
    return (
        <div className={`${styles.walletCard} ${isSelected ? styles.walletCardSelected : ""}`} onClick={handleSelectAccount}>
            <div className={styles.walletIcon}>
                <CedrumLogoSvg className={styles.walletLogo} />
            </div>
            <div className={styles.walletInfo}>
                <h2 className={styles.walletName}>{walletName}</h2>
                <div className={styles.walletAddress}>
                    <span>{shortenAddress(accountAddress)}</span>
                    <div className={styles.walletActions}>
                        <button
                            className={styles.editButton}
                            onClick={handleEdit}
                        >
                            <EditPencilSvg className={styles.editIcon} />
                        </button>
                        <button
                            className={styles.copyButton}
                            onClick={handleCopyAddress}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={styles.copyIcon}
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
