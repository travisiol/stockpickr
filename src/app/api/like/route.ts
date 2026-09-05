import { toggleLike } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const { wallet, pickId, on } = body as Record<string, unknown>;
  if (!toggleLike(wallet, pickId, !!on)) {
    return Response.json({ error: "No such pick" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
