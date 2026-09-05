import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/* Robinhood Chain's public RPC answers with `Access-Control-Allow-Origin:
   *,*`, two values in one header, which every browser rejects. Every chain
   read from the terminal therefore fails in the browser and only fails in the
   browser. Relaying it server-side sidesteps CORS entirely.

   Read-only by design. Only the methods the terminal actually calls are
   forwarded, so this cannot be used as an open relay for broadcasting
   transactions: those are signed and sent by the user's own wallet. */
const ALLOWED = new Set([
  "eth_call",
  "eth_estimateGas",
  "eth_getBalance",
  "eth_getLogs",
  "eth_getTransactionReceipt",
  "eth_blockNumber",
  "eth_chainId",
  "eth_getCode",
  "eth_gasPrice",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: { message: "Bad request" } }, { status: 400 });
  }

  const { method } = body as { method?: unknown };
  if (typeof method !== "string" || !ALLOWED.has(method)) {
    return Response.json(
      { error: { message: `Method not allowed here: ${String(method)}` } },
      { status: 403 }
    );
  }

  try {
    const upstream = await fetch(site.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    /* the terminal retries on a 5xx, so say so rather than throwing */
    return Response.json({ error: { message: "Upstream RPC unreachable" } }, { status: 502 });
  }
}
