export const dynamic = "force-dynamic";

/* Claiming moves real ETH out of a treasury wallet. There is no treasury and
   no signing key here, so this refuses rather than returning a fake txHash
   the UI would then report as money paid. */
export async function POST() {
  return Response.json(
    { error: "Rewards are not live yet: no settlement has run and no treasury is configured." },
    { status: 503 }
  );
}
