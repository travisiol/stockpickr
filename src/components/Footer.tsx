"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";

export default function Footer() {
  const ca = site.ca;
  const [shown, setShown] = useState(ca || "soon");

  const copy = () => {
    if (!ca || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(ca)
      .then(() => {
        setShown("Copied");
        setTimeout(() => setShown(ca), 1200);
      })
      .catch(() => {});
  };

  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-left">
          <span
            className="wordmark"
            style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={30} height={30} />
            <span>
              {site.markHead}
              <i>{site.markTail}</i>
            </span>
          </span>
          <p
            className={`foot-ca${ca ? " live" : ""}`}
            title={ca ? "Copy the contract address" : "Contract address at launch"}
            onClick={copy}
          >
            CA: <span id="footCaVal">{shown}</span>
          </p>
          <small>© {new Date().getFullYear()} {site.legalEntity}.</small>
        </div>

        <div className="foot-cols">
          <div className="fcol">
            <span className="mono">PRODUCT</span>
            <Link href="/dashboard">Trade</Link>
            <a href="/#how">How it works</a>
            <a href="/#faq">FAQ</a>
            <Link href="/docs">Docs</Link>
          </div>
          <div className="fcol">
            <span className="mono">SOCIAL</span>
            <a href={site.x} target="_blank" rel="noopener">
              X / Twitter
            </a>
          </div>
          <div className="fcol">
            <span className="mono">LEGAL</span>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
