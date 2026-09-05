import { site } from "@/lib/site";

const cut = Math.round(site.poolCut * 100);

const QA: { q: string; a: string; open?: boolean }[] = [
  {
    q: "How do pickers get paid?",
    open: true,
    a: `Trading on ${site.word} is free. The rewards come from the coin instead: ${cut}% of the trading fees on the ${site.word} coin is sent to a treasury wallet on Robinhood Chain, and that wallet is the Picker Rewards pool. It pays the pickers whose picks were right, judged against how the market itself moved over the same period, so a pick carried along by a general rally earns nothing. A pick that goes down earns nothing. Follower count on its own earns nothing either.`,
  },
  {
    q: "Are the stocks real?",
    a: "Every market is a stock tokenized 1:1, priced off the underlying market and settled on-chain. You're buying exposure to the actual equity, nothing here is simulated.",
  },
  {
    q: "What makes a pick eligible?",
    a: "It has to exist before the move, attract real viewers, and clear a minimum level of genuine activity. One reward-eligible pick per stock per cooldown window, you can post more, but spam doesn't stack rewards.",
  },
  {
    q: "Can whales or bots farm the pool?",
    a: "Volume earns with diminishing returns, attention is counted in unique users rather than raw impressions, and fraud checks run before any payout. Wash trading, sybil accounts, and coordinated engagement score zero, or get the account flagged out entirely.",
  },
  {
    q: "Do I need to be right to earn?",
    a: "Performance counts, but it doesn't dominate. A pick that genuinely surfaces a stock early and brings real traders can still earn if the move is modest, the pool rewards market discovery, not just prediction.",
  },
  {
    q: "When do payouts land?",
    a: "Once eligibility and fraud checks finish, rewards go straight to your wallet. No claims process, no waiting on us.",
  },
];

export default function Faq() {
  return (
    <section className="lsec" id="faq" style={{ paddingTop: 96 }}>
      <div className="inner">
        <h2>
          Common <em>questions</em>
        </h2>
        <p className="lead">The short version of how the money moves.</p>
        <div className="faq">
          {QA.map((x) => (
            <details key={x.q} open={x.open}>
              <summary>{x.q}</summary>
              <div className="a">{x.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
