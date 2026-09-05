# STOCKPICKR

**Get paid to pick tokenized stocks.** Buy a tokenized stock, then pick it.
Trading is free; 25% of the trading fees on the STOCKPICKR coin funds a
treasury, and that treasury pays the pickers whose picks were right.

Next.js 16 (App Router), no CSS framework, no database.

```bash
npm install
npm run dev        # http://localhost:3000
```

## What is here

| Route        | What it is                                                        |
| ------------ | ----------------------------------------------------------------- |
| `/`          | Landing: hero, five-panel bento, pinned how-it-works rail, FAQ     |
| `/docs`      | How a pick is scored, what it is paid, how settlement works        |
| `/get`       | Install paths: web, PWA install, iOS Add to Home Screen            |
| `/privacy`   | Privacy policy (plain-language draft)                             |
| `/terms`     | Terms of service (plain-language draft)                           |
| `/dashboard` | The trading terminal                                              |
| `/api/*`     | Profiles, picks, follows, likes, rewards, claim                    |

## Two root layouts

`src/app/(site)` and `src/app/(terminal)` are separate route groups with their
own root layouts. The terminal's stylesheet restyles `body` and the whole type
scale for a dark trading UI; keeping it out of the marketing site's document is
what stops the two from fighting over the cascade. There is no `app/layout.tsx`.

## The terminal

`src/app/(terminal)/terminal.js` is one module holding the whole terminal:
markets, chart, order panel, positions, picks, feed, leaderboard, rewards,
notifications, profiles and the mobile tab bar. It is imperative — it renders
by writing HTML into elements it looks up by id, and repaints on a timer — so
React mounts one empty root and stays out of the way from then on
(`dashboard/Terminal.tsx`).

It runs in one of two modes, decided by whether a wallet provider is
configured:

- **live** — `NEXT_PUBLIC_PRIVY_APP_ID` is set. Sign-in, balances, swaps and
  positions are real, and every order is signed in the user's own wallet.
- **paper** — nothing is configured. This is the default, so the terminal is
  explorable out of the box. Orders settle against a seeded practice balance,
  nothing touches a network, the header carries a `PAPER` badge, and every
  position written this way is marked `paper: true`.

## The API, and what it does not do

`src/lib/store.ts` keeps profiles, picks, follows and likes **in memory**. It is
enough for the product to behave like itself — a pick you post is visible to the
next browser that loads the feed — and it is wiped by a restart or a redeploy.
Swap that one file for a real store before anything in it is worth keeping.

Two routes deliberately refuse rather than invent:

- `GET /api/rewards` returns an empty record and `payouts: "not-configured"`.
  No settlement has run, so no pick has been paid.
- `POST /api/claim` returns 503. Claiming moves real ETH out of a treasury
  wallet; there is no treasury and no signing key here, and returning a fake
  transaction hash would have the UI report money as paid.

## Configuration

One file, `src/lib/site.ts`, holds the name, the economics and the three
addresses. All three ship empty:

- `ca` — the coin's contract address. Empty renders `CA: soon` in the nav and
  the footer.
- `treasury` — the wallet the rewards pool accrues into. Empty makes the
  landing page show `Not yet` instead of reading a balance.
- `rewards` — the Picker Rewards distributor. Empty means claiming is not live.

`poolCut` (0.25) and `tradeFee` (0) are quoted from here into the landing copy,
the docs, the terms and the terminal, so the numbers cannot drift apart.

See `.env.example` for the one environment variable.

## Design

Ink on warm white, Satoshi for headings, the system stack for body copy, Roboto
Mono for overlines. Green and red belong to the market. Brass `#9a6b1f` is the
one brand colour and it only ever marks a pick: the second half of the wordmark,
the word `Pick` in the headline, the callout chip in the feed, the step you are
on, and the quarter of the fees that leaves for the pickers.

`src/app/(site)/globals.css` is the structural system with a brand layer
appended at the end, so the identity wins the cascade without a single
`!important`.

## Not done

- Settlement, scoring and payouts run nowhere. The docs describe the intended
  design; the code implements the UI for it.
- The legal pages are plain-language drafts and have not been reviewed by a
  lawyer.
- The in-memory store is not a database.
