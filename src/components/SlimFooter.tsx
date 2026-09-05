import Link from "next/link";
import { site } from "@/lib/site";

/* The sub-pages get one line of links rather than the landing's four columns. */
export default function SlimFooter() {
  return (
    <footer className="slim-foot">
      <Link href="/">Home</Link>
      <Link href="/docs">Docs</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
      <a href={site.x} target="_blank" rel="noopener">
        X
      </a>
      <div className="cp">
        © {new Date().getFullYear()} {site.legalEntity}.
      </div>
    </footer>
  );
}
