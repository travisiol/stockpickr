/* ---------------------------------------------------------------------------
   The terminal's server side, in memory.

   This is deliberately not a database. It keeps profiles, picks, follows and
   likes for as long as the server process lives, which is enough for the
   product to behave like itself — a pick you post is visible to the next
   browser that loads the feed — and it is wiped by a restart or a redeploy.

   Swap this file for a real store before anything here is worth keeping.
   Nothing else imports the Maps directly, so the surface to replace is the
   exported functions below.
--------------------------------------------------------------------------- */

export type Profile = {
  wallet: string;
  privyId?: string;
  handle: string;
  img: string;
  hue: number | null;
  createdAt: number;
  realised: number;
  closed: number;
  open: number;
  book: number;
  cost: number;
  positions: number;
  basis: unknown[];
  basisAt: number;
  wallets: string[];
};

export type Pick = {
  id: string;
  wallet: string;
  handle: string;
  tick: string;
  dir: string;
  entry: number;
  thesis: string;
  ts: number;
  likes: Set<string>;
};

/* Next keeps module state per worker, and dev reloads modules on edit. Hanging
   the maps off globalThis is what stops an edit from emptying the feed. */
type Db = {
  profiles: Map<string, Profile>;
  picks: Map<string, Pick>;
  /* follower -> set of wallets they follow */
  follows: Map<string, Set<string>>;
};

const g = globalThis as typeof globalThis & { __stockpickr?: Db };

const db: Db =
  g.__stockpickr ??
  (g.__stockpickr = {
    profiles: new Map(),
    picks: new Map(),
    follows: new Map(),
  });

const norm = (w: unknown) => String(w ?? "").trim().toLowerCase();

/* ---------------- profiles ---------------- */

export function listProfiles(): Profile[] {
  return [...db.profiles.values()];
}

export function upsertProfile(input: Record<string, unknown>): Profile | null {
  const wallet = norm(input.wallet);
  if (!/^0x[0-9a-f]{40}$/.test(wallet)) return null;

  const handle = String(input.handle ?? "").trim().replace(/^@/, "");
  if (handle && !/^[a-zA-Z0-9_.]{3,20}$/.test(handle)) return null;

  /* a handle belongs to one wallet: first to claim it keeps it */
  if (handle) {
    for (const p of db.profiles.values()) {
      if (p.wallet !== wallet && p.handle.toLowerCase() === handle.toLowerCase()) return null;
    }
  }

  const prev = db.profiles.get(wallet);
  const num = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

  const next: Profile = {
    wallet,
    privyId: typeof input.privyId === "string" ? input.privyId : prev?.privyId,
    handle: handle || prev?.handle || "",
    /* a data: URI avatar is the one field a client can make large, so it is
       capped here rather than trusted */
    img: String(input.img ?? prev?.img ?? "").slice(0, 400_000),
    hue: input.hue == null ? (prev?.hue ?? null) : num(input.hue),
    createdAt: prev?.createdAt ?? Date.now(),
    realised: num(input.realised, prev?.realised ?? 0),
    closed: num(input.closed, prev?.closed ?? 0),
    open: num(input.open, prev?.open ?? 0),
    book: num(input.book, prev?.book ?? 0),
    cost: num(input.cost, prev?.cost ?? 0),
    positions: num(input.positions, prev?.positions ?? 0),
    basis: Array.isArray(input.basis) ? input.basis.slice(0, 200) : (prev?.basis ?? []),
    basisAt: Date.now(),
    wallets: Array.isArray(input.wallets)
      ? input.wallets.map(norm).filter(Boolean).slice(0, 10)
      : (prev?.wallets ?? [wallet]),
  };

  db.profiles.set(wallet, next);
  return next;
}

/* ---------------- picks ---------------- */

export function listPicks(viewer?: string) {
  const v = norm(viewer);
  return [...db.picks.values()]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 300)
    .map((c) => ({
      id: c.id,
      wallet: c.wallet,
      handle: c.handle,
      tick: c.tick,
      dir: c.dir,
      entry: c.entry,
      thesis: c.thesis,
      ts: c.ts,
      likes: c.likes.size,
      liked: v ? c.likes.has(v) : false,
    }));
}

export function addPick(input: Record<string, unknown>) {
  const wallet = norm(input.wallet);
  if (!/^0x[0-9a-f]{40}$/.test(wallet)) return null;

  const tick = String(input.tick ?? "").trim().slice(0, 12);
  const thesis = String(input.thesis ?? "").trim().slice(0, 500);
  const entry = Number(input.entry);
  if (!tick || !thesis || !Number.isFinite(entry) || entry <= 0) return null;

  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const pick: Pick = {
    id,
    wallet,
    handle: db.profiles.get(wallet)?.handle || "picker",
    tick,
    dir: String(input.dir ?? "long"),
    entry,
    thesis,
    ts: Date.now(),
    likes: new Set(),
  };
  db.picks.set(id, pick);
  return pick;
}

export function toggleLike(wallet: unknown, pickId: unknown, on: boolean) {
  const w = norm(wallet);
  const c = db.picks.get(String(pickId ?? ""));
  if (!w || !c) return false;
  if (on) c.likes.add(w);
  else c.likes.delete(w);
  return true;
}

/* ---------------- follows ---------------- */

export function followSnapshot(viewer?: string) {
  const counts: Record<string, number> = {};
  for (const targets of db.follows.values()) {
    for (const t of targets) counts[t] = (counts[t] ?? 0) + 1;
  }
  const v = norm(viewer);
  return { counts, following: v ? [...(db.follows.get(v) ?? [])] : [] };
}

export function toggleFollow(wallet: unknown, target: unknown, on: boolean) {
  const w = norm(wallet);
  const t = norm(target);
  if (!w || !t || w === t) return false;
  const set = db.follows.get(w) ?? new Set<string>();
  if (on) set.add(t);
  else set.delete(t);
  db.follows.set(w, set);
  return true;
}
