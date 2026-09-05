import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SlimFooter from "@/components/SlimFooter";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} · Docs`,
  description:
    "What Stockpickr does, how a pick is scored, and how a payout is worked out and collected.",
};

const TOC = [
  ["what", `What ${site.word} is`],
  ["stocks", "Tokenized stocks"],
  ["fees", "Trading and fees"],
  ["picks", "Picks"],
  ["scoring", "How a pick is scored"],
  ["eligibility", "Eligibility"],
  ["paid", "What a pick is paid"],
  ["pool", "The pool"],
  ["settlement", "Settlement and claiming"],
  ["leaderboard", "Leaderboard"],
  ["wallets", "Wallets"],
  ["anti-gaming", "Anti gaming"],
];

export default function Docs() {
  return (
    <>
      <div className="bg-hero" aria-hidden="true" />
      <Nav />

      <div className="docs-grid">
        <aside className="docs-toc">
          <span className="mono">CONTENTS</span>
          {TOC.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </aside>

        <main className="docs-body prose">
          <span className="mono">DOCUMENTATION</span>
          <h1>Docs</h1>
          <p className="lead">
            What {site.word} does, how a pick is scored, and how a payout is worked out and
            collected. Where something is not built yet, it says so.
          </p>
          <p className="updated">Last updated 5 September 2026</p>

          <h2 id="what">What {site.word} is</h2>
          <p>
            {site.word} is a social trading terminal for tokenized stocks on Robinhood Chain. You
            trade from your own wallet, post public picks on the stocks you hold, follow other
            pickers, and earn a share of a rewards treasury when your picks are right.
          </p>
          <p>
            Accounts are shared across the whole platform, not stored in your browser. Your handle,
            picks, followers and track record belong to your wallet, so they follow you to any
            device and to the app.
          </p>

          <h2 id="stocks">Tokenized stocks</h2>
          <p>
            Every market here is a tokenized equity on Robinhood Chain, chain ID{" "}
            <code>{site.chainId}</code>. Prices, 24 hour change and volume come from live on chain
            pool data, and each chart is the real trading pair.
          </p>
          <p>
            A tokenized stock tracks the underlying company but is a separate on chain asset. Any
            market cap shown refers to the tokenized supply, not to the company itself.
          </p>

          <h2 id="fees">Trading and fees</h2>
          <p>
            Swaps route through Uniswap V4 on Robinhood Chain and are signed in your own wallet.{" "}
            {site.word} never holds your keys and never takes custody.
          </p>
          <p>
            <b>{site.word} charges nothing to trade.</b> No fee on a buy, no fee on a sell, and
            nothing taken out of what a position made. The only cost of a trade is the liquidity
            pool&apos;s own swap fee and the gas, neither of which is ours and neither of which we
            add to.
          </p>
          <p>
            The rewards treasury is funded separately, by the {site.word} coin. See{" "}
            <a href="#pool">the pool</a> below.
          </p>

          <h2 id="picks">Picks</h2>
          <p>
            A pick is a public, timestamped call that a stock is going up. You can only pick a stock
            you actually hold, so a pick always has your own money behind it.
          </p>
          <p>
            Posting records the stock, the price at that moment, your thesis, and you. That record
            is permanent, and it is your public track record.
          </p>
          <ul>
            <li>Picks are one directional. There is no short side: a pick says the stock goes up.</li>
            <li>
              One reward eligible pick per picker per stock in any <b>30 minute</b> window. Posting
              again inside that window is allowed and stays visible, but it earns nothing.
            </li>
            <li>A pick cannot be edited. The entry price is fixed at the moment you post.</li>
          </ul>

          <h2 id="scoring">How a pick is scored</h2>
          <p>
            Every pick is scored out of 100 at settlement. The weighting is published rather than
            hidden, because a picker should be able to work out why they were paid what they were
            paid.
          </p>
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Weight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Market performance</td>
                  <td>40</td>
                  <td className="st-live">Live</td>
                </tr>
                <tr>
                  <td>Attention</td>
                  <td>25</td>
                  <td className="st-live">Live, likes only</td>
                </tr>
                <tr>
                  <td>Community PnL</td>
                  <td>20</td>
                  <td className="st-soon">Not measured yet</td>
                </tr>
                <tr>
                  <td>Social impact</td>
                  <td>15</td>
                  <td className="st-soon">Not measured yet</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            A score is worked out over the components that can actually be measured today, not out
            of the full 100. Scoring a pick out of components that always return zero would make the
            eligibility bar far harsher than it reads.
          </p>

          <h3>Market performance</h3>
          <p>
            A pick is judged against the market, not against zero. Performance is the stock&apos;s
            move since the pick <b>minus the average move of the market over the same period</b>. On
            a day when everything is up 3%, a stock that managed 3% has picked nothing.
          </p>
          <p>
            A pick that goes down earns nothing. A pick that only keeps pace with the market earns
            nothing. Above that, the score rises steeply at first and then flattens, so being right
            matters much more than being right by an enormous margin on one lucky pick.
          </p>

          <h3>Attention</h3>
          <p>
            Engagement on the pick, normalised against the busiest pick of the cycle on a log scale,
            so a small picker with real engagement still competes with a large one. Today the only
            engagement signal recorded is likes.
          </p>
          <p>
            Attention cannot stand in for performance. The reward weight is scaled by how the pick
            actually did, so a pick that went nowhere is worth nothing however many likes it
            collects.
          </p>

          <div className="soon">
            <p>
              <b>Community PnL and social impact are not being measured yet.</b> Attributing the
              profit and loss of people who acted on a pick, and counting the followers a pick
              produced, both need tracking that does not exist yet. Until it does they score zero
              for everybody and are left out of the denominator, rather than being estimated.
            </p>
          </div>

          <h2 id="eligibility">Eligibility</h2>
          <ul>
            <li>
              The pick must score at least <b>35 out of 100</b> on the measurable components.
            </li>
            <li>The stock must beat the market benchmark over the period. Flat or down earns nothing.</li>
            <li>The stock must be one we can price at settlement.</li>
            <li>
              The pick must not be inside its own 30 minute cooldown, flagged, or a duplicate.
            </li>
          </ul>

          <h2 id="paid">What a pick is paid</h2>
          <p>
            Eligible picks are given a weight, and each picker takes the share of the cycle&apos;s
            pool their weights represent.
          </p>
          <p>
            <code>weight = score^1.3 × performance</code>
          </p>
          <p>
            The exponent is what makes the scale convex: an excellent pick is worth more than
            proportionally more than a mediocre one.
          </p>
          <p>Three caps then apply, in order:</p>
          <ul>
            <li>
              <b>10%</b> of a cycle is the most any single pick can represent.
            </li>
            <li>
              <b>20%</b> of a cycle is the most any single picker can take across all their picks.
            </li>
            <li>
              <b>$2.50</b> is the hard ceiling on what one pick can ever pay, whatever the treasury
              holds. The other two caps are shares of a pool and grow with it; this one does not.
            </li>
          </ul>
          <p>
            Anything the ceiling trims is not handed to somebody else. It stays in the treasury,
            because nobody else earned it either.
          </p>

          <h2 id="pool">The pool</h2>
          <p>
            Rewards are paid from the treasury wallet. It is funded by{" "}
            <b>{Math.round(site.poolCut * 100)}% of the trading fees on the {site.word} coin</b>,
            which is what the coin is for: a picker is paid out of the coin&apos;s activity, not out
            of another trader&apos;s order.
          </p>
          <p>
            A cycle does not spend the treasury. It takes a <b>small percentage of what is free</b>,
            where free means the balance minus what earlier cycles have already promised and not yet
            paid, minus a reserve for the gas those payouts will cost.
          </p>
          <p>
            That is deliberate. Handing out a large share of the treasury for one cycle of picks
            would empty it in days and make an early picker worth more than a later one for no
            reason. Taking a slice lets the pool decay gently instead.
          </p>

          <h2 id="settlement">Settlement and claiming</h2>
          <p>
            At settlement, every pick is scored from data the server holds and prices the server
            fetches itself. The browser is never asked what someone is owed, because the browser
            belongs to the person being paid. The result is published as a Merkle root, so the full
            list of payouts can be checked against a single hash.
          </p>
          <p>
            <b>Rewards are claimed, not pushed.</b> Open the Rewards tab, where a settled cycle
            shows what it paid you and which of your picks earned it. Pressing Claim sends the ETH
            to your wallet. A cycle can be claimed once per wallet: the receipt is written before the
            transfer goes out, so a repeated or simultaneous request finds it already taken rather
            than paying twice. A payout that fails does not count as claimed and can be tried again.
          </p>
          <div className="soon">
            <p>
              Settlement is run manually at the moment rather than on a fixed clock, so cycles do not
              close at a set hour. A distributor contract exists for the alternative, where pickers
              claim on chain against the published root with no server key involved. It is not
              deployed yet.
            </p>
          </div>

          <h2 id="leaderboard">Leaderboard</h2>
          <p>Three boards, each ranking only the people it lists.</p>
          <ul>
            <li>
              <b>Rewards claimed.</b> What a picker has actually collected, taken from the payout
              receipts rather than from an estimate. A picker who has claimed nothing is not on this
              board.
            </li>
            <li>
              <b>By PnL.</b> Realised profit only, from positions that have been closed. An open
              position is not a result yet, and marking it live made the board swing on every tick.
              Pickers with no closed trade are not ranked last, they are not on this board at all.
            </li>
            <li>
              <b>By followers.</b> Reach, which needs no threshold to mean something.
            </li>
          </ul>
          <p>Equal figures share a place rather than being split by list order.</p>

          <h2 id="wallets">Wallets</h2>
          <p>
            Signing in creates or connects a non custodial wallet. Connect a wallet you already use,
            or sign in with an email and have one created for you with no seed phrase to manage.
          </p>
          <p>
            You can link <b>several wallets to one account</b>. Holdings are then read across all of
            them and shown as one portfolio, and your handle and track record stay attached to the
            account rather than to any single address. {site.word} never asks for a seed phrase or a
            private key.
          </p>

          <h2 id="anti-gaming">Anti gaming</h2>
          <p>
            The caps above are the main defence: no pick and no picker can take an outsized share,
            and nothing can pay more than $2.50 however the numbers fall. Performance is measured
            against the market so a general rally pays nobody, and reward weight is tied to
            performance so engagement alone cannot earn. The 30 minute cooldown stops the same pick
            being posted over and over: the first one in a window counts and the repeats earn
            nothing, which settlement enforces rather than only warning about.
          </p>
          <p>
            Scoring runs on the server from prices the server fetches, so a picker cannot report
            their own result. Wash trading, self dealing, duplicate accounts and manufactured
            engagement are grounds for a pick or an account to earn nothing.
          </p>

          <hr />
          <p style={{ fontSize: "13.5px" }}>
            {site.word} is a trading product, not investment advice. Picks are opinions posted by
            users, not recommendations. Prices can move against you and you can lose money. Read the{" "}
            <Link href="/terms">Terms</Link>.
          </p>
        </main>
      </div>

      <SlimFooter />
    </>
  );
}
