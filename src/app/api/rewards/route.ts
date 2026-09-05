import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/* Settlement is not built. Rather than inventing cycles and payouts, this
   answers with an empty, honest record: no pick has been paid, there is no
   claimable cycle, and `payouts` tells the terminal to say why the Claim
   button is not live instead of offering money that does not exist.

   The shape is the one the terminal already reads:
     picks        pickId -> amount paid, for the "earned" markers
     cycles       settled reward cycles for this wallet
     nextPoolWei  what the next cycle is expected to distribute
     payouts      "ready" once a treasury or distributor can actually pay */
export async function GET() {
  return Response.json({
    picks: {},
    cycles: [],
    nextPoolWei: "0",
    claimed: {},
    payouts: site.rewards ? "ready" : "not-configured",
  });
}
