/**
 * Groundhoge Day — $HOGE Token Metadata
 *
 * Creates Metaplex Token Metadata for the existing Token-2022 mint.
 * Uploads logo to Arweave via Irys, then creates on-chain metadata.
 *
 * Usage: npx tsx solana/scripts/create-metadata.ts
 */

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  createV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
  createGenericFile,
} from "@metaplex-foundation/umi";
import * as fs from "fs";
import * as path from "path";

// ── Config ─────────────────────────────────────────────────────────────

const DEVNET_URL = "https://api.devnet.solana.com";
const MINT_INFO_PATH = path.resolve(__dirname, "../mint-info.json");
const LOGO_PATH = path.resolve(__dirname, "../../public/logo-hoge.jpg");

// ── Helpers ────────────────────────────────────────────────────────────

function loadKeypairBytes(filepath: string): Uint8Array {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Uint8Array.from(JSON.parse(raw));
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🦫 GROUNDHOGE DAY — Token Metadata Creation");
  console.log("=============================================\n");

  // Load mint info
  const mintInfo = JSON.parse(fs.readFileSync(MINT_INFO_PATH, "utf-8"));
  console.log(`Mint: ${mintInfo.mint}`);
  console.log(`Network: ${mintInfo.network}\n`);

  // Set up UMI with Irys uploader
  const umi = createUmi(DEVNET_URL)
    .use(irysUploader({ address: "https://devnet.irys.xyz" }));

  // Load admin keypair as UMI signer
  const adminKeypath = path.resolve(
    process.env.HOME || "~",
    ".config/solana/groundhoge-dev.json"
  );
  const adminBytes = loadKeypairBytes(adminKeypath);
  const adminKeypair = umi.eddsa.createKeypairFromSecretKey(adminBytes);
  const adminSigner = createSignerFromKeypair(umi, adminKeypair);
  umi.use(signerIdentity(adminSigner));

  console.log(`Admin: ${adminSigner.publicKey}`);

  // ── Step 1: Upload Logo to Arweave ────────────────────────────────

  console.log("\nStep 1: Uploading logo to Arweave via Irys...");

  const logoBuffer = fs.readFileSync(LOGO_PATH);
  const logoFile = createGenericFile(logoBuffer, "logo-hoge.jpg", {
    contentType: "image/jpeg",
  });

  const [imageUri] = await umi.uploader.upload([logoFile]);
  console.log(`  Image URI: ${imageUri}`);

  // ── Step 2: Upload JSON Metadata ──────────────────────────────────

  console.log("\nStep 2: Uploading JSON metadata...");

  const metadata = {
    name: "Groundhoge Day",
    symbol: "HOGE",
    description:
      "The world's first weather-reactive meme coin. Every February 2nd, the Shadow Ceremony determines $HOGE's fate: 6% burn (shadow) or 3.9% mint (no shadow). Built on Solana with Token-2022 extensions.",
    image: imageUri,
    external_url: "https://groundhogeday.com",
    attributes: [
      { trait_type: "Species", value: "Groundhog" },
      { trait_type: "Event", value: "Groundhog Day" },
      { trait_type: "Date", value: "February 2" },
      { trait_type: "Shadow Burns", value: "6%" },
      { trait_type: "No-Shadow Mints", value: "3.9%" },
      { trait_type: "Daily Sell Limit", value: "1,883 HOGE" },
      { trait_type: "Transfer Fee", value: "6.25%" },
    ],
    properties: {
      files: [{ uri: imageUri, type: "image/jpeg" }],
      category: "currency",
    },
  };

  const metadataUri = await umi.uploader.uploadJson(metadata);
  console.log(`  Metadata URI: ${metadataUri}`);

  // ── Step 3: Create On-Chain Metadata Account ──────────────────────

  console.log("\nStep 3: Creating on-chain metadata account...");

  const mintPubkey = publicKey(mintInfo.mint);

  await createV1(umi, {
    mint: mintPubkey,
    authority: adminSigner,
    name: "Groundhoge Day",
    symbol: "HOGE",
    uri: metadataUri,
    sellerFeeBasisPoints: { basisPoints: 0n, identifier: "%" as const, decimals: 2 },
    tokenStandard: TokenStandard.Fungible,
    isMutable: true,
  }).sendAndConfirm(umi);

  console.log("  Done!\n");

  // ── Summary ───────────────────────────────────────────────────────

  console.log("=============================================");
  console.log("TOKEN METADATA CREATED SUCCESSFULLY!");
  console.log("=============================================\n");
  console.log(`Mint:         ${mintInfo.mint}`);
  console.log(`Name:         Groundhoge Day`);
  console.log(`Symbol:       HOGE`);
  console.log(`Image:        ${imageUri}`);
  console.log(`Metadata:     ${metadataUri}`);
  console.log(
    `\nExplorer: https://explorer.solana.com/address/${mintInfo.mint}?cluster=devnet`
  );
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
