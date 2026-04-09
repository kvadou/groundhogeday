import {
  Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  addExtraAccountMetasForExecute,
  createTransferCheckedInstruction,
  NATIVE_MINT,
  createSyncNativeInstruction,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import {
  HOGE_MINT, HOGE_DECIMALS, HOOK_PROGRAM_ID, BURROW_PROGRAM_ID,
  POOL_PDA, VAULT_HOGE, VAULT_WSOL,
} from "./solana";

const LP_FEE_BPS = 30; // 0.3% — must match on-chain constant
const AUTHORITY_SEED = Buffer.from("burrow-auth");

const [POOL_AUTHORITY] = PublicKey.findProgramAddressSync(
  [AUTHORITY_SEED, HOGE_MINT.toBuffer()],
  BURROW_PROGRAM_ID
);

export type SwapDirection = "buy" | "sell";

export interface SwapQuote {
  direction: SwapDirection;
  amountIn: number;
  amountInRaw: number;
  estimatedOut: number;
  estimatedOutRaw: number;
  priceImpact: number;
  fee: number;
  minOut: number;
  minOutRaw: number;
}

/** Client-side x*y=k output calculation — mirrors on-chain math exactly */
export function calculateOutput(
  amountInRaw: number,
  reserveIn: number,
  reserveOut: number,
): number {
  const feeAdjusted = amountInRaw * (10000 - LP_FEE_BPS);
  const numerator = feeAdjusted * reserveOut;
  const denominator = reserveIn * 10000 + feeAdjusted;
  if (denominator === 0) return 0;
  return Math.floor(numerator / denominator);
}

/** Get a swap quote given direction, amount, and current reserves */
export function getSwapQuote(
  direction: SwapDirection,
  amountIn: number,
  hogeReserve: number,
  solReserve: number,
  slippageBps: number = 100,
): SwapQuote {
  const amountInRaw = direction === "buy"
    ? Math.floor(amountIn * LAMPORTS_PER_SOL)
    : Math.floor(amountIn * 10 ** HOGE_DECIMALS);

  const [reserveIn, reserveOut] = direction === "buy"
    ? [solReserve, hogeReserve]
    : [hogeReserve, solReserve];

  const estimatedOutRaw = calculateOutput(amountInRaw, reserveIn, reserveOut);

  const estimatedOut = direction === "buy"
    ? estimatedOutRaw / 10 ** HOGE_DECIMALS
    : estimatedOutRaw / LAMPORTS_PER_SOL;

  const fee = (amountIn * LP_FEE_BPS) / 10000;

  const spotPrice = reserveOut / reserveIn;
  const effectivePrice = amountInRaw > 0 ? estimatedOutRaw / amountInRaw : 0;
  const priceImpact = spotPrice > 0
    ? Math.abs((1 - effectivePrice / spotPrice) * 100)
    : 0;

  const minOutRaw = Math.floor(estimatedOutRaw * (10000 - slippageBps) / 10000);
  const minOut = direction === "buy"
    ? minOutRaw / 10 ** HOGE_DECIMALS
    : minOutRaw / LAMPORTS_PER_SOL;

  return {
    direction, amountIn, amountInRaw,
    estimatedOut, estimatedOutRaw,
    priceImpact, fee, minOut, minOutRaw,
  };
}

/** Read current pool reserves from on-chain data */
export async function getPoolReserves(connection: Connection): Promise<{
  hogeReserve: number;
  solReserve: number;
}> {
  const poolData = await connection.getAccountInfo(POOL_PDA);
  if (!poolData || poolData.data.length < 8 + 32 * 5 + 8 * 4) {
    throw new Error("Pool not found");
  }
  const data = poolData.data;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  // Pool layout: discriminator(8) + 5 pubkeys(160) + hoge_reserve(8) + sol_reserve(8)
  const offset = 8 + 32 * 5;
  const hogeReserve = Number(view.getBigUint64(offset, true));
  const solReserve = Number(view.getBigUint64(offset + 8, true));
  return { hogeReserve, solReserve };
}

/** Resolve the transfer hook extra accounts needed for HOGE transfers */
async function getHookExtraAccounts(
  connection: Connection,
  source: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
): Promise<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }[]> {
  const dummyIx = createTransferCheckedInstruction(
    source, HOGE_MINT, destination, authority, 1, HOGE_DECIMALS, [],
    TOKEN_2022_PROGRAM_ID,
  );
  await addExtraAccountMetasForExecute(
    connection, dummyIx, HOOK_PROGRAM_ID,
    source, HOGE_MINT, destination, authority, 1, "confirmed",
  );
  return dummyIx.keys.slice(4).map(k => ({
    pubkey: k.pubkey,
    isSigner: false,
    isWritable: k.isWritable,
  }));
}

/** Build and send a swap transaction. Returns the tx signature. */
export async function executeSwap(
  connection: Connection,
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: Transaction) => Promise<Transaction>;
  },
  direction: SwapDirection,
  amountInRaw: number,
  minOutRaw: number,
): Promise<string> {
  const userPubkey = wallet.publicKey;
  const userHoge = getAssociatedTokenAddressSync(
    HOGE_MINT, userPubkey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const userWsol = getAssociatedTokenAddressSync(
    NATIVE_MINT, userPubkey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const tx = new Transaction();

  // Ensure user has a HOGE ATA
  const hogeInfo = await connection.getAccountInfo(userHoge);
  if (!hogeInfo) {
    tx.add(createAssociatedTokenAccountInstruction(
      userPubkey, userHoge, userPubkey, HOGE_MINT,
      TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    ));
  }

  // For BUY: wrap SOL into WSOL ATA
  if (direction === "buy") {
    const wsolInfo = await connection.getAccountInfo(userWsol);
    if (!wsolInfo) {
      tx.add(createAssociatedTokenAccountInstruction(
        userPubkey, userWsol, userPubkey, NATIVE_MINT,
        TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
      ));
    }
    tx.add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: userWsol,
        lamports: amountInRaw,
      }),
      createSyncNativeInstruction(userWsol, TOKEN_PROGRAM_ID),
    );
  }

  // Resolve hook extra accounts
  const [hogeSource, hogeDest, hogeAuth] = direction === "buy"
    ? [VAULT_HOGE, userHoge, POOL_AUTHORITY]
    : [userHoge, VAULT_HOGE, userPubkey];

  const hookExtras = await getHookExtraAccounts(connection, hogeSource, hogeDest, hogeAuth);

  // Load IDL and build swap instruction
  const idlResp = await fetch("/idl/groundhoge_burrow.json");
  const idl = await idlResp.json();
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: userPubkey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: async (txs) => txs,
    } as anchor.Wallet,
    { commitment: "confirmed" },
  );
  const program = new anchor.Program(idl, provider);

  const amountBN = new anchor.BN(amountInRaw);
  const minOutBN = new anchor.BN(minOutRaw);

  if (direction === "buy") {
    const ix = await program.methods
      .swapSolForHoge(amountBN, minOutBN)
      .accounts({
        user: userPubkey,
        pool: POOL_PDA,
        poolAuthority: POOL_AUTHORITY,
        hogeMint: HOGE_MINT,
        wsolMint: NATIVE_MINT,
        vaultHoge: VAULT_HOGE,
        vaultWsol: VAULT_WSOL,
        userWsol,
        userHoge,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .remainingAccounts(hookExtras)
      .instruction();
    tx.add(ix);
  } else {
    const ix = await program.methods
      .swapHogeForSol(amountBN, minOutBN)
      .accounts({
        user: userPubkey,
        pool: POOL_PDA,
        poolAuthority: POOL_AUTHORITY,
        hogeMint: HOGE_MINT,
        wsolMint: NATIVE_MINT,
        vaultHoge: VAULT_HOGE,
        vaultWsol: VAULT_WSOL,
        userHoge,
        userWsol,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .remainingAccounts(hookExtras)
      .instruction();
    tx.add(ix);
  }

  // After BUY: close WSOL ATA to unwrap remaining SOL
  if (direction === "buy") {
    tx.add(createCloseAccountInstruction(userWsol, userPubkey, userPubkey, [], TOKEN_PROGRAM_ID));
  }

  tx.feePayer = userPubkey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await wallet.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(sig, "confirmed");

  return sig;
}
