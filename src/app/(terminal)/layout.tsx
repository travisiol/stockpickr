import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import "./terminal.css";

/* The terminal is its own root layout. Its stylesheet restyles `body` and the
   whole type scale for a dark trading UI, so keeping it out of the marketing
   site's document is what stops the two from fighting over the cascade. */

export const metadata: Metadata = {
  title: `${site.name} · Terminal`,
  description: `Trade tokenized stocks, post picks, and earn from the ${site.name} rewards pool.`,
  robots: { index: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
