"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "PROPHECY", href: "/#prophecy", hash: true },
  { label: "ORACLE TERMINAL", href: "/#oracle-terminal", hash: true },
  { label: "LEGENDS", href: "/legends", hash: false },
  { label: "ARCHIVES", href: "/prophecy-archives", hash: false },
  { label: "HIBERNATE", href: "/hibernate", hash: false },
  { label: "CARDS", href: "/cards", hash: false },
] as const;

export default function NavHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, link: (typeof NAV_LINKS)[number]) {
    if (link.hash && pathname === "/") {
      e.preventDefault();
      const id = link.href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    } else {
      setOpen(false);
    }
  }

  return (
    <nav
      className="fixed left-0 right-0 z-40 flex items-center justify-between px-6"
      style={{
        top: 36,
        height: 40,
        background: "#0a0a0f",
        borderBottom: "1px solid #1a1a2e",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="tracking-widest text-xs hover:opacity-80 transition-opacity"
        style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
      >
        GROUNDHOGE DAY
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={(e) => handleClick(e, link)}
            className="text-xs transition-colors duration-200"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#666666",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#ffaa00";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#666666";
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1 cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span
          className="block w-4 h-px transition-transform duration-200"
          style={{
            background: "#666666",
            transform: open ? "rotate(45deg) translateY(2.5px)" : "none",
          }}
        />
        <span
          className="block w-4 h-px transition-opacity duration-200"
          style={{
            background: "#666666",
            opacity: open ? 0 : 1,
          }}
        />
        <span
          className="block w-4 h-px transition-transform duration-200"
          style={{
            background: "#666666",
            transform: open ? "rotate(-45deg) translateY(-2.5px)" : "none",
          }}
        />
      </button>

      {/* Mobile menu */}
      {open && (
        <div
          className="absolute left-0 right-0 flex flex-col md:hidden px-6 py-4 gap-4"
          style={{
            top: 40,
            background: "#0a0a0f",
            borderBottom: "1px solid #1a1a2e",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleClick(e, link)}
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#666666",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
