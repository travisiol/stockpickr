"use client";

import Link from "next/link";
import { useState } from "react";
import { site, shortCa } from "@/lib/site";

/* Contract address: three characters until you hover it, click to copy.
   Before launch there is no address, so the pill says "soon" and stops
   behaving like a button. */
function CaPill() {
  const ca = site.ca;
  const [full, setFull] = useState(false);
  const [label, setLabel] = useState("CA:");

  const copy = () => {
    if (!ca || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(ca)
      .then(() => {
        setLabel("Copied");
        setTimeout(() => setLabel("CA:"), 1200);
      })
      .catch(() => {});
  };

  return (
    <button
      className="ca-pill"
      type="button"
      data-empty={ca ? undefined : "1"}
      title={ca || "Contract address at launch"}
      aria-label="Contract address"
      onMouseEnter={() => setFull(true)}
      onMouseLeave={() => setFull(false)}
      onFocus={() => setFull(true)}
      onBlur={() => setFull(false)}
      onClick={copy}
    >
      <span className="ca-lbl">{label}</span>
      <span className="ca-val">{full && ca ? ca : shortCa(ca)}</span>
    </button>
  );
}

export default function Nav() {
  return (
    <nav className="nav">
      <Link
        className="wordmark"
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" width={26} height={26} />
        <span>
          {site.markHead}
          <i>{site.markTail}</i>
        </span>
      </Link>

      <div className="nav-links">
        <a href="/#how">How it works</a>
        <a href="/#faq">FAQ</a>
        <Link href="/docs">Docs</Link>
      </div>

      <div className="nav-actions">
        <CaPill />
        <a
          className="x-link"
          href={site.x}
          target="_blank"
          rel="noopener"
          aria-label={`${site.name} on X`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <Link className="store-pill" href="/get" aria-label={`Get ${site.name}`}>
          <span>
            <b>Download App</b>
          </span>
        </Link>
        <Link className="login-pill" href="/dashboard">
          Login
        </Link>
      </div>
    </nav>
  );
}
