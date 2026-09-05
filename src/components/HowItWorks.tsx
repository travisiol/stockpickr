"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

const STEPS = [
  {
    n: "01",
    h: "Buy the stock",
    p: "Every tokenized stock trades around the clock with live on-chain pricing. Buy it with Robinhood ETH and the swap settles straight into your own wallet.",
  },
  {
    n: "02",
    h: "Make the pick",
    p: "Holding it is what earns you the right to pick it, so every thesis has real money behind it. Yours is stamped at the current price and on your public record from that second.",
  },
  {
    n: "03",
    h: "Get paid",
    p: `${Math.round(
      site.poolCut * 100
    )}% of every trading fee lands in the Picker Rewards pool, then goes out to the picks that earned it: how the pick performed, how many real people acted on it, and how much trading it drove.`,
  },
];

/* Scrolling down drives the three steps sideways while the section is pinned.
   The pin lasts exactly the distance the track needs and never longer, and the
   whole block fades in on the way into the pin and back out on the way past. */
export default function HowItWorks() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const stick = useRef<HTMLDivElement | null>(null);
  const view = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const bar = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const w = wrap.current,
      t = track.current,
      v = view.current,
      st = stick.current,
      b = bar.current;
    if (!w || !t || !v || !st) return;

    const pinned = () =>
      matchMedia("(min-width:861px)").matches &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = false;
    const draw = () => {
      raf = false;
      if (!pinned()) {
        t.style.transform = "";
        w.style.height = "";
        st.style.opacity = "";
        st.style.transform = "";
        return;
      }
      const travel = Math.max(0, t.scrollWidth - v.clientWidth);
      const want = Math.round(innerHeight + travel);
      if (w.offsetHeight !== want) w.style.height = want + "px";

      const run = w.offsetHeight - innerHeight;
      const past = Math.min(Math.max(-w.getBoundingClientRect().top, 0), run);
      const p = run > 0 ? past / run : 0;
      t.style.transform = `translate3d(${-travel * p}px,0,0)`;
      if (b) b.style.width = (p * 100).toFixed(2) + "%";

      const raw = -w.getBoundingClientRect().top;
      const ease = innerHeight * 0.55;
      const inF = Math.min(1, Math.max(0, (raw + ease) / ease));
      const outF = Math.min(1, Math.max(0, (run + ease - raw) / ease));
      const o = Math.min(inF, outF);
      st.style.opacity = o.toFixed(3);
      st.style.transform = `translate3d(0,${((1 - o) * 26).toFixed(1)}px,0)`;

      const mid = v.getBoundingClientRect().left + v.clientWidth / 2;
      [...t.children].forEach((el) => {
        const r = el.getBoundingClientRect();
        el.classList.toggle("lit", r.left < mid && r.right > mid);
      });
    };

    const tick = () => {
      if (!raf) {
        raf = true;
        requestAnimationFrame(draw);
      }
    };
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    draw();
    return () => {
      removeEventListener("scroll", tick);
      removeEventListener("resize", tick);
    };
  }, []);

  return (
    <section className="lsec" id="how">
      <div className="hscroll" ref={wrap}>
        <div className="hscroll-stick" ref={stick}>
          <div className="hscroll-head">
            <div>
              <div className="hscroll-eyebrow">How it works</div>
              <h2>
                Pick it. Own it. <em>Get paid.</em>
              </h2>
            </div>
            <div className="hscroll-hint">3 steps · scroll</div>
          </div>
          <div className="hscroll-view" ref={view}>
            <div className="steps" ref={track}>
              {STEPS.map((s) => (
                <div className="step" key={s.n}>
                  <div className="n">{s.n}</div>
                  <h4>{s.h}</h4>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hscroll-bar">
            <span ref={bar} />
          </div>
        </div>
      </div>
    </section>
  );
}
