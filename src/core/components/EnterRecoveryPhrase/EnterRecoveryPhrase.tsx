import React, { ChangeEvent, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { Account } from "@cedra-labs/ts-sdk";
import {
    recoveryPhraseInputFields,
    clearClipboard,
    parseSecretRecoveryPhrase
} from "core/utils/helper";
import useWalletState from "core/hooks/useWalletState";
import { PATH_CEDRA_COIN } from "core/constants";
import { setMnemonicVault } from "core/utils/seedPhrase";
import { unlockSession } from "core/utils/lock";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import styles from "./EnterRecoveryPhrase.module.css";
import { createWalletsStates, getAccountExists } from "core/queries/account";

export default function EnterRecoveryPhrase() {
    const [inputFields, setInputFields] = useState<(null | string)[]>(
        recoveryPhraseInputFields,
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const toast = useToast();
    const location = useLocation()
    
    const {password} = location.state || {};
    const { cedraNetwork, createWalletState } = useWalletState();

    const finishRegistration = () => {
        const isFullScreenWindow =
            window.outerWidth >= window.screen.availWidth &&
            window.outerHeight >= window.screen.availHeight;

        if (isFullScreenWindow) {
            window.close();
            return;
        }

        navigate("/wallet/portfolio", { replace: true });
    };

    const handleNextStep = async () => {
        try {
            setIsLoading(true);
            const recoveryPhrase = inputFields.join(" ");
            console.log("recovery phrase", recoveryPhrase)
            const account = Account.fromDerivationPath({
                path: `${PATH_CEDRA_COIN}/0'`,
                mnemonic: recoveryPhrase,
            });
            const isExists = await getAccountExists({address : account.accountAddress, nodeUrl : cedraNetwork})

            if(!isExists) { 
                console.error("Account doesn`t exist")
            }

            if (!password) {
                navigate("/wallet/create-password", {
                    state: {
                        privateKey: account.privateKey.toString(),
                        recoveryPhrase : recoveryPhrase
                    }
                });
                return;
            }

            await createWalletsStates({createWalletState : createWalletState});
            await createWalletState(
                {
                    account: account,
                    path: `${PATH_CEDRA_COIN}/0'`,
                    walletName: "Wallet 1",
                },
            );
            await setMnemonicVault(recoveryPhrase, password);
            await unlockSession(password);
            finishRegistration();
        } catch (error) {
            console.error(error);
            toast({
                description: "You entered the wrong recovery phrase. Try again",
                duration: 5000,
                isClosable: true,
                status: "error",
                title: "Wrong recovery phrase",
                variant: "solid",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputField = (
        e: ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        const { value } = e.target;
        setInputFields((currentState) => {
            return currentState.map((field, i) => {
                return i === index ? value : field;
            });
        });

        if (value && index < 11) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const onRecoveryPhrasePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        let parsedPhrase = parseSecretRecoveryPhrase(pastedText);

        if (parsedPhrase && parsedPhrase.length > 0) {
            const newFields = [...inputFields];
            parsedPhrase.forEach((word, i) => {
                if (i < 12) {
                    newFields[i] = word;
                }
            });
            setInputFields(newFields);

            const nextEmptyIndex = newFields.findIndex((f, i) => i >= index && !f);
            if (nextEmptyIndex !== -1 && nextEmptyIndex < 12) {
                inputRefs.current[nextEmptyIndex]?.focus();
            } else {
                inputRefs.current[11]?.focus();
            }

            clearClipboard();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !inputFields[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <ArrowLeftSvg className={styles.backIcon} />
            </button>

            <div className={styles.content}>
                <h1 className={styles.title}>Enter Recovery Phrase</h1>

                <div className={styles.phraseGrid}>
                    {inputFields?.map((field, index) => (
                        <div key={index} className={styles.wordField}>
                            <span className={styles.wordNumber}>{index + 1}.</span>
                            <input
                                ref={(el) => { inputRefs.current[index] = el; }}
                                className={styles.inputField}
                                type="text"
                                value={field || ""}
                                onChange={(e) => handleInputField(e, index)}
                                onPaste={(e) => onRecoveryPhrasePaste(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                autoFocus={index === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                className={styles.continueButton}
                onClick={handleNextStep}
                disabled={isLoading}
            >
                {isLoading ? "Loading..." : "Continue"}
            </button>
        </div>
    );
}
