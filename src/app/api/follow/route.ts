import { followSnapshot, toggleFollow } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet") ?? undefined;
  return Response.json(followSnapshot(wallet));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { wallet, target, on } = body as Record<string, unknown>;
  if (!toggleFollow(wallet, target, !!on)) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
