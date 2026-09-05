import { listProfiles, upsertProfile } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ profiles: listProfiles() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const saved = upsertProfile(body as Record<string, unknown>);
  if (!saved) {
    return Response.json(
      { error: "That username is taken, or the wallet is not valid." },
      { status: 409 }
    );
  }
  return Response.json({ ok: true, profile: saved });
}
