import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SlimFooter from "@/components/SlimFooter";
import InstallButton from "@/components/InstallButton";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Get ${site.name}`,
  description:
    "Open the terminal in any browser, or install it to your home screen. Sign in with the same wallet and your positions, picks and rewards are already there.",
};

export default function Get() {
  return (
    <>
      <div className="bg-hero" aria-hidden="true" />
      <Nav />

      <main className="pg prose">
        <span className="mono">INSTALL</span>
        <h1>Get {site.word}</h1>
        <p className="lead">
          Pick your platform. Everything is read from the chain, so nothing needs transferring:
          sign in with the same wallet and your positions, picks and rewards are already there.
        </p>
        <p className="updated">No store account. No review queue. No seed phrase, ever.</p>

        <div className="get-grid">
          <div className="get-card">
            <span className="mono">ANY BROWSER</span>
            <h3>Web terminal</h3>
            <p>
              The full terminal, nothing cut down. Works on desktop and mobile, and it is the same
              build the installed app runs.
            </p>
            <Link className="go" href="/dashboard">
              Open the terminal
            </Link>
          </div>

          <div className="get-card">
            <span className="mono">ANDROID · WINDOWS</span>
            <h3>Install it</h3>
            <p>
              Chrome and Edge can install {site.word} as a real app: its own window, its own icon,
              and notifications when a pick you follow moves.
            </p>
            <InstallButton />
          </div>

          <div className="get-card">
            <span className="mono">IPHONE · IPAD</span>
            <h3>Add to Home Screen</h3>
            <p>
              Safari does not offer an install button, but Add to Home Screen gives you the same
              app. Steps are below.
            </p>
            <span className="go off">See steps</span>
          </div>
        </div>

        <h2>Installing on Android or Windows</h2>
        <ol className="get-steps">
          <li>
            <b>Press Install</b>
            Chrome and Edge show an install prompt. If the button above says “Use browser menu”,
            open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.
          </li>
          <li>
            <b>Confirm</b>
            The app installs from the page you are already on. Nothing is downloaded from a store
            and nothing is waiting on a review.
          </li>
          <li>
            <b>Sign in with your wallet</b>
            Your handle, positions and picks belong to the wallet, so they are already there the
            moment you open it.
          </li>
        </ol>

        <h2>Installing on iPhone</h2>
        <ol className="get-steps">
          <li>
            <b>Open this page in Safari</b>
            Add to Home Screen only exists in Safari, not in Chrome on iOS.
          </li>
          <li>
            <b>Share → Add to Home Screen</b>
            Tap the share icon in the toolbar, scroll down, and choose Add to Home Screen.
          </li>
          <li>
            <b>Open it from the icon</b>
            It launches full screen with no browser chrome, and signs in with the same wallet.
          </li>
        </ol>

        <div className="note">
          <p>
            <b>The app never asks for a seed phrase.</b> You sign in with the wallet you already
            use, and every signature happens inside your own wallet. {site.word} holds no keys and
            takes no custody.
          </p>
        </div>

        <p>
          Trouble installing? <Link href="/dashboard">Open the web terminal</Link> — it works in any
          browser and loses nothing.
        </p>
      </main>

      <SlimFooter />
    </>
  );
}
