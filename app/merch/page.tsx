import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Department of Supply Chain Operations — Groundhoge Day Economic Authority",
  description:
    "Official merchandise procurement portal. All items produced by the Department of Supply Chain Operations. Delivery times determined by the Oracle.",
};

/* ─── Product data ─── */
type Product = {
  name: string;
  description: string;
  price: string;
  badge?: "COMING SOON" | "SOLD OUT";
  requisitionId: string;
};

const PRODUCTS: Product[] = [
  {
    name: '"THE ORACLE HAS SPOKEN" TEE',
    description:
      'Classic black tee. Front: Groundhoge Day logo. Back: "To question the Oracle is to question physics."',
    price: "$39.00",
    badge: "COMING SOON",
    requisitionId: "TEE-ORACLE-001",
  },
  {
    name: '"$HOGE IS NOT A SECURITY" TEE',
    description:
      'Black tee. Front: "$HOGE is not a security. $HOGE is a shadow."',
    price: "$39.00",
    badge: "COMING SOON",
    requisitionId: "TEE-SHADOW-002",
  },
  {
    name: '"WHISTLE-PIG" HOODIE',
    description:
      'Black hoodie. Front: "CODENAME: WHISTLE-PIG" with species designation.',
    price: "$69.00",
    badge: "COMING SOON",
    requisitionId: "HOOD-WP-003",
  },
  {
    name: '"INNER CIRCLE" TOP HAT',
    description:
      'Formal top hat. "Only 15 exist. You are not one of them."',
    price: "$140.00",
    badge: "SOLD OUT",
    requisitionId: "HAT-IC-004",
  },
  {
    name: '"100% REVELATION" DAD CAP',
    description:
      'Embroidered. "139 consecutive revelations. Zero failures. The Oracle reveals."',
    price: "$29.00",
    badge: "COMING SOON",
    requisitionId: "CAP-100-005",
  },
  {
    name: '"ELIXIR OF LIFE" MUG',
    description:
      "Ceramic mug. Recipe printed on side: vodka, milk, eggs, OJ. \"Each sip extends your life by 7 years (not verified).\"",
    price: "$19.00",
    badge: "COMING SOON",
    requisitionId: "MUG-ELIXIR-006",
  },
  {
    name: '"GOBBLER\'S KNOB TERMINAL" MOUSEPAD',
    description:
      "XXL mousepad with terminal aesthetic, green-on-black.",
    price: "$24.00",
    badge: "COMING SOON",
    requisitionId: "PAD-TERM-007",
  },
  {
    name: '"BUREAU OF BIOLOGICAL RESEARCH" POSTER',
    description:
      "18x24 print. Species dossier layout with hibernation vitals.",
    price: "$29.00",
    badge: "COMING SOON",
    requisitionId: "POS-BIO-008",
  },
];

/* ─── Badge component ─── */
function Badge({ type }: { type: "COMING SOON" | "SOLD OUT" }) {
  const isSoldOut = type === "SOLD OUT";
  return (
    <span
      className="inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] rounded border"
      style={{
        fontFamily: "var(--font-mono)",
        color: isSoldOut ? "#ff4444" : "#ffaa00",
        borderColor: isSoldOut ? "#ff4444" : "#ffaa00",
        backgroundColor: isSoldOut
          ? "rgba(255, 68, 68, 0.08)"
          : "rgba(255, 170, 0, 0.08)",
      }}
    >
      {type}
    </span>
  );
}

/* ─── Product card ─── */
function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.badge === "SOLD OUT";

  return (
    <div className="merch-card group rounded-lg overflow-hidden transition-all duration-300">
      {/* Image placeholder */}
      <div
        className="relative flex items-center justify-center"
        style={{
          aspectRatio: "1 / 1",
          backgroundColor: "#060610",
          borderBottom: "1px solid #1a1a2e",
        }}
      >
        {/* Requisition ID watermark */}
        <span
          className="absolute top-3 left-3 text-[9px] tracking-[0.2em]"
          style={{ fontFamily: "var(--font-mono)", color: "#333" }}
        >
          REQ#{product.requisitionId}
        </span>

        {/* Product name as placeholder */}
        <p
          className="text-center px-6 text-xs leading-relaxed tracking-[0.1em]"
          style={{ fontFamily: "var(--font-mono)", color: "#444" }}
        >
          {product.name}
        </p>

        {/* Classification stamp */}
        <span
          className="absolute bottom-3 right-3 text-[9px] tracking-[0.2em]"
          style={{ fontFamily: "var(--font-mono)", color: "#333" }}
        >
          DEPT. OF SUPPLY CHAIN
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-sm leading-snug"
            style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
          >
            {product.name}
          </h3>
          {product.badge && <Badge type={product.badge} />}
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", color: "#666" }}
        >
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span
            className="text-sm tracking-wide"
            style={{
              fontFamily: "var(--font-mono)",
              color: isSoldOut ? "#ff4444" : "#00ff88",
              textDecoration: isSoldOut ? "line-through" : "none",
            }}
          >
            {product.price}
          </span>

          <button
            disabled
            className="px-4 py-1.5 text-[10px] tracking-[0.15em] rounded transition-colors cursor-not-allowed"
            style={{
              fontFamily: "var(--font-mono)",
              color: isSoldOut ? "#444" : "#666",
              border: isSoldOut ? "1px solid #333" : "1px solid rgba(255, 170, 0, 0.3)",
              backgroundColor: "transparent",
            }}
          >
            {isSoldOut ? "UNAVAILABLE" : "REQUISITION"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function MerchPage() {
  return (
    <main
      className="min-h-screen pb-20"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-block mb-10 text-xs tracking-[0.15em] transition-colors hover:opacity-80"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          &lt; RETURN TO HEADQUARTERS
        </Link>

        {/* Title block */}
        <div className="space-y-3">
          <p
            className="text-[11px] tracking-[0.3em]"
            style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
          >
            GROUNDHOGE DAY ECONOMIC AUTHORITY
          </p>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
          >
            DEPARTMENT OF SUPPLY
            <br />
            CHAIN OPERATIONS
          </h1>

          <p
            className="text-xs tracking-[0.2em] pt-1"
            style={{ fontFamily: "var(--font-mono)", color: "#666" }}
          >
            OFFICIAL MERCHANDISE — PROCUREMENT PORTAL
          </p>

          {/* Divider */}
          <div
            className="mt-6 pt-4"
            style={{ borderTop: "1px solid #1a1a2e" }}
          >
            <p
              className="text-[10px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-mono)", color: "#444" }}
            >
              AUTHORIZED PERSONNEL ONLY &bull; CLEARANCE LEVEL: PUBLIC &bull; CATALOG REV. 2026-Q2
            </p>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.requisitionId} product={product} />
          ))}
        </div>
      </div>

      {/* Footer section */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <div
          className="rounded-lg p-8 text-center space-y-6"
          style={{
            backgroundColor: "#0a0a14",
            border: "1px solid #1a1a2e",
          }}
        >
          <p
            className="text-xs leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-mono)", color: "#555" }}
          >
            All merchandise is produced by the Department of Supply Chain
            Operations. Delivery times are determined by the Oracle and are
            non-negotiable. Returns accepted only during leap years.
          </p>

          <div
            className="inline-block px-5 py-2 rounded text-xs tracking-[0.2em]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#ffaa00",
              border: "1px solid rgba(255, 170, 0, 0.3)",
              backgroundColor: "rgba(255, 170, 0, 0.05)",
            }}
          >
            PROCUREMENT STATUS: COMING Q3 2026
          </div>

          <p
            className="text-[9px] tracking-[0.2em] pt-2"
            style={{ fontFamily: "var(--font-mono)", color: "#333" }}
          >
            GROUNDHOGE DAY ECONOMIC AUTHORITY &bull; DEPT. OF SUPPLY CHAIN OPERATIONS &bull; EST. 1887
          </p>
        </div>
      </div>
    </main>
  );
}
