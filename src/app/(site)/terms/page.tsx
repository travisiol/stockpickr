import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SlimFooter from "@/components/SlimFooter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} · Terms of Service`,
  description: `The rules for using ${site.name}.`,
};

export default function Terms() {
  return (
    <>
      <div className="bg-hero" aria-hidden="true" />
      <Nav />

      <main className="pg prose">
        <span className="mono">LEGAL</span>
        <h1>Terms of Service</h1>
        <p className="lead">The rules for using {site.word}.</p>
        <p className="updated">Last updated 5 September 2026</p>

        <div className="note">
          <p>
            <b>This is a plain language draft, not reviewed advice.</b> Trading tokenized securities
            is heavily regulated and the rules differ by country. Have a lawyer review this, and
            confirm your licensing position, before you take real money.
          </p>
        </div>

        <h2>Accepting these terms</h2>
        <p>
          By using {site.word} you agree to these terms. If you do not agree, do not use the
          product. You must be at least 18 and legally able to enter a contract.
        </p>

        <h2>Not investment advice</h2>
        <p>
          {site.word} is a trading and publishing tool. Nothing on it is investment advice, a
          recommendation, or an offer to buy or sell anything. Picks are opinions posted by other
          users. We do not verify them, endorse them, or check whether they suit your circumstances.
          Track records show past results, which do not predict future results.
        </p>

        <h2>Risk</h2>
        <p>
          Trading tokenized stocks carries real risk. Prices can move sharply against you and you
          can lose money, including everything you put in. Tokenized assets also carry smart
          contract, network, liquidity and counterparty risk, and can trade at a different price
          from the underlying asset. You trade at your own risk.
        </p>

        <h2>Eligibility and access</h2>
        <p>
          You are responsible for making sure using {site.word} is lawful where you are. We may
          restrict access from certain jurisdictions, and may suspend or close accounts to comply
          with the law or to protect the platform.
        </p>

        <h2>Your account and wallet</h2>
        <p>
          Wallets are non custodial. We do not hold your keys and cannot recover them or reverse a
          signed transaction. You are responsible for keeping your credentials and device secure,
          and for every action taken through your account.
        </p>

        <h2>Fees</h2>
        <p>
          <b>{site.word} charges nothing to trade.</b> No fee on a buy, no fee on a sell, and
          nothing taken out of what a position made. The only cost of a trade is the liquidity
          pool&apos;s own swap fee and the network gas, neither of which is ours.
        </p>
        <p>
          The rewards treasury is funded separately: {Math.round(site.poolCut * 100)}% of the
          trading fees on the {site.word} coin is allocated to the Picker Rewards pool. Fees may
          change, and we will publish any change before it takes effect.
        </p>

        <h2>Picker Rewards</h2>
        <ul>
          <li>
            Rewards are discretionary and are not a security, an investment, a guaranteed payment or
            a right to future income.
          </li>
          <li>
            Eligibility, scoring, caps and the reward formula may be adjusted at any time to keep the
            system fair. The current weights and caps are published in the{" "}
            <Link href="/docs">docs</Link>.
          </li>
          <li>
            We may withhold or reverse rewards linked to fraud, manipulation or breach of these
            terms.
          </li>
        </ul>

        <h2>Acceptable use</h2>
        <p>You must not:</p>
        <ul>
          <li>Wash trade, self trade, or trade circularly to inflate volume or reward score.</li>
          <li>Operate multiple accounts, sybil accounts, bots or engagement farms.</li>
          <li>Buy, sell or coordinate fake views, follows or interactions.</li>
          <li>Post picks intended to manipulate a market, or coordinate a pump.</li>
          <li>
            Post unlawful, misleading, abusive or infringing content, or impersonate anyone.
          </li>
          <li>Scrape, reverse engineer, overload or interfere with the platform or its security.</li>
        </ul>
        <p>
          Breaching these rules can mean zero reward score, forfeited rewards, or a closed account.
        </p>

        <h2>Your content</h2>
        <p>
          You keep ownership of the picks and content you post. You grant us a licence to host,
          display and distribute it in the product, including in feeds, leaderboards and track
          records. You are responsible for what you publish. We may remove content that breaks these
          terms.
        </p>

        <h2>Availability</h2>
        <p>
          We aim to keep {site.word} running but do not guarantee uninterrupted access. Market data
          and charts come from third parties and may be delayed, incomplete or wrong. Features may
          change or be withdrawn.
        </p>

        <h2>Liability</h2>
        <p>
          To the fullest extent the law allows, {site.legalEntity} is not liable for trading losses,
          lost profits, or indirect or consequential damage arising from your use of the product.
          Nothing here excludes liability that cannot lawfully be excluded.
        </p>

        <h2>Termination</h2>
        <p>
          You may stop using {site.word} at any time. We may suspend or terminate access if you
          breach these terms or if we must do so by law. Your non custodial wallet remains yours.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms. Material changes will be notified in the product, and
          continuing to use {site.word} means you accept them.
        </p>
      </main>

      <SlimFooter />
    </>
  );
}
