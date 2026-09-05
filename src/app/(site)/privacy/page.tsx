import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SlimFooter from "@/components/SlimFooter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} · Privacy Policy`,
  description: `What ${site.name} collects, why, and what you control.`,
};

export default function Privacy() {
  return (
    <>
      <div className="bg-hero" aria-hidden="true" />
      <Nav />

      <main className="pg prose">
        <span className="mono">LEGAL</span>
        <h1>Privacy Policy</h1>
        <p className="lead">What {site.word} collects, why, and what you control.</p>
        <p className="updated">Last updated 5 September 2026</p>

        <div className="note">
          <p>
            <b>This is a plain language draft, not reviewed advice.</b> It is written for a product
            that is still pre launch. Before going live, have a lawyer review it against the rules
            that apply in the markets you operate in.
          </p>
        </div>

        <h2>Who we are</h2>
        <p>
          {site.legalEntity} operates {site.word.toLowerCase()} and the {site.word} trading
          terminal. If you have a privacy question, contact us through the details on our site.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <b>Account information.</b> The email address you sign in with, or the public wallet
            address you connect, plus the display name, handle and profile picture you choose.
          </li>
          <li>
            <b>Public activity.</b> Picks you post, including asset, direction, entry price, thesis
            and timestamp. Follows, likes and saves. This content is public by design and forms your
            track record.
          </li>
          <li>
            <b>Trading activity.</b> Orders you place, positions, fees paid and rewards earned.
          </li>
          <li>
            <b>Product analytics.</b> How picks are viewed and interacted with, which is what the
            rewards system measures. We record unique interactions rather than building advertising
            profiles.
          </li>
          <li>
            <b>Technical data.</b> Device and browser information, approximate location derived from
            IP, and log data used for security and abuse prevention.
          </li>
        </ul>

        <h2>What we do not collect</h2>
        <p>
          We never have your private keys or seed phrase. Wallets are non custodial. We do not sell
          your personal data.
        </p>

        <h2>Why we use it</h2>
        <ul>
          <li>To run the product: executing trades, showing markets and maintaining your account.</li>
          <li>
            To calculate Picker Rewards, which requires measuring genuine engagement and attributing
            trading activity to picks.
          </li>
          <li>To detect fraud, including wash trading, sybil accounts and bot engagement.</li>
          <li>To meet legal and regulatory obligations.</li>
        </ul>

        <h2>Public information</h2>
        <p>
          Your handle, profile picture, picks, track record, follower counts and leaderboard
          position are visible to everyone. Your email address is never shown publicly. On chain
          transactions are permanently public on the underlying network and are outside our control.
        </p>

        <h2>Service providers</h2>
        <p>
          We share the minimum necessary data with providers that make the product work, including
          our authentication and wallet infrastructure provider, and market data providers for live
          prices and charts. They are bound to use it only to provide their service to us.
        </p>

        <h2>Cookies and storage</h2>
        <p>
          We use browser storage to keep you signed in and to remember preferences such as your
          watchlist and layout. We do not use third party advertising trackers.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live you may have the right to access, correct, export or delete
          your personal data, to object to certain processing, and to withdraw consent. Contact us
          to exercise these rights. Note that public picks and on chain transactions may not be
          fully erasable, and we may need to retain certain records to meet legal obligations.
        </p>

        <h2>Retention</h2>
        <p>
          We keep account and trading records for as long as your account is open and afterwards for
          as long as required by law or to resolve disputes. Analytics used for reward calculation is
          retained in aggregate form.
        </p>

        <h2>Children</h2>
        <p>
          {site.word} is not for anyone under 18. We do not knowingly collect data from children.
        </p>

        <h2>Changes</h2>
        <p>
          If we make material changes we will update the date above and notify you in the product.
          Continuing to use {site.word} after a change means you accept the updated policy.
        </p>
      </main>

      <SlimFooter />
    </>
  );
}
