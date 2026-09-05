import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bento from "@/components/Bento";
import HowItWorks from "@/components/HowItWorks";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* the ridges sit at the top of the page and dissolve into white on the
          way down, so every section below lands on a clean ground */}
      <div className="bg-hero" aria-hidden="true" />

      <Nav />

      <header className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill-badge">
              <span className="pb-dot" />
              <b>{Math.round(site.poolCut * 100)}% of coin fees</b> go to the pickers
            </span>
            <h1>
              Get Paid To <em>Pick</em> Tokenized Stocks
            </h1>
            <p className="sub">
              Buy a tokenized stock, then pick it. Trading here is free, and a quarter of the
              trading fees on our coin goes to the pickers whose picks actually work. The better
              the pick, the bigger the cut. Your track record is public, on-chain, and yours.
            </p>
            <div className="cta-row">
              <Link className="btn hero-cta primary-i" href="/dashboard">
                Start trading
              </Link>
              <Link className="store-pill hero-store" href="/get" aria-label={`Get ${site.name}`}>
                <span>
                  <b>Download App</b>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <Bento />
      <HowItWorks />
      <Faq />
      <Footer />

      <Reveal />
    </>
  );
}
