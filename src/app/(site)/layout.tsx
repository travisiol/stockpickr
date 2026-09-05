import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} · ${site.tagline}`,
  description:
    "Buy a tokenized stock, then pick it. Trading is free, and a quarter of the trading fees on our coin goes to the pickers whose picks actually work.",
  applicationName: site.name,
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description:
      "Get paid to pick tokenized stocks. Your track record is public, on-chain, and yours.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Satoshi carries the headings, Roboto Mono the overlines. Body copy
            stays on the system stack, so there is no third request. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@400,500,700,900&display=swap"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
