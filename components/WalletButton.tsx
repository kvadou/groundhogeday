"use client";

import { useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { HOOK_PROGRAM_ID, DAILY_COUNTER_SEED } from "@/lib/solana";

export default function WalletButton() {
  const { publicKey, connected, disconnect, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  // Auto-register wallet with the hook when connected
  const registerWallet = useCallback(async () => {
    if (!publicKey || !signTransaction) return;

    const [dailyCounterPda] = PublicKey.findProgramAddressSync(
      [DAILY_COUNTER_SEED, publicKey.toBuffer()],
      HOOK_PROGRAM_ID
    );

    // Check if already registered
    const info = await connection.getAccountInfo(dailyCounterPda);
    if (info && info.data.length > 0) return; // Already registered

    // Build register_wallet instruction via Anchor discriminator
    // sha256("global:register_wallet")[0..8]
    const discriminator = Buffer.from([
      181, 31, 36, 211, 183, 226, 55, 112,
    ]);

    const keys = [
      { pubkey: publicKey, isSigner: true, isWritable: true }, // payer
      { pubkey: publicKey, isSigner: false, isWritable: false }, // wallet
      { pubkey: dailyCounterPda, isSigner: false, isWritable: true }, // daily_counter
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    ];

    const ix = {
      programId: HOOK_PROGRAM_ID,
      keys,
      data: discriminator,
    };

    const tx = new Transaction().add(ix);
    tx.feePayer = publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    try {
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      console.log("Wallet registered with The Oracle:", sig);
    } catch (err) {
      // User rejected or tx failed — not critical, skip silently
      console.warn("Wallet registration skipped:", err);
    }
  }, [publicKey, signTransaction, connection]);

  useEffect(() => {
    if (connected && publicKey) {
      registerWallet();
    }
  }, [connected, publicKey, registerWallet]);

  const shortAddr = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <button
      onClick={() => (connected ? disconnect() : setVisible(true))}
      className="px-4 py-1.5 text-xs tracking-widest uppercase transition-colors duration-300 cursor-pointer"
      style={{
        fontFamily: "var(--font-mono)",
        border: "1px solid #1a1a2e",
        background: connected ? "rgba(0,255,136,0.08)" : "transparent",
        color: connected ? "#00ff88" : "#e8e6e3",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = connected
          ? "#00ff88"
          : "#ffaa00";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "#1a1a2e";
      }}
    >
      {connected ? shortAddr : "CONNECT WALLET"}
    </button>
  );
}
