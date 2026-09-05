"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/* Chrome fires beforeinstallprompt instead of prompting on its own, so hold
   the event and let this button trigger it. Where the browser never fires it
   the button says what to do by hand rather than pretending to install. */
export default function InstallButton() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    addEventListener("beforeinstallprompt", onPrompt);
    setInstalled(
      matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
    const onInstalled = () => setInstalled(true);
    addEventListener("appinstalled", onInstalled);
    return () => {
      removeEventListener("beforeinstallprompt", onPrompt);
      removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return <span className="go off">Already installed</span>;
  }

  if (!evt) {
    return (
      <span className="go off" title="Use your browser's Install app menu item">
        Use browser menu
      </span>
    );
  }

  return (
    <button
      className="go"
      type="button"
      onClick={() => {
        evt.prompt();
        evt.userChoice.finally(() => setEvt(null));
      }}
    >
      Install
    </button>
  );
}
