import { addPick, listPicks } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet") ?? undefined;
  return Response.json({ picks: listPicks(wallet) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const pick = addPick(body as Record<string, unknown>);
  if (!pick) {
    return Response.json({ error: "That pick is missing a stock, a price or a thesis." }, { status: 400 });
  }
  return Response.json({ ok: true, id: pick.id });
}
