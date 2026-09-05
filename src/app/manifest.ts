import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/* The manifest is what makes the /get page's Install button real: without it
   Chrome never fires beforeinstallprompt and the button would be a prop. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · ${site.tagline}`,
    short_name: site.name,
    description:
      "Buy a tokenized stock, then pick it. A quarter of the trading fees on our coin goes to the pickers whose picks work.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f1",
    theme_color: "#f7f6f1",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
