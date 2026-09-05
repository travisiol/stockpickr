"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

/* The five panels under the hero. Everything here is a product mock: the
   figures are illustrative, sized to match the terminal's own early-days
   seed rather than inventing a track record nobody has yet. */

const LEADERS = [
  { rank: 1, med: "g", name: "sightline", handle: "@sightline", start: 12480.55, hue: 0 },
  { rank: 2, med: "s", name: "vega", handle: "@vega.gm", start: 8306.2, hue: 140 },
  { rank: 3, med: "b", name: "merit", handle: "@merit_daily", start: 5122.8, hue: 210 },
  { rank: 4, med: "p", name: "quill", handle: "@quillpicks", start: 4765.0, hue: 300 },
];

const money = (n: number) =>
  "+$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const av = (hue: number, sat = 1.15): React.CSSProperties => ({
  filter: `hue-rotate(${hue}deg) saturate(${sat})`,
});

/* the pickers keep earning while the tab is open */
function useLeaderboard() {
  const [vals, setVals] = useState(() => LEADERS.map((l) => l.start));

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setVals((prev) =>
        prev.map((v, i) => {
          // higher ranks earn a little faster, and not every row moves every tick
          if (Math.random() < 0.35) return v;
          return v + (prev.length - i) * (0.4 + Math.random() * 3.2);
        })
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return vals;
}

/* the fee-split ring fills 0 -> 25% when it first scrolls into view */
function useSplitRing() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [pct, setPct] = useState(0);
  const [dash, setDash] = useState("0 326.7");
  const C = 2 * Math.PI * 52;
  const target = Math.round(site.poolCut * 100);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const paint = (v: number) => {
      setDash(`${((C * v) / 100).toFixed(1)} ${C.toFixed(1)}`);
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (reduce) {
        paint(target);
        setPct(target);
        return;
      }
      requestAnimationFrame(() => paint(target)); // the arc eases via CSS
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setPct(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.disconnect();
          }
        }),
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [C, target]);

  return { ref, pct, dash };
}

/* the treasury balance is read from chain, never hardcoded. With no treasury
   address configured there is nothing honest to show, so it says so. */
function useTreasury() {
  const [text, setText] = useState("Not yet");

  useEffect(() => {
    if (!site.treasury) return;
    let live = true;
    /* through our own relay, not site.rpc directly: the public RPC answers
       with a doubled Access-Control-Allow-Origin that browsers reject */
    const load = () =>
      fetch("/api/rpc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [site.treasury, "latest"],
        }),
      })
        .then((r) => r.json())
        .then((j) => {
          if (!live || !j.result) return;
          const eth = Number(BigInt(j.result)) / 1e18;
          setText(
            eth.toLocaleString("en-US", { maximumFractionDigits: eth >= 1 ? 4 : 6 }) + " ETH"
          );
        })
        .catch(() => live && setText("Not yet"));
    load();
    const id = setInterval(load, 60000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  return text;
}

export default function Bento() {
  const vals = useLeaderboard();
  const ring = useSplitRing();
  const treasury = useTreasury();
  const cut = Math.round(site.poolCut * 100);

  return (
    <section className="bento-sec" id="rewards">
      <div className="wrap">
        <h2>never miss the pick again</h2>
        <p className="sub">the only social-first stock trading app</p>
        <div className="bento">

          {/* 1 — leaderboard */}
          <div className="b-card">
            <span className="mono">LEADERBOARD</span>
            <h3>become a legend, top the leaderboard</h3>
            {LEADERS.map((l, i) => (
              <div className={`lbr${l.med === "p" ? " fade" : ""}`} key={l.handle}>
                <span className={`med ${l.med}`}>{l.rank}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="av" src="/avatar.svg" alt="" style={av(l.hue)} />
                <span className="nm">
                  <b>{l.name}</b>
                  <small>{l.handle}</small>
                </span>
                <span className="amt">{money(vals[i])}</span>
              </div>
            ))}
          </div>

          {/* 2 — feed */}
          <div className="b-card">
            <span className="mono">FEED</span>
            <h3>discover and follow top pickers</h3>
            <div className="feed-panel">
              <div className="fp-post">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="fp-av" src="/avatar.svg" alt="" style={av(0)} />
                <div className="fp-body">
                  <div className="fp-h">
                    <b>sightline</b>
                    <span className="fp-chip">Pick</span>
                    <span className="fp-time">5m</span>
                  </div>
                  <div className="fp-txt">networking segment still isn&apos;t priced in</div>
                  <div className="fp-pos">
                    <span className="l">
                      <b>NVDAx</b> <small>· Long</small>
                    </span>
                    <span className="r">
                      $23.2K
                      <br />
                      +14.3%
                    </span>
                  </div>
                  <div className="fp-meta">
                    <span>♥ 293</span>
                    <span>8,492</span>
                    <span>3 older</span>
                  </div>
                </div>
              </div>
              <div className="fp-post">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="fp-av" src="/avatar.svg" alt="" style={av(140, 1.2)} />
                <div className="fp-body">
                  <div className="fp-h">
                    <b>vega</b>
                    <span className="fp-chip buy">Buy</span>
                    <span className="fp-time">12m</span>
                  </div>
                  <div className="fp-txt">
                    added <b style={{ color: "var(--accent)" }}>$34.3K HOODx</b> at $98.22
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — alerts */}
          <div className="b-card">
            <span className="mono">ALERTS</span>
            <h3>real time pings when the best are buying</h3>
            <div className="mini-scene" aria-hidden="true">
              <div className="ping-stack">
                <div className="ping">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.svg" alt="" />
                  <div className="ping-body">
                    <div className="ping-t">
                      <b>NVDAx is up 4.2%</b>
                      <span>9:41 AM</span>
                    </div>
                    <div className="ping-s">
                      <span className="dot" />
                      50 top pickers bought $88,203.12
                    </div>
                  </div>
                </div>
                <div className="ping-under" />
                <div className="ping-under u2" />
              </div>
            </div>
          </div>

          {/* 4 — rewards treasury */}
          <div className="b-card">
            <span className="mono">REWARDS TREASURY</span>
            <h3>{cut}% of the fees of our coin goes to the rewards pool</h3>
            <div className="split" aria-hidden="true">
              <svg viewBox="0 0 120 120" className="split-ring" ref={ring.ref}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e6e6e6" strokeWidth="15" />
                <circle
                  id="splitArc"
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeDasharray={ring.dash}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="split-mid">
                <b>{ring.pct}%</b>
                <small>to pickers</small>
              </div>
            </div>
            <div className="split-legend">
              <span>
                <i className="dot-acc" />
                Picker Rewards treasury
              </span>
              <span>
                <i className="dot-mut" />
                {site.word} coin fees
              </span>
            </div>
            <div className="treasury-line">
              <span>Treasury wallet, on-chain</span>
              <b>{treasury}</b>
            </div>
          </div>

          {/* 5 — one click to buy */}
          <div className="b-card">
            <span className="mono">ONE CLICK TO BUY</span>
            <h3>fund with your wallet</h3>
            <div className="buymock" aria-hidden="true">
              <div className="bm-tabs">
                <span className="on">Buy</span>
                <span>Sell</span>
              </div>
              <div className="bm-amt">$ 25</div>
              <div className="bm-chips">
                <span>$10</span>
                <span>$100</span>
                <span>$500</span>
                <span>$1000</span>
              </div>
              <div className="bm-avail">
                <span>$3,563.34 available</span>
                <span>No fee</span>
              </div>
              <div className="bm-fees">
                <div>
                  <span>Order</span>
                  <b>$25.00</b>
                </div>
                <div>
                  <span>{site.word} fee</span>
                  <b className="blue">None</b>
                </div>
                <div>
                  <span>Attribution</span>
                  <b className="blue">@sightline</b>
                </div>
                <div>
                  <span>Total</span>
                  <b>$25.00</b>
                </div>
              </div>
              <div className="bm-buy">Buy NVDAx</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
