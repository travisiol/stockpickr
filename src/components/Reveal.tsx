"use client";

import { useEffect } from "react";

/* Scroll reveals. Elements rise, scale or slide in as they enter view; the
   variant is chosen per selector so a heading and a card do not arrive the
   same way. Siblings stagger by 110ms up to half a second.

   Mounted once by the landing page. Renders nothing. */
export default function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const variant: [string, string][] = [
      [".lsec h2, .bento-sec h2, .orbit-sec h2", "rv-up"],
      [".b-card, .mk-card, .demo-card", "rv-scale"],
      [".stat-b, .faq details", "rv"],
      [".lsec .lead, .bento-sec .sub, .orbit-sec .sub", "rv"],
      [".step", "rv-scale"],
    ];

    const seen = new Set<Element>();
    variant.forEach(([sel, cls]) =>
      document.querySelectorAll(sel).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        el.classList.add("rv", cls);
      })
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const sibs = [...(el.parentElement?.children ?? [])].filter((x) =>
            x.classList.contains("rv")
          );
          el.style.transitionDelay =
            Math.min(Math.max(sibs.indexOf(el), 0) * 110, 550) + "ms";
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    seen.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
