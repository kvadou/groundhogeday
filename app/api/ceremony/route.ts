/**
 * Shadow Ceremony API — Executes on-chain shadow burn or no-shadow mint.
 * Protected by CEREMONY_SECRET env var.
 *
 * POST /api/ceremony
 * Body: { action: "shadow" | "no-shadow", secret: string }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createBurnInstruction,
  createMintToInstruction,
  getAccount,
  getMint,
} from "@solana/spl-token";

const DEVNET_URL = "https://api.devnet.solana.com";
const DECIMALS = 2;

function getAdminKeypair(): Keypair {
  const secret = process.env.ADMIN_KEYPAIR;
  if (!secret) throw new Error("ADMIN_KEYPAIR env var not set");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
}

export async function POST(req: NextRequest) {
  try {
    const { action, secret } = await req.json();

    // Auth check
    if (!process.env.CEREMONY_SECRET || secret !== process.env.CEREMONY_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["shadow", "no-shadow"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const connection = new Connection(DEVNET_URL, "confirmed");
    const admin = getAdminKeypair();
    const mintPubkey = new PublicKey(process.env.HOGE_MINT || "Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ");

    const mintAccount = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
    const supplyBefore = mintAccount.supply;

    const adminATA = getAssociatedTokenAddressSync(
      mintPubkey,
      admin.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    let tx: Transaction;
    let description: string;

    if (action === "shadow") {
      // 6% burn from admin wallet via PermanentDelegate
      const accountInfo = await getAccount(connection, adminATA, "confirmed", TOKEN_2022_PROGRAM_ID);
      const burnAmount = (accountInfo.amount * BigInt(6)) / BigInt(100);

      tx = new Transaction().add(
        createBurnInstruction(adminATA, mintPubkey, admin.publicKey, burnAmount, [], TOKEN_2022_PROGRAM_ID),
      );
      description = `Shadow burn: ${Number(burnAmount) / 10 ** DECIMALS} $HOGE (6%)`;
    } else {
      // 3.9% mint to admin
      const mintAmount = (supplyBefore * BigInt(39)) / BigInt(1000);

      tx = new Transaction().add(
        createMintToInstruction(mintPubkey, adminATA, admin.publicKey, mintAmount, [], TOKEN_2022_PROGRAM_ID),
      );
      description = `No-shadow mint: ${Number(mintAmount) / 10 ** DECIMALS} $HOGE (3.9%)`;
    }

    const signature = await sendAndConfirmTransaction(connection, tx, [admin]);

    const newMint = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
    const supplyAfter = newMint.supply;

    return NextResponse.json({
      success: true,
      action,
      description,
      signature,
      supplyBefore: Number(supplyBefore) / 10 ** DECIMALS,
      supplyAfter: Number(supplyAfter) / 10 ** DECIMALS,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Ceremony error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
