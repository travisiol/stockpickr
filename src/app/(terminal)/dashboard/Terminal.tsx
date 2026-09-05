"use client";

import { useEffect, useRef } from "react";

/* React renders one empty root and then stays out of the way: the terminal
   below it is imperative, repaints itself on a timer, and would fight a
   virtual DOM for ownership of the same nodes. Loaded on the client only,
   because it reads localStorage and wires window listeners as it boots. */
export default function Terminal() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let stop: (() => void) | undefined;
    let cancelled = false;

    import("../terminal.js").then(({ initTerminal }) => {
      if (cancelled) return;
      stop = initTerminal(node);
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return <div ref={root} id="terminalRoot" />;
}
