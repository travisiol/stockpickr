/* eslint-disable */

/* =====================================================================
   STOCKPICKR terminal.

   A port of the single-file terminal into one module. React renders an
   empty root and this owns the DOM inside it from then on, exactly as the
   original standalone page did, so the imperative rendering it is built
   around keeps working untouched.

   Two modes, decided by whether a wallet provider is configured:

     live   NEXT_PUBLIC_PRIVY_APP_ID is set. Sign-in, balances, swaps and
            positions are real, and every order is signed in your wallet.
     paper  nothing is configured. Orders settle against the seeded practice
            balance, nothing touches a network, and the UI says so.

   Paper is the default so the terminal is explorable out of the box. It is
   never presented as real: every row it writes carries paper:true.
   ===================================================================== */

import { site } from "@/lib/site";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
export const PAPER = !PRIVY_APP_ID;

const SHELL = `<header class="top">
  <!-- desktop only, and never inside the installed app -->
  <a class="get-app" id="getApp" href="/get" hidden aria-label="Get the Stockpickr app">
    <svg class="ga-logo" viewBox="0 0 88 88" aria-hidden="true">
      <path fill="currentColor" d="M0 12.4L35.9 7.5v34.6H0zM40.3 6.9L88 0v41.8H40.3zM0 46.5h35.9v34.7L0 76.3zM40.3 46.5H88V88l-47.7-6.7z"/>
    </svg>
    <span class="ga-txt"><small>Download for</small><b>Windows</b></span>
  </a>
  <a class="wordmark" href="/" style="display:flex;align-items:center;gap:8px"><img src="/logo.svg" alt="" style="width:26px;height:26px;border-radius:6.4px"><span>Stock<i>pickr</i></span></a>
  <nav class="top-nav" id="topNav">
    <button data-nav="tokens" class="on">Markets</button>
    <button data-nav="feed">Feed</button>
    <button data-nav="leaderboard">Leaderboard</button>
    <button data-nav="rewards">Rewards</button>
  </nav>
  <div class="search">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#8f94a3" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="#8f94a3" stroke-width="2" stroke-linecap="round"/></svg>
    <input id="searchIn" placeholder="Search for stocks or pickers..." autocomplete="off">
    <div class="search-drop" id="searchDrop" hidden></div>
  </div>
  <div class="top-right">
    <button class="bal-chip" id="depositChip" title="Tap to switch between ETH and USD">
      <svg class="bal-wal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2"/>
        <rect x="3" y="7.5" width="18" height="11.5" rx="2.5"/>
        <circle cx="16.5" cy="13.2" r="1.25" fill="currentColor" stroke="none"/>
      </svg>
      <span class="bal-sep"></span>
      <span class="bal-val" id="balance">0</span>
      <span class="bal-swap" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 8h13l-3.5-3.5"/><path d="M20 16H7l3.5 3.5"/>
        </svg>
      </span>
    </button>
    <button class="chip" id="privyBtn" style="cursor:pointer"><div class="lbl">trading from</div><b id="privyLbl">Sign in</b></button>
    <div class="me-av" data-profile="me">YO</div>
  </div>
</header>

<div class="cols">

  <!-- LEFT -->
  <aside class="left">
    <div class="l-tabs" id="lTabs">
      <button data-l="alerts">Notifications</button>
      <button data-l="tokens" class="on">Stocks</button>
      <button class="l-collapse" id="lCollapse" title="Hide panel" aria-label="Hide panel">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
    </div>
    <div class="l-pane" id="lPane"></div>
  </aside>

  <!-- CENTER -->
  <main class="center">
    <div class="stock-head" id="stockHead"></div>
    <div class="chart-bar">
      <b>Live</b><span id="chartPair">on-chain price · Robinhood Chain</span>
      <a id="birdeyeLink" href="#" target="_blank" rel="noopener" style="margin-left:auto;color:var(--accent);font-weight:600;text-decoration:none">Open on Birdeye ↗</a>
    </div>
    <div class="chart-wrap" id="chartWrap"></div>
    <div class="bottom-panel">
      <div class="bp-tabs" id="bpTabs">
        <button data-bp="positions">Positions</button>
        <button data-bp="holders">Holders</button>
        <button data-bp="swaps">Swaps</button>
        <button data-bp="thesis" class="on">Picks</button>
      </div>
      <div class="bp-body" id="bpBody"></div>
    </div>
  </main>

  <!-- RIGHT -->
  <aside class="right">
    <div class="card">
      <div class="bs-tabs">
        <button class="b on" id="tabBuy">Buy</button>
        <button class="s" id="tabSell">Sell</button>
      </div>
      <div id="buyPane">
        <div class="amt-in"><span>$</span><input id="buyAmt" type="number" inputmode="decimal" min="0" step="any" placeholder="0"></div>
        <div class="chips">
          <button data-amt="10">$10</button><button data-amt="100">$100</button>
          <button data-amt="500">$500</button><button data-amt="1000">$1000</button>
        </div>
        <div class="avail"><span id="availTxt">$0 available</span><span id="feeHint"></span></div>
        <div class="via" id="viaLine"><span id="viaTxt"></span><button id="viaClear">×</button></div>
        <div class="fee-box" id="feeBox"></div>
        <button class="big-buy" id="bigBuy">Buy</button>
      </div>
      <div id="sellPane" hidden>
        <div id="sellList"></div>
      </div>
    </div>

    <div class="card about">
      <h3 id="aboutName">About</h3>
      <div class="sub" id="aboutSub"></div>
      <div class="tf-tiles" id="tfTiles"></div>
      <div class="bar-row"><div class="t"><b id="buysN"></b><b id="sellsN"></b></div><div class="bar" id="bsBar"></div></div>
      <div class="bar-row"><div class="t"><b id="buyersN"></b><b id="sellersN"></b></div><div class="bar" id="brBar"></div></div>
      <div id="aboutPos" hidden></div>
    </div>

    <div class="card treasury-card">
      <div class="lbl">Pick Rewards</div>
      <div class="big">25% of coin fees</div>
      <p>Trading here is free. A quarter of the trading fees on the Stockpickr coin funds the treasury behind Pick Rewards, and it pays the pickers whose picks were right.</p>
    </div>

  </aside>
</div>

<button class="left-reopen" id="leftReopen" title="Show panel" aria-label="Show panel" hidden>
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
</button>

<div class="page-view" id="pageView" hidden></div>
<!-- outside every re-rendered container: the page repaints on a timer and
     would otherwise detach this while the file dialog is open -->
<input type="file" id="pfoImg" accept="image/*" hidden>

<!-- phones: the buy panel is ~900px down the stack, so keep trading one tap away -->
<!-- phones: the markets list slides over, dismissed by tapping the scrim -->
<div class="drawer-scrim" id="drawerScrim" hidden></div>

<!-- phones: primary navigation lives at the bottom, in reach of a thumb -->
<nav class="tabbar" id="tabbar">
  <button data-tab="markets" class="on">
    <span class="ind"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg></span>
    <span>Markets</span></button>
  <button data-tab="feed">
    <span class="ind"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg></span>
    <span>Feed</span></button>
  <button data-tab="leaderboard">
    <span class="ind"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20V10"/><path d="M12 20V4"/><path d="M18 20v-6"/></svg></span>
    <span>Ranks</span></button>
  <button data-tab="rewards">
    <span class="ind"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.9 6.3 6.9.8-5 4.7 1.3 6.8L12 17.3 5.9 20.6 7.2 13.8l-5-4.7 6.9-.8z"/></svg></span>
    <span>Rewards</span></button>
  <button data-tab="profile">
    <span class="ind"><img class="tb-av" id="tbAvatar" src="/logo.svg" alt=""></span>
    <span>You</span></button>
</nav>

<div class="m-trade" id="mTrade" hidden>
  <span class="m-trade-id"><b id="mTradeTick"></b><small id="mTradePrice"></small></span>
  <button class="m-trade-sell" id="mTradeSell">Sell</button>
  <button class="m-trade-buy" id="mTradeBuy">Buy</button>
</div>

<footer class="statusbar" id="statusbar"></footer>

<!-- POST modal -->
<div class="overlay" id="postOverlay">
  <div class="modal" role="dialog" aria-modal="true">
    <h3>Post a pick</h3>
    <div class="sub" id="postSub"></div>

    <div class="field">
      <label for="postThesis">Thesis</label>
      <textarea id="postThesis" rows="3" placeholder="Why this trade, why now."></textarea>
    </div>
    <div class="cooldown-note" id="cooldownNote"></div>
    <div class="modal-actions">
      <button class="ghost" data-close>Cancel</button>
      <button class="primary" id="confirmPost">Post pick</button>
    </div>
  </div>
</div>

<!-- PROFILE modal -->
<!-- FIRST LOGIN: pick a username. Cannot be dismissed. -->
<div class="overlay" id="usernameOverlay">
  <div class="modal" role="dialog" aria-modal="true" style="max-width:380px">
    <div class="un-point"><span class="un-arrow">&#8595;</span> Create your username to unlock the terminal</div>
    <div class="un-steps"><span class="on" id="unDot1">1</span><i></i><span id="unDot2">2</span></div>
    <div id="unStep1">
      <h3>Step 1 &middot; Create a username</h3>
      <div class="sub">Pick the @name you trade and post under. It is yours alone, nobody else can take it,
      and you need one before the terminal opens.</div>
      <div class="field">
        <label for="unInput">Username</label>
        <div class="at-in"><span>@</span><input id="unInput" type="text" autocomplete="off" spellcheck="false" placeholder="yourname" maxlength="20"></div>
      </div>
      <div class="cooldown-note on" id="unErr" style="display:none"></div>
      <button class="big-buy" id="unSave">Continue</button>
      <div style="font-size:11.5px;color:var(--muted);text-align:center;margin-top:10px">3-20 characters. Letters, numbers, _ or .</div>
    </div>
    <div id="unStep2" hidden>
      <h3>Step 2 &middot; Add a picture</h3>
      <div class="sub">Optional. You can change it any time from your profile.</div>
      <div class="field">
        <div class="file-in">
          <span class="file-prev" id="unPrev"><img src="/logo.svg" alt=""></span>
          <label class="file-btn" for="unImg">Choose image</label>
          <span class="file-name" id="unFile">PNG or JPG, square works best</span>
          <input type="file" id="unImg" accept="image/*" hidden>
        </div>
      </div>
      <button class="big-buy" id="unDone">Enter the terminal</button>
    </div>
  </div>
</div>

<div class="overlay" id="profileOverlay">
  <div class="modal" role="dialog" aria-modal="true" id="profileModal"></div>
</div>

<!-- LOGIN GATE, wallet sign-in is required to use the terminal -->
<div class="gate" id="loginGate" hidden>
  <div class="gate-card">
    <img src="/logo.svg" alt="" class="gate-logo">
    <h2>Sign in to Stockpickr</h2>
    <p class="gate-sub">Trade tokenized stocks, post picks and earn from the rewards pool. Your wallet is created automatically, no seed phrase, no extension.</p>
    <button class="gate-btn" id="gateLogin" style="margin-bottom:14px">Sign in with Privy</button>
    <div class="gate-err" id="gateErr" hidden></div>
    <div class="gate-foot">Secured by <b>Privy</b> · non-custodial embedded wallet</div>
  </div>
</div>

<!-- DEPOSIT modal -->
<div class="overlay" id="depositOverlay">
  <div class="modal" role="dialog" aria-modal="true">
    <h3>Deposit</h3>
    <div class="sub" id="depSub">Fund your embedded wallet to trade.</div>
    <div id="depBody"></div>
    <div class="modal-actions">
      <button class="ghost" data-close style="flex:1">Close</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>`;

/* Sign-in for paper mode. It implements the same surface the terminal reads
   off window.Privy, so the ported code below needs no branch of its own: an
   address kept in this browser, and no provider to sign with. */
function paperAddress() {
  const KEY = "stockpickr_paper_wallet";
  let a = null;
  try { a = localStorage.getItem(KEY); } catch (e) {}
  if (!a) {
    const b = new Uint8Array(20);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(b);
    else for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
    a = "0x" + Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");
    try { localStorage.setItem(KEY, a); } catch (e) {}
  }
  return a;
}

function installPaperWallet() {
  const SESSION = "stockpickr_paper_session";
  let authed = false;
  try { authed = localStorage.getItem(SESSION) === "1"; } catch (e) {}
  const remember = on => { try { localStorage.setItem(SESSION, on ? "1" : "0"); } catch (e) {} };
  const wallet = () => ({
    address: paperAddress(),
    walletClientType: "paper",
    getEthereumProvider: async () => null,
  });
  const fire = () => dispatchEvent(new CustomEvent("privy:change"));
  const publish = () => {
    window.Privy = {
      ready: true,
      authenticated: authed,
      user: authed ? { id: "paper:" + paperAddress() } : null,
      login() { authed = true; remember(true); publish(); fire(); },
      logout() { authed = false; remember(false); publish(); fire(); return Promise.resolve(); },
      wallets: authed ? [wallet()] : [],
      getAccessToken: async () => null,
      linkWallet: null,            // nothing to link to in paper mode
      embeddedWallets: authed ? [wallet()] : [],
      externalWallets: [],
      hasExternalWallet: false,
    };
  };
  publish();
  setTimeout(fire, 0);
}

/* The gate is written for a wallet sign-in. In paper mode that would be a
   lie, so it says what actually happens instead. */
function paperGateCopy(root) {
  const q = s => root.querySelector(s);
  const card = q(".gate-card");
  if (!card) return;
  const h2 = card.querySelector("h2");
  const sub = card.querySelector(".gate-sub");
  const btn = q("#gateLogin");
  const foot = card.querySelector(".gate-foot");
  if (h2) h2.textContent = "Open the paper terminal";
  if (sub) sub.textContent =
    "Trade tokenized stocks against a practice balance, post picks, and watch how the " +
    "rewards pool would score them. No wallet, no signature, no real money.";
  if (btn) btn.textContent = "Start paper trading";
  if (foot) foot.innerHTML = "<b>Paper mode</b> &middot; nothing here settles on-chain";

  const chip = q("#privyBtn");
  if (chip) {
    const lbl = chip.querySelector(".lbl");
    if (lbl) lbl.textContent = "practice account";
  }
  const badge = document.createElement("span");
  badge.className = "paper-badge";
  badge.textContent = "PAPER";
  badge.title = "Orders settle against a practice balance, not the chain";
  const right = q(".top-right");
  if (right) right.insertBefore(badge, right.firstChild);
}

let started = false;
const TIMERS = [];

export function initTerminal(root) {
  if (started) return () => {};
  started = true;

  /* the ported code reads these off window, from one definition in site.ts */
  window.STOCKPICKR_CA = site.ca;
  window.STOCKPICKR_REWARDS = site.rewards;
  window.STOCKPICKR_CHAIN_ID = site.chainId;

  root.innerHTML = SHELL;
  if (PAPER) { installPaperWallet(); paperGateCopy(root); }

  const cleanup = () => {
    TIMERS.forEach(clearInterval);
    TIMERS.length = 0;
    started = false;
  };

/* ==================== the ported terminal ==================== */
/* =====================================================================
   Stockpickr terminal, client demo of the Pick Rewards spec.
   Fees: 1% per trade. 25% of every fee accrues to the Pick Rewards pool.
   Epochs are 24h (UTC). At close, the pool is distributed to eligible
   pickers pro-rata by Activity Score, with a per-picker cap.
   The category weights are internal, the UI never shows them.
===================================================================== */

/* -------- config (internal) -------- */
const CFG = {
  /* Stockpickr takes nothing from an order. The rewards treasury is funded by
     a quarter of the trading fees on the Stockpickr coin instead, so charging
     for a trade here as well would be taking twice. The pool cut is what the
     coin sends on, and is quoted rather than applied to anything on screen. */
  FEE: 0,
  POOL_CUT: .25,
  W: { trading:.35, attention:.30, quality:.20, discovery:.15 },
  CAP: .25,                    // max share of one payout pool per picker (configurable; high while picker count is small)
  COOLDOWN_MS: 30*60e3,        // one reward-eligible pick per user per asset
  MIN_VIEWERS: 25,
  MIN_SCORE: 4,
};
const DAY = 86400e3;
const epochOf = ts => Math.floor(ts / DAY);   // UTC day index = epoch number

/* -------- seed data -------- */
const stocks = {
  NVDAx:{name:"NVIDIA", price:172.85, mcap:"$4.2T", liq:"$81.4M", holders:"46.3K", chg24:4.21, dom:"nvidia.com"},
  TSLAx:{name:"Tesla", price:341.10, mcap:"$1.1T", liq:"$63.2M", holders:"38.1K", chg24:-1.82, dom:"tesla.com"},
  HOODx:{name:"Robinhood", price:98.22, mcap:"$87.0B", liq:"$44.7M", holders:"29.5K", chg24:6.08, dom:"robinhood.com"},
  MSTRx:{name:"Strategy", price:388.45, mcap:"$109B", liq:"$21.9M", holders:"18.2K", chg24:2.94, dom:"strategy.com"},
  COINx:{name:"Coinbase", price:312.60, mcap:"$79.6B", liq:"$33.1M", holders:"22.7K", chg24:-0.71, dom:"coinbase.com"},
  METAx:{name:"Meta", price:704.15, mcap:"$1.8T", liq:"$52.8M", holders:"31.4K", chg24:1.28, dom:"meta.com"},
  PLTRx:{name:"Palantir", price:154.30, mcap:"$364B", liq:"$40.3M", holders:"27.9K", chg24:3.47, dom:"palantir.com"},
  AAPLx:{name:"Apple", price:228.40, mcap:"$3.4T", liq:"$71.2M", holders:"52.0K", chg24:0.63, dom:"apple.com"},
  AMZNx:{name:"Amazon", price:219.70, mcap:"$2.3T", liq:"$47.5M", holders:"33.6K", chg24:1.02, dom:"amazon.com"},
  GOOGx:{name:"Alphabet", price:196.55, mcap:"$2.4T", liq:"$45.9M", holders:"30.2K", chg24:-0.34, dom:"abc.xyz"},
  MSFTx:{name:"Microsoft", price:508.30, mcap:"$3.8T", liq:"$66.1M", holders:"41.7K", chg24:0.88, dom:"microsoft.com"},
  NFLXx:{name:"Netflix", price:1208.40, mcap:"$513B", liq:"$28.9M", holders:"19.8K", chg24:1.74, dom:"netflix.com"},
  AMDx:{name:"AMD", price:166.20, mcap:"$270B", liq:"$31.5M", holders:"24.1K", chg24:2.61, dom:"amd.com"},
  AVGOx:{name:"Broadcom", price:296.50, mcap:"$1.4T", liq:"$25.7M", holders:"15.3K", chg24:1.91, dom:"broadcom.com"},
  JPMx:{name:"JPMorgan", price:298.10, mcap:"$820B", liq:"$22.4M", holders:"12.9K", chg24:0.42, dom:"jpmorganchase.com"},
  Vx:{name:"Visa", price:352.75, mcap:"$690B", liq:"$19.8M", holders:"11.2K", chg24:0.29, dom:"visa.com"},
  LLYx:{name:"Eli Lilly", price:744.90, mcap:"$707B", liq:"$17.2M", holders:"9.8K", chg24:-0.58, dom:"lilly.com"},
  UBERx:{name:"Uber", price:92.35, mcap:"$193B", liq:"$21.3M", holders:"14.6K", chg24:1.12, dom:"uber.com"},
  DISx:{name:"Disney", price:112.60, mcap:"$203B", liq:"$16.8M", holders:"13.4K", chg24:-0.91, dom:"disney.com"},
  SHOPx:{name:"Shopify", price:138.85, mcap:"$180B", liq:"$18.9M", holders:"12.2K", chg24:2.08, dom:"shopify.com"},
  SQx:{name:"Block", price:82.40, mcap:"$51B", liq:"$14.1M", holders:"10.7K", chg24:1.63, dom:"block.xyz"},
  GMEx:{name:"GameStop", price:24.85, mcap:"$11.1B", liq:"$12.6M", holders:"18.9K", chg24:3.92, dom:"gamestop.com"},
  BABAx:{name:"Alibaba", price:138.20, mcap:"$330B", liq:"$15.4M", holders:"9.1K", chg24:-1.24, dom:"alibabagroup.com"},
  KOx:{name:"Coca-Cola", price:71.90, mcap:"$310B", liq:"$11.8M", holders:"8.4K", chg24:0.18, dom:"coca-colacompany.com"},
  MCDx:{name:"McDonald's", price:302.45, mcap:"$216B", liq:"$10.9M", holders:"7.9K", chg24:-0.22, dom:"mcdonalds.com"},
};
/* the rest of the market, [symbol, name, price, market cap in $B] */
const MORE=[
["ORCL","Oracle",245.30,680],["CRM","Salesforce",258.40,250],["ADBE","Adobe",362.10,160],["INTC","Intel",24.50,105],
["QCOM","Qualcomm",162.30,180],["TXN","Texas Instruments",198.20,180],["MU","Micron",128.40,140],["ARM","Arm",142.60,150],
["TSM","TSMC",228.50,1180],["ASML","ASML",812.40,320],["SNOW","Snowflake",218.70,73],["NET","Cloudflare",188.20,64],
["DDOG","Datadog",128.90,44],["MDB","MongoDB",228.10,17],["CRWD","CrowdStrike",428.60,105],["PANW","Palo Alto",182.40,120],
["ZS","Zscaler",268.30,41],["OKTA","Okta",92.10,16],["TEAM","Atlassian",162.20,42],["ABNB","Airbnb",128.40,80],
["DASH","DoorDash",248.20,105],["LYFT","Lyft",16.80,7],["RBLX","Roblox",128.50,88],["U","Unity",28.40,12],
["EA","Electronic Arts",168.20,42],["TTWO","Take-Two",238.40,42],["SPOT","Spotify",718.20,145],["PINS","Pinterest",34.20,23],
["SNAP","Snap",7.80,13],["RDDT","Reddit",148.20,27],["ZM","Zoom",78.40,24],["PYPL","PayPal",68.20,66],
["MA","Mastercard",588.40,530],["AXP","American Express",328.20,230],["GS","Goldman Sachs",712.40,220],["MS","Morgan Stanley",142.30,228],
["BAC","Bank of America",52.40,395],["WFC","Wells Fargo",82.10,270],["C","Citigroup",98.20,183],["SCHW","Schwab",96.40,175],
["BLK","BlackRock",1128.00,175],["SOFI","SoFi",22.40,25],["AFRM","Affirm",78.20,25],["NU","Nubank",13.80,66],
["WMT","Walmart",102.40,820],["COST","Costco",942.10,418],["TGT","Target",104.20,48],["NKE","Nike",72.40,107],
["SBUX","Starbucks",92.80,105],["CMG","Chipotle",42.10,57],["LULU","Lululemon",248.20,30],["PEP","PepsiCo",152.40,209],
["PG","Procter & Gamble",158.20,372],["JNJ","Johnson & Johnson",162.40,391],["PFE","Pfizer",25.40,144],["MRK","Merck",112.30,284],
["ABBV","AbbVie",198.20,350],["UNH","UnitedHealth",302.40,278],["NVO","Novo Nordisk",62.80,280],["XOM","Exxon Mobil",112.40,483],
["CVX","Chevron",152.30,272],["OXY","Occidental",44.20,41],["BA","Boeing",218.40,163],["LMT","Lockheed Martin",478.20,113],
["RTX","RTX",128.40,171],["CAT","Caterpillar",412.30,199],["DE","John Deere",468.20,127],["GE","GE Aerospace",268.40,286],
["F","Ford",11.20,44],["GM","General Motors",52.40,57],["RIVN","Rivian",13.40,15],["LCID","Lucid",2.40,7],
["T","AT&T",28.20,202],["VZ","Verizon",42.10,177],["IBM","IBM",282.40,262],["CSCO","Cisco",68.20,270],
["HPQ","HP",26.40,25],["DELL","Dell",128.20,89],["ANET","Arista Networks",118.40,148],["VRT","Vertiv",112.30,43]
];
for(const [sym,name,price,mcB] of MORE){
  const h=[...sym].reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0;
  stocks[sym+"x"]={name,price,dom:1,
    mcap:mcB>=1000?"$"+(mcB/1000).toFixed(2)+"T":"$"+mcB+"B",
    liq:"$"+(4+h%38)+"."+(h%10)+"M",
    holders:(2+h%44)+"."+(h%10)+"K",
    chg24:((h%600)/100)-3};
}
const palette=["#7892ff","#4fd8ff","#ff8fb2","#f5c451","#7fe0d8","#aebcff","#b48fff"];
const NOW = Date.now();
const CUR_EPOCH = epochOf(NOW);

/* early-days figures: the platform is new, nobody has earned much yet */
/* early-days figures: the platform is new, nobody has earned much yet */
const SEED_STATS={
  u1:{pnl:1240.55,followers:214,rewards:284.12,folVol:24800},
  u2:{pnl:830.20, followers:168,rewards:162.10,folVol:16400},
  u3:{pnl:512.28, followers:121,rewards:98.84, folVol:11200},
  u4:{pnl:476.50, followers:96, rewards:81.12, folVol:8600},
  u5:{pnl:402.07, followers:74, rewards:74.55, folVol:7300},
  u6:{pnl:268.63, followers:48, rewards:41.20, folVol:4100},
  u7:{pnl:191.41, followers:31, rewards:29.88, folVol:2600},
  u8:{pnl:143.45, followers:22, rewards:24.11, folVol:1900},
  me:{pnl:0,      followers:0,  rewards:0,     folVol:0},
};
const randHue=()=>Math.floor(Math.random()*360);
/* Every picker on the site is a real signed-in wallet, fetched from the API.
   The only local user is you, before the server has heard of you. */
function seedUsers(){ return [
  {id:"me",handle:"you",name:"You",following:false,...SEED_STATS.me,hue:randHue()},
];}
function seedPicks(){ return []; }
function m(viewers,opens,shares,saves,follows,traders,volume){
  return {viewers,opens,shares,saves,follows,traders,volume,fees:0};
}
function seedPicks(){ return []; }
function seedState(){ return {
  sel:"NVDAx", balance:2500, side:"buy", dir:"long", lTab:"tokens", bpTab:"thesis", balUsd:false,
  realised:0, closed:0,        // all-time banked profit, and how many trades produced it
  positions:[], nextId:100, starred:{}, lbMode:"rewards",
  via:null, viaTouch:null,                 // last-touch attribution {pickId, ts}
  epochN: CUR_EPOCH, epochBase: CUR_EPOCH-2, pool: 0, treasuryLife: 0, paidAllTime: 0,
  alerts:[], seenCalls:[], seenRewards:[], introDone:false,
  history:[],                            // real payout rounds only

};}

/* -------- persistence: one Stockpickr account per Privy login --------
   Each signed-in identity gets its own storage slot, so signing in with a
   different wallet loads that wallet's account instead of overwriting yours. */
const LS_BASE="stockpickr_v1";
const LS_LEGACY="stockpickr_v1";            // the old single shared slot
let users, picks, state, ACCOUNT=null;
const keyFor=a=>a?LS_BASE+":"+a:LS_BASE+":guest";
function readSlot(key){
  try{ const d=JSON.parse(localStorage.getItem(key));
    if(d && d.state && d.picks && d.users) return d; }catch(e){}
  return null;
}
function migrateLoaded(){
  // a state saved by an older build can be missing keys the UI assumes
  const d=seedState();
  for(const k of Object.keys(d)) if(state[k]===undefined) state[k]=d[k];
  // an account emptied by the earlier build gets its pickers and feed back
  // notifications about the removed demo pickers refer to people who no longer
  // exist, and carry no picture, so drop them once
  if(Array.isArray(state.alerts)){
    const seenAlert=new Set();
    state.alerts=state.alerts.filter(a=>{
      if(!a) return false;
      if(!a.uid && /posted on/.test(String(a.title||""))) return false;   // removed demo pickers
      const sub=String(a.sub||"");
      if(sub.indexOf("$0 distributed")===0||sub.indexOf("$0.00 distributed")===0) return false;  // payouts of nothing
      // the old simulation pushed the same pick over and over; keep the first
      const k=String(a.title||"")+"|"+String(a.sub||"");
      if(seenAlert.has(k)) return false;
      seenAlert.add(k);
      return true;
    });
  }
  // other pickers come from the API now, never from a local seed
  if(false){
    const seeded=seedUsers().filter(u=>u.id!=="me");
    const me=users.find(u=>u.id==="me");
    users=[...seeded,...(me?[me]:[])];
    if(!picks||!picks.length) picks=seedPicks();
  }
  if(!['alerts','tokens'].includes(state.lTab)) state.lTab='tokens';   // Leaders/Feed moved to the top nav
  if(!state.seedV2){                       // rescale pre-launch demo numbers, keep your own data
    users.forEach(u=>{ const st=SEED_STATS[u.id]; if(st) Object.assign(u,st);
      if(u.hue==null) u.hue=randHue(); });
    // clear the seeded demo balances: the pool is whatever the treasury holds
    state.pool=0; state.treasuryLife=0; state.paidAllTime=0;
    state.history=(state.history||[]).map((h,i)=>({...h,pool:[82.20,104.10,126.85][i]??h.pool,mine:0}));
    state.epochBase=CUR_EPOCH-2; state.seedV2=true;
  }
}
function loadAccount(acct,altKey){
  ACCOUNT=acct||null;
  let d=readSlot(keyFor(ACCOUNT));
  // accounts used to be keyed on the Privy user id; move that data to the wallet key.
  // also runs when this wallet has a slot that was never set up, which is what a
  // sign-in straight after the key change would have left behind.
  const isSetUp=x=>!!x && (x.users||[]).some(u=>u.id==="me" && u.profileSet && u.handle!=="you");
  // altKey may be several older keys: the Privy user id, and any address this
  // identity used before (importing a wallet changes which address we key on)
  const alts=(Array.isArray(altKey)?altKey:[altKey]).filter(k=>k&&k!==ACCOUNT);
  if(!isSetUp(d) && ACCOUNT){
    for(const k of alts){
      const old=readSlot(keyFor(k));
      if(isSetUp(old)){ d=old; try{localStorage.removeItem(keyFor(k));}catch(e){} break; }
    }
  }
  // otherwise a wallet with no slot of its own starts clean
  if(d){ users=d.users; picks=d.picks; state=d.state; }
  else  { users=seedUsers(); picks=seedPicks(); state=seedState(); }
  if(!state.sel||!stocks[state.sel]) state.sel=Object.keys(stocks)[0]||"NVDAx";
  // a slot written by an older build must never be able to blank the app
  try{ migrateLoaded(); }
  catch(e){
    console.error("stored account could not be migrated, starting clean:",e);
    users=seedUsers(); picks=seedPicks(); state=seedState();
    try{ migrateLoaded(); }catch(e2){}
    return false;
  }
  if(!users.some(u=>u.id==="me")) users=[...users,...seedUsers().filter(u=>u.id==="me")];
  return !!d;
}
function save(){
  try{ localStorage.setItem(keyFor(ACCOUNT), JSON.stringify({users,picks,state})); }catch(e){}
}
loadAccount(null);                         // guest view until Privy resolves

/* -------- helpers -------- */
const $=s=>document.querySelector(s);
const fmt=n=>"$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmt0=n=>"$"+Math.round(n).toLocaleString("en-US");
const kfmt=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":Math.round(n);
const byId=id=>users.find(u=>u.id===id);
const color=id=>palette[[...id].reduce((a,c)=>a+c.charCodeAt(0),0)%palette.length];
const ini=u=>u.name.slice(0,2).toUpperCase();
const hueOf=u=>u.hue!=null?u.hue:([...u.id].reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0)%360;
const uAv=(u,px)=>u.img?`<img class="u-av" src="${u.img}" alt="" style="width:${px}px;height:${px}px;object-fit:cover">`
  :`<img class="u-av" src="/logo.svg" alt="" style="width:${px}px;height:${px}px;filter:hue-rotate(${hueOf(u)}deg) saturate(1.15)">`;
const tAv=(t,px)=>{const s=stocks[t]; if(!s) return "";
  const sym=t.replace(/x$/,"");
  // real company logo by ticker; the Robinhood token image is only a fallback
  const primary=s.dom?`https://assets.parqet.com/logos/symbol/${sym}?format=png&size=64`:s.img;
  const backup=s.dom?(s.img||""):"";
  const span=`<span class="t-av" style="width:${px}px;height:${px}px;font-size:${Math.round(px*.35)}px;background:${color(t)};${primary?"display:none":""}">${sym.slice(0,2)}</span>`;
  if(!primary) return span;
  const onerr=backup
    ? `if(this.dataset.f){this.style.display='none';this.nextElementSibling.style.display='flex'}else{this.dataset.f=1;this.src='${backup}'}`
    : `this.style.display='none';this.nextElementSibling.style.display='flex'`;
  return `<img class="t-av" src="${primary}" alt="${sym}" loading="lazy" style="width:${px}px;height:${px}px;border-radius:50%;background:#fff;object-fit:contain" onerror="${onerr}">${span}`;};
const ago=ts=>{const s=(Date.now()-ts)/1e3; if(s<3600)return Math.max(1,Math.floor(s/60))+"m"; if(s<DAY/1e3)return Math.floor(s/3600)+"h"; return Math.floor(s/(DAY/1e3))+"d";};
const dispE=e=>e-(state.epochBase ?? (state.epochBase=CUR_EPOCH-185));
function toast(html){const t=$("#toast");t.innerHTML=html;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2600);}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* The platform is long-only: a pick says this stock goes up. The old form
   flipped the sign whenever dir was anything but "long", so a pick stored
   without that field reported the exact opposite of what the stock did. */
const sinceCall=c=>{
  const s=stocks[c.tick];
  if(!s||!c.entry) return 0;
  return (s.price-c.entry)/c.entry*100;
};

/* -------- activity scoring (internal, not surfaced) -------- */
/* ============ Pick Score ============

   Scored out of 100 on four components, to the published weighting:

     40  Market performance   was the call right, and by how much
     25  Attention            did it earn genuine engagement
     20  Community PnL        did people who acted on it make money
     15  Social impact        did it grow the picker's standing

   Every component is normalised to 0-100 first, so no component can run away
   with the pool. Diminishing returns everywhere: a call with 200,000 views is
   not worth two hundred times one with 1,000, and a picker who already has a
   large following gets no automatic advantage - what counts is the followers
   the call itself produced, relative to the audience that saw it.

   Signals the platform does not yet record score 0 rather than being faked.
   SCORE_HAVE says which are wired to real data today. */
const SCORE = {
  W:{ perf:0.40, attention:0.25, community:0.20, social:0.15 },
  WINDOWS:[ {h:1,w:0.10}, {h:24,w:0.25}, {h:72,w:0.30}, {h:168,w:0.35} ],
  ENGAGE:{ view:0.05, like:0.2, comment:0.5, save:1, click:1, tradeOpen:2, buy:5 },
  MIN_SCORE: 35,          // below this a pick earns nothing
  EXP: 1.3,               // convex: excellent calls earn more than proportionally
  CAP_PICK: 0.10,      // no single pick takes more than a tenth of an epoch
  CAP_PICKER: 0.20,       // no single picker takes more than a fifth
  MAX_PICK_USD: 2.5,   // and never more than this in real money, whatever the pool holds
};
/* Which components have real data behind them right now. This has to match
   api/settle.js exactly: the score is divided by the weight of whatever is
   measurable, so counting a component here that settlement does not count
   shrinks every score on the site relative to what actually gets paid. There
   is no follower-gain pipeline yet, so social measures nothing. */
const SCORE_HAVE={ perf:true, attention:true, community:false, social:false };

/* the market's own move over the same period, so a call is judged against the
   tape rather than credited for a rally that lifted everything */
function benchmarkMove(){
  const all=Object.values(stocks).filter(x=>typeof x.chg24==="number");
  if(!all.length) return 0;
  return all.reduce((a,x)=>a+x.chg24,0)/all.length;
}

/* 1. Market performance, 40 points.
   Excess return over the benchmark, weighted across evaluation windows. Only
   windows the call is actually old enough for count, so a fresh call is judged
   on the short window and grows into the longer ones. */
function perfScore(c){
  const age=(Date.now()-c.ts)/3600e3;                  // hours since the call
  const excess=sinceCall(c)-benchmarkMove();
  let wsum=0, acc=0;
  for(const win of SCORE.WINDOWS){ if(age>=win.h){ wsum+=win.w; acc+=win.w*excess; } }
  if(!wsum){ wsum=SCORE.WINDOWS[0].w; acc=SCORE.WINDOWS[0].w*excess; }   // brand new
  const eff=acc/wsum;
  if(eff<=0) return 0;
  return 100*(1-Math.exp(-eff/8));                     // ~63 at +8% excess
}

/* 2. Attention, 25 points. Weighted engagement, log-normalised against the
   busiest pick this epoch so a small picker with real engagement competes. */
function attentionRaw(c){
  const m=c.m||{}, E=SCORE.ENGAGE;
  return (m.viewers||0)*E.view + (c.likes||0)*E.like + (m.saves||0)*E.save
       + (m.opens||0)*E.click + (m.traders||0)*E.tradeOpen + (m.buys||0)*E.buy;
}

/* 3. Community PnL, 20 points. Money made by people who acted on the call.
   Attribution is not recorded server-side yet, so this scores 0 for everyone
   rather than being guessed at. */
function communityRaw(c){ return (c.communityPnl||0); }

/* 4. Social impact, 15 points. Followers the call produced, and how well it
   converted the audience that saw it - not how famous the picker already is. */
function socialScore(c){
  const gained=(c.followersGained||0);
  const seen=Math.max(1,(c.m&&c.m.viewers)||0);
  const conv=Math.min(1,gained/seen);
  const vol=100*(1-Math.exp(-gained/25));
  return Math.max(0,Math.min(100, 0.5*vol + 0.5*(conv*100)));
}

function pickScore(c){
  const perf=perfScore(c);
  const social=SCORE_HAVE.social?socialScore(c):0;
  return {perf, social, attRaw:attentionRaw(c), comRaw:communityRaw(c),
          move:sinceCall(c), excess:sinceCall(c)-benchmarkMove()};
}
function rawCats(c){ const x=pickScore(c); return {att:x.attRaw,trd:0,q:x.perf,disc:0}; }
function computeScores(){
  const live = picks.filter(c=>c.epoch===state.epochN && !c.flagged && !c.dupe);
  // components first, so attention and community PnL can be normalised across
  // the whole epoch rather than judged in isolation
  const parts=live.map(c=>({c, ...pickScore(c)}));
  const maxAtt=Math.max(0,...parts.map(p=>p.attRaw));
  const maxCom=Math.max(0,...parts.map(p=>Math.abs(p.comRaw)));
  const out = new Map();
  parts.forEach(p=>{
    const att = (SCORE_HAVE.attention && maxAtt>0)
      ? 100*Math.log(1+p.attRaw)/Math.log(1+maxAtt) : 0;
    // losses for the people who followed a call count against it
    const com = (SCORE_HAVE.community && maxCom>0)
      ? 50 + 50*Math.sign(p.comRaw)*Math.log(1+Math.abs(p.comRaw))/Math.log(1+maxCom) : 0;
    // only score out of the components that have real data behind them,
    // otherwise the eligibility gate is far stricter than it reads
    const live=SCORE.W.perf*(SCORE_HAVE.perf?1:0) + SCORE.W.attention*(SCORE_HAVE.attention?1:0)
             + SCORE.W.community*(SCORE_HAVE.community?1:0) + SCORE.W.social*(SCORE_HAVE.social?1:0);
    const raw = SCORE.W.perf*(p.perf/100) + SCORE.W.attention*(att/100)
              + SCORE.W.community*(com/100) + SCORE.W.social*(p.social/100);
    const score = live>0 ? 100*raw/live : 0;
    out.set(p.c.id, {score, eligible: score>=SCORE.MIN_SCORE,
      parts:{perf:p.perf, att, com, social:p.social, excess:p.excess}});
  });
  /* An excellent call earns more than proportionally more than a mediocre one,
     and the weight is scaled by how the call actually did. Attention is a
     quarter of the score, which on its own was enough to clear the gate: a
     flat call with the most likes scored 38.5 and was paid. It can lift one
     good call above another, but it cannot make a call that did nothing worth
     anything. This has to match api/settle.js. */
  const weight=new Map();
  out.forEach((v,id)=>{
    weight.set(id, v.eligible?Math.pow(v.score,SCORE.EXP)*(v.parts.perf/100):0);
  });
  const wTotal=[...weight.values()].reduce((a,b)=>a+b,0);
  // no single pick takes more than its cap; the excess goes back to the rest
  if(wTotal>0){
    for(let i=0;i<8;i++){
      let over=0; const under=[];
      const tot=[...weight.values()].reduce((a,b)=>a+b,0);
      weight.forEach((w,id)=>{
        const share=w/tot;
        if(share>SCORE.CAP_PICK){ over+=share-SCORE.CAP_PICK; weight.set(id,SCORE.CAP_PICK*tot); }
        else if(w>0) under.push(id);
      });
      if(over<=1e-9||!under.length) break;
      const freeTot=under.reduce((a,id)=>a+weight.get(id),0);
      if(freeTot<=0) break;
      under.forEach(id=>weight.set(id, weight.get(id)+over*tot*weight.get(id)/freeTot));
    }
  }
  // aggregate per picker over eligible picks
  const perPicker = new Map();
  out.forEach((v,id)=>{ if(!v.eligible) return;
    const c = picks.find(x=>x.id===id);
    perPicker.set(c.user,(perPicker.get(c.user)||0)+(weight.get(id)||0));
  });
  const total = [...perPicker.values()].reduce((a,b)=>a+b,0);
  // shares with cap; excess redistributed pro-rata among uncapped pickers (iterative)
  const shares = new Map();
  if(total>0){
    perPicker.forEach((s,u)=>shares.set(u, s/total));
    for(let iter=0; iter<10; iter++){
      let excess=0; const free=[];
      shares.forEach((sh,u)=>{ if(sh>SCORE.CAP_PICKER){excess+=sh-SCORE.CAP_PICKER; shares.set(u,SCORE.CAP_PICKER);} else if(sh<SCORE.CAP_PICKER) free.push(u); });
      if(excess<=1e-9 || !free.length) break;
      const freeTotal=free.reduce((a,u)=>a+shares.get(u),0);
      if(freeTotal<=0) break;
      free.forEach(u=>shares.set(u, shares.get(u)+excess*shares.get(u)/freeTotal));
    }
  }
  // per-pick estimated reward = picker reward split by pick score weight,
  // then held to the same hard ceiling settlement applies
  const est = new Map();
  out.forEach((v,id)=>{
    if(!v.eligible){ est.set(id,0); return; }
    const c=picks.find(x=>x.id===id);
    const pickerW=perPicker.get(c.user)||0, share=shares.get(c.user)||0;
    const raw=pickerW>0 ? poolAmount()*share*((weight.get(id)||0)/pickerW) : 0;
    est.set(id, Math.min(raw, SCORE.MAX_PICK_USD));
  });
  return {out, shares, est, total};
}
let SC = null;           // cached scores, refreshed by refreshScores()
function refreshScores(){ SC = computeScores(); }

/* -------- epoch close -------- */
function checkEpoch(){
  const nowEpoch = epochOf(Date.now());
  if(nowEpoch <= state.epochN) return;
  // close current epoch: distribute pool by shares
  refreshScores();
  let mine=0, topU=null, topShare=0;
  SC.shares.forEach((sh,u)=>{
    const amt = poolAmount()*sh;
    const usr = byId(u); if(!usr) return;
    // rewards are rewards. PnL is what trading made, and a payout is not a trade.
    usr.rewards += amt;
    if(u==="me"){ state.balance += amt; mine = amt; }
    if(sh>topShare){ topShare=sh; topU=usr.handle; }
  });
  const paid = poolAmount();
  state.epochN = nowEpoch;
  state.pool = 0;
  state.viaTouch = null;
  // Nothing in the treasury means nothing was paid. Rolling the day over is
  // bookkeeping; announcing a $0.00 payout is just noise.
  if(paid > 0){
    state.paidAllTime += paid;
    state.history.push({epoch:nowEpoch-1, pool:paid, mine, top:topU||"nobody"});
    if(state.history.length>8) state.history.shift();
    pushAlert("pool","Rewards paid out",`${fmt(paid)} distributed to eligible pickers`);
    if(mine>0) toast(`Rewards paid out, you earned <b>${fmt(mine)}</b>.`);
  }
  save();
}
function epochEndMs(){ return (state.epochN+1)*DAY; }

/* -------- treasury wallet --------
   Paste the treasury address below and the Pick Rewards pool becomes the live
   on-chain balance of that wallet: deposit claimed fees to it and the number moves.
   Leave `address` empty to keep the simulated pool. */
const TREASURY = {
  address:site.treasury,                        // Picker Rewards treasury, empty until there is one
  token:"",                                     // PASTE your coin's contract address. empty = native ETH
  rpc:"/api/rpc",                               // relayed: the public RPC sends a malformed CORS header
  explorer:"https://robinhoodchain.blockscout.com/address/",
  decimals:null,                                // read from the contract when left null
  symbol:"",                                    // read from the contract when left empty
  usdPerUnit:0,                                 // 0 = price unknown, the pool is shown in coin units
  priceId:""                                    // optional CoinGecko id, if the coin gets listed
};
const treasuryState={usd:0,units:0,rate:0,live:false,error:null,decimals:null,symbol:""};

async function rpcCall(method,params){
  // the public RPC rate-limits, and a 429 in the middle of a quote used to
  // surface as a bogus revert, so back off and retry instead
  let last="";
  for(let i=0;i<4;i++){
    let r;
    try{ r=await fetch(TREASURY.rpc,{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})}); }
    catch(e){ last="network error"; await new Promise(z=>setTimeout(z,400*(i+1))); continue; }
    if(r.status===429||r.status>=500){ last="RPC "+r.status; await new Promise(z=>setTimeout(z,600*(i+1))); continue; }
    if(!r.ok) throw new Error("RPC "+r.status);
    const d=await r.json();
    if(d.error){
      const err=new Error(d.error.message||"RPC error");
      err.data=d.error.data;                       // revert bytes, useful when a swap fails
      throw err;
    }
    return d.result;
  }
  throw new Error(last||"RPC unavailable");
}
const hexToStr=h=>{ // decode an ABI-encoded string return value
  try{ const b=h.replace(/^0x/,"");
    if(b.length<=64) return Buffer_fromHex(b);
    const len=parseInt(b.slice(64,128),16);
    return Buffer_fromHex(b.slice(128,128+len*2));
  }catch(_){ return ""; }
};
const Buffer_fromHex=h=>h.replace(/(00)+$/,"").match(/.{1,2}/g)?.map(x=>String.fromCharCode(parseInt(x,16))).join("")||"";
async function tokenMeta(){
  if(treasuryState.decimals!=null) return;
  if(!TREASURY.token){ treasuryState.decimals=18; treasuryState.symbol=TREASURY.symbol||"ETH"; return; }
  try{ const d=await rpcCall("eth_call",[{to:TREASURY.token,data:"0x313ce567"},"latest"]);
       treasuryState.decimals=TREASURY.decimals??parseInt(d,16); }catch(_){ treasuryState.decimals=TREASURY.decimals??18; }
  try{ const y=await rpcCall("eth_call",[{to:TREASURY.token,data:"0x95d89b41"},"latest"]);
       treasuryState.symbol=TREASURY.symbol||hexToStr(y)||"tokens"; }catch(_){ treasuryState.symbol=TREASURY.symbol||"tokens"; }
}
async function fetchTreasury(){
  if(!TREASURY.address) return;
  try{
    await tokenMeta();
    let raw;
    if(TREASURY.token){   // ERC-20 balanceOf(address)
      const data="0x70a08231"+TREASURY.address.replace(/^0x/,"").toLowerCase().padStart(64,"0");
      raw=await rpcCall("eth_call",[{to:TREASURY.token,data},"latest"]);
    }else{
      raw=await rpcCall("eth_getBalance",[TREASURY.address,"latest"]);
    }
    const units=Number(BigInt(raw||"0x0"))/Math.pow(10,treasuryState.decimals??18);
    let rate=TREASURY.usdPerUnit;
    // the treasury holds native ETH, so price it from the same pool the swaps use.
    // without this the pool reads $0 however much is deposited, and every estimate stays blank.
    if(!TREASURY.token && !TREASURY.priceId) rate=await ethPriceUsd();
    if(TREASURY.priceId){
      try{ const pr=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${TREASURY.priceId}&vs_currencies=usd`);
        if(pr.ok){ const pd=await pr.json(); rate=(pd[TREASURY.priceId]||{}).usd||rate; } }catch(_){}
    }
    treasuryState.units=units; treasuryState.rate=rate; treasuryState.usd=units*rate;
    treasuryState.live=true; treasuryState.error=null;
  }catch(e){ treasuryState.live=false; treasuryState.error=String(e.message||e); }
  renderMoney();
  if(state.pageNav==="rewards") renderPage("rewards");
}
/* live ETH price, taken from the ETH/USDG pool the swaps already route through.
   Shared by the wallet balance and the treasury so both agree on one number. */
let _ethUsd=0;
async function ethPriceUsd(){
  try{
    const e=await ethLeg();
    if(e){
      const out=await quotePath(DEX.native,[[DEX.usdg,e.fee,e.tickSpacing,e.hooks,"0x"]],10n**16n);
      const px=Number(out)/1e6/0.01;
      if(isFinite(px)&&px>0) _ethUsd=px;
    }
  }catch(_){}
  return _ethUsd;
}

/* the connected wallet pays for trades directly, so show its real chain balance */
const walletState={eth:0,ethUsd:0,live:false,error:null};
async function fetchWalletBalance(){
  const a=privyState.wallet&&privyState.wallet.address;
  if(PAPER){ walletState.live=false; renderMoney(); return; }
  if(!a){ walletState.live=false; return; }
  try{
    const raw=await rpcCall("eth_getBalance",[a,"latest"]);
    walletState.eth=Number(BigInt(raw||"0x0"))/1e18;
    walletState.live=true; walletState.error=null;
    walletState.ethUsd=await ethPriceUsd();
  }catch(e){ walletState.live=false; walletState.error=String(e.message||e); }
  renderMoney();
}
const ethFmt=n=>n.toLocaleString("en-US",{maximumFractionDigits:n>=1?4:6});
const walletText=()=>walletState.live?ethFmt(walletState.eth)+" ETH":"Not connected";
/* The treasury balance is not published anywhere in the UI. Rewards are
   explained as a rule - a quarter of coin fees, paid out daily - rather than
   as a running total. */
/* the Ethereum diamond in its own colours, so the unit is unmistakable */
const ETH_MARK=`<svg class="eth-mark" viewBox="0 0 256 417" aria-hidden="true">
  <path fill="#8A92B2" d="M127.96 0L125.17 9.5v275.7l2.79 2.78 127.95-75.64z"/>
  <path fill="#62688F" d="M127.96 0L0 212.32l127.96 75.64V154.16z"/>
  <path fill="#8A92B2" d="M127.96 312.19l-1.57 1.92v98.2l1.57 4.59 128.03-180.32z"/>
  <path fill="#62688F" d="M127.96 416.9v-104.7L0 236.58z"/>
  <path fill="#454A75" d="M127.96 287.96l127.95-75.64-127.95-58.16z"/>
  <path fill="#62688F" d="M0 212.32l127.96 75.64V154.16z"/>
</svg>`;
/* the chip shows ETH by default and USD once tapped */
function balanceChipHTML(){
  if(PAPER) return `<b class="bal-cur">PAPER</b>${fmt(state.balance)}`;
  if(!walletState.live) return "Not connected";
  if(state.balUsd){
    return ethRate()
      ? `<b class="bal-cur">USD</b>${fmt(walletState.eth*ethRate())}`
      : "No price yet";
  }
  return ETH_MARK+ethFmt(walletState.eth);
}
const walletUsd=()=>walletState.live&&ethRate()?fmt(walletState.eth*ethRate()):"";

/* the pool has no dollar price until the coin is listed, so show coin units */
const coinFmt=n=>n.toLocaleString("en-US",{maximumFractionDigits:n<1?6:2});
function poolText(){
  if(treasuryState.live && !treasuryState.rate)
    return coinFmt(treasuryState.units)+" "+(treasuryState.symbol||"");
  return fmt(poolAmount());
}
/* the pool everything pays out from: the real wallet when configured, else the simulation */
/* What is actually up for grabs. Settlement hands out a small slice of the
   free balance per cycle, so pricing an estimate off the whole treasury
   promised pickers many times what they would ever be paid. The server
   publishes the real figure; the treasury total is only a fallback. */
let nextPoolEth=0;
/* The ETH price the server says it will settle at. Quoting one here goes
   through the ETH pool and fails quietly with no wallet or a slow RPC, and
   the old fallback was a counter that trading fees fed. Trading is free now,
   so that counter never moves and every estimate came out as nothing. */
let poolRateUsd=0;
const ethRate=()=>walletState.ethUsd||poolRateUsd||0;
function poolAmount(){
  const px=ethRate();
  if(nextPoolEth>0 && px) return nextPoolEth*px;
  return treasuryState.live ? treasuryState.usd : 0;
}


/* -------- attribution (last-touch, 24h) -------- */
function touch(pickId){
  state.viaTouch = {pickId, ts:Date.now()};
}
function attributedPick(){
  if(!state.viaTouch) return null;
  if(Date.now()-state.viaTouch.ts > DAY){ state.viaTouch=null; return null; }
  return picks.find(c=>c.id===state.viaTouch.pickId && c.epoch===state.epochN) || null;
}

/* -------- series / holders / swaps -------- */
const N=88;
function genSeries(tick){
  const r=rng([...tick].reduce((a,c)=>a*31+c.charCodeAt(0),7));
  let closes=[100];
  for(let i=1;i<N;i++) closes.push(closes[i-1]*(1+(r()-.485)*.022));
  const k=stocks[tick].price/closes[N-1];
  closes=closes.map(c=>c*k);
  const s=[];
  for(let i=0;i<N;i++){
    const o=i?s[i-1].c:closes[0]*(1-(r()-.5)*.01), c=closes[i];
    s.push({o,c,h:Math.max(o,c)*(1+r()*.006),l:Math.min(o,c)*(1-r()*.006),v:.3+r()});
  }
  return s;
}
const series={}; for(const t in stocks) series[t]=genSeries(t);
let holdersData={}, swapsData={};
function genHolders(tick){
  const r=rng([...tick].reduce((a,c)=>a*17+c.charCodeAt(0),3));
  const sample=users.filter(u=>u.id!=="me").sort(()=>r()-.5).slice(0,5);
  return sample.map(u=>{
    const pos=40000+r()*6400000, pnl=(r()-.3)*pos*.6;
    return {u:u.id,pos,pnl,entry:stocks[tick].price*(1-(r()-.35)*.3)};
  }).sort((a,b)=>b.pos-a.pos);
}
function genSwaps(tick){
  const r=rng([...tick].reduce((a,c)=>a*13+c.charCodeAt(0),11));
  const out=[];
  for(let i=0;i<6;i++){
    const u=users[Math.floor(r()*Math.max(1,Math.min(8,users.length)))];
    if(!u) continue;
    out.push({u:u.id,side:r()>.45?"Buy":"Sell",usd:200+r()*42000,ago:Math.floor(2+r()*55)+"m"});
  }
  return out;
}
for(const t in stocks){holdersData[t]=genHolders(t);swapsData[t]=genSwaps(t);}

/* -------- pick card (spec §17 public metrics) -------- */
function pickCard(c){
  const u=byId(c.user), s=stocks[c.tick];
  const pnl=sinceCall(c);                              // direction-aware: is the call working
  const move=(s.price-c.entry)/c.entry*100;            // where the stock actually went
  const sc=SC.out.get(c.id), est=SC.est.get(c.id)||0;
  const verdict = pnl>=0 ? ["up","Working"] : ["down","Against"];
  const status = c.flagged ? ["no","Flagged"]
    : c.dupe ? ["no","Cooldown"]
    : c.epoch!==state.epochN ? ["no","Closed"]
    : (sc&&sc.eligible) ? ["ok","Eligible"] : ["no","Below minimum"];
  return `<div class="feed-item" data-co="${c.id}">
    <div class="h clickable-u" data-profile="${u.id}">${uAv(u,24)}
      <b>@${u.handle}</b><small>${ago(c.ts)} ago</small></div>
    <button class="co-asset" data-tok="${c.tick}" title="Open ${c.tick}">
      ${tAv(c.tick,30)}
      <span class="co-asset-id"><b>${c.tick}</b><small>${s.name||""}</small></span>
      <span class="co-asset-px"><b>${fmt(s.price)}</b><small class="${move>=0?"up":"down"}">${move>=0?"▲":"▼"} ${Math.abs(move).toFixed(2)}%</small></span>
    </button>
    <div class="tx">${c.thesis}</div>
    <div class="co-grid">
      <div class="co-cell"><small>Picked at</small><b>${fmt(c.entry)}</b></div>
      <div class="co-cell"><small>Current</small><b>${fmt(s.price)}</b></div>
      <div class="co-cell"><small>${c.tick} since</small><b class="${move>=0?'up':'down'}">${move>=0?'▲':'▼'} ${Math.abs(move).toFixed(2)}%</b></div>
      <div class="co-cell"><small>Pick is</small><b class="${verdict[0]}">${verdict[1]} ${pnl>=0?'+':''}${pnl.toFixed(2)}%</b></div>
      <div class="co-cell"><small>Reward</small>${rewardCellHTML(c)}</div>
    </div>
    <div class="tract">
      <span title="People who have seen this pick">👁 ${kfmt(c.m.viewers)} views</span>
      <span title="New followers this pick brought the picker">+${kfmt(c.m.follows)} follows</span>
      <span title="Times saved">✩ ${kfmt(c.m.saves)}</span>
      <span title="Times shared">↗ ${kfmt(c.m.shares)}</span>
    </div>
    <div class="ft">
      <span class="status-tag ${status[0]}">${status[1]}</span>
      <button class="likes ${c.liked?'on':''}" data-like="${c.id}">♥ ${c.likes}</button>
      <button class="saved" data-save="${c.id}">✩ Save</button>
      <button data-share="${c.id}">↗ Share</button>
      <button class="buy-sm" data-via="${c.id}">Buy via</button>
    </div>
  </div>`;
}

/* -------- alerts -------- */
function introHTML(){
  return `<div class="intro-card">
    <h4>Welcome to Stockpickr</h4>
    <div class="lead">You are set up. Here is exactly how the money works.</div>
    <div class="intro-step"><span class="n">1</span><b>Trade tokenized stocks</b>
      <span>Pick a market on the left, buy or sell from the panel on the right. Stockpickr takes no fee on a trade.</span></div>
    <div class="intro-step"><span class="n">2</span><b>Post a pick</b>
      <span>Pick a stock you hold, with your thesis. It is stamped at the current price and becomes your public track record.</span></div>
    <div class="intro-step"><span class="n">3</span><b>Earn from the rewards pool</b>
      <span>25% of the trading fees on the Stockpickr coin goes into the treasury wallet, and it pays the pickers whose picks are right.</span></div>
    <div class="intro-step"><span class="n">4</span><b>Get alerted</b>
      <span>This tab flashes when a picker you follow posts, a market moves, or rewards are paid out.</span></div>
    <div class="intro-actions">
      <button class="intro-go" data-goto="rewards">See how Rewards works</button>
      <button class="intro-skip" id="introSkip">Got it</button>
    </div>
  </div>`;
}
const ALERT_DOTS={up:"linear-gradient(135deg,#35d07f,#1d7a4c)",call:"linear-gradient(135deg,#7892ff,#3a4796)",
  pool:"linear-gradient(135deg,#f5c451,#a4681c)",social:"linear-gradient(135deg,#ff8fb2,#a03060)"};
/* a notification about a person wears their picture; the rest keep a dot */
function alertFaceHTML(a){
  const u=a.uid?byId(a.uid):null;
  if(u) return `<span class="alert-face">${uAv(u,30)}</span>`;
  return `<span class="dot" style="background:${ALERT_DOTS[a.kind]||ALERT_DOTS.call}"></span>`;
}
/* On a phone the notifications tab is gone, so an alert has to actually
   arrive. Ask once, only after the user has done something, and never nag:
   a refused prompt is remembered and not asked again. */
const canNotify=()=>typeof Notification!=="undefined";
function askNotifyPermission(){
  if(!canNotify()||Notification.permission!=="default") return;
  if(state.notifyAsked) return;
  state.notifyAsked=true; save();
  try{ Notification.requestPermission().catch(()=>{}); }catch(e){}
}
function deliverAlert(a){
  if(!canNotify()||Notification.permission!=="granted") return;
  if(document.visibilityState==="visible") return;   // you are already looking at it
  try{
    const u=a.uid?byId(a.uid):null;
    const n=new Notification(a.title,{
      body:String(a.sub||"").replace(/<[^>]+>/g,""),
      icon:(u&&u.img)||"/icon-192.png",
      badge:"/icon-192.png",
      tag:"sc-"+a.kind
    });
    n.onclick=()=>{ try{ window.focus(); }catch(e){}
      if(a.uid) openProfile(a.uid); n.close(); };
  }catch(e){ /* the browser may refuse, that is fine */ }
}
/* A short sound on a new alert. Browsers refuse to play audio until the page
   has been interacted with, so a failure here is normal and ignored rather
   than reported. The element is reused: a new Audio per alert leaks. */
let alertSound=null;
function playAlertSound(){
  if(state.muteAlerts) return;
  try{
    if(!alertSound){ alertSound=new Audio("/notify.mp3"); alertSound.volume=.45; }
    alertSound.currentTime=0;
    const r=alertSound.play();
    if(r&&r.catch) r.catch(()=>{});      // not yet allowed to make noise
  }catch(e){}
}

/* Flash where the notification actually is: the tab that holds it, and the
   card itself when the list is already open. */
function pulse(el){
  if(!el) return;
  el.classList.remove("flash"); void el.offsetWidth;   // restart it if it is already running
  el.classList.add("flash");
  setTimeout(()=>el.classList.remove("flash"),1600);
}
function flashAlert(kind){
  document.querySelectorAll('#lTabs [data-l="alerts"], #tabbar [data-tab="alerts"]').forEach(pulse);
  if(state.lTab==="alerts") pulse(document.querySelector("#lPane .alert-card"));
  /* a reward landed somewhere of its own, so say where */
  if(kind==="pool"){
    document.querySelectorAll('#topNav [data-nav="rewards"], #tabbar [data-tab="rewards"]').forEach(pulse);
    if(state.pageNav==="rewards") pulse(document.querySelector("#pvBody .rw-claim"));
  }
}

function pushAlert(kind,title,sub,uid,key){
  state.alerts=state.alerts||[];
  /* One notification per thing that happened. The old rule only suppressed a
     repeat within sixty seconds, so anything recurring on a longer cycle piled
     up: nine copies of the same pick, minutes apart.

     Where the picker can name the thing, a key identifies it. Matching on the
     wording instead would fold two genuinely separate picks into one the
     moment somebody posted the same thesis twice. */
  const same=a=>a && a.title===title && String(a.sub||"")===String(sub||"");
  if(key){ if(state.alerts.some(a=>a && a.key===key)) return; }
  else if(kind==="call"){ if(state.alerts.some(same)) return; }
  else if(state.alerts.some(a=>same(a) && Date.now()-a.ts<30*60000)) return;
  state.alerts.unshift({id:Date.now()+Math.random(),key:key||null,kind,title,sub,uid:uid||null,ts:Date.now(),read:false});
  if(state.alerts.length>30) state.alerts.length=30;
  paintTabDot();
  if(state.lTab==="alerts") renderLeft();      // it is on screen, so show it now
  playAlertSound();
  flashAlert(kind);
  deliverAlert(state.alerts[0]);
}
const unreadAlerts=()=>(state.alerts||[]).filter(a=>!a.read).length;
function paintTabDot(){
  // hidden on phones; the dot is meaningless there
  const btn=document.querySelector('#lTabs [data-l="alerts"]');
  if(!btn) return;
  const n=unreadAlerts();
  const old=btn.querySelector(".tab-dot"); if(old) old.remove();
  if(n>0 && state.lTab!=="alerts"){
    const d=document.createElement("span");
    d.className="tab-dot"+(n>1?" count":"");
    d.textContent=n>1?(n>9?"9+":n):"";
    btn.appendChild(d);
  }
}
function markAlertsRead(){ (state.alerts||[]).forEach(a=>a.read=true); paintTabDot(); save(); }

/* -------- feed (shared by the sidebar and the full-page view) -------- */
function feedList(){
  return [...picks].sort((a,b)=>b.ts-a.ts)
    .filter(c=>!state.feedFollowing || c.user==="me" || byId(c.user).following);
}
function feedToggleHTML(){
  return `<div class="lb-toggle">
    <button data-feedm="all" class="${!state.feedFollowing?'on':''}">All</button>
    <button data-feedm="fol" class="${state.feedFollowing?'on':''}">Following</button>
  </div>`;
}
function feedEmptyHTML(){
  const followsNobody = !users.some(u=>u.id!=="me" && u.following);
  if(state.feedFollowing && followsNobody)
    return `<div class="pv-empty"><b>You don't follow anyone yet</b>
      <span>Follow pickers from the leaderboard or their profile, and their picks show up here.</span></div>`;
  if(state.feedFollowing)
    return `<div class="pv-empty"><b>Nothing new from the people you follow</b>
      <span>They have not posted a pick yet. Check back, or browse every pick under All.</span></div>`;
  return `<div class="pv-empty"><b>No picks yet</b><span>Be the first to post one.</span></div>`;
}

/* -------- leaderboard (shared by the sidebar and the full-page view) -------- */
function lbToggleHTML(){
  return `<div class="lb-toggle">
    <button data-lbm="rewards" class="${state.lbMode==="rewards"?'on':''}">Rewards claimed</button>
    <button data-lbm="pnl" class="${state.lbMode==="pnl"?'on':''}">By PnL</button>
    <button data-lbm="followers" class="${state.lbMode==="followers"?'on':''}">By followers</button>
  </div>`;
}
/* One number per row, in cents, with a line under it saying what it is.
   A picker who holds nothing shows a dash: "+$0" reads like a bug. */
/* the average move across a picker's live picks: what their calls are
   doing, for someone who calls the market without holding a book */
function callPerf(u){
  const cs=picks.filter(c=>c.user===u.id);
  if(!cs.length) return null;
  const avg=cs.reduce((a,c)=>a+sinceCall(c),0)/cs.length;
  return {avg, n:cs.length};
}
function lbNumHTML(u,mode,v){
  if(mode==="rewards"){
    const eth=u.claimedEth||0;
    const sub=eth>0?`${ethFmt(eth)} ETH`:"nothing claimed yet";
    return `<span class="pnl flat" style="color:var(--text)">${fmt(v)}<small>${sub}</small></span>`;
  }
  if(mode==="followers"){
    const calls=picks.filter(c=>c.user===u.id).length;
    const sub=calls?(calls===1?"1 pick":calls+" picks"):"no picks yet";
    return `<span class="pnl flat" style="color:var(--text)">${kfmt(v)}<small>${sub}</small></span>`;
  }
  const n=u.closed||0;
  const sub=n?(n===1?"1 trade closed":n+" trades closed"):"realised";
  return `<span class="pnl${v<0?" neg":""}">${v<0?"-":"+"}${fmt(Math.abs(v))}<small>${sub}</small></span>`;
}
function lbBodyHTML(){
  const mode=state.lbMode==="followers"?"followers":(state.lbMode==="pnl"?"pnl":"rewards");
  const byRewards=mode==="rewards";
  // rewards: what they have been paid. pnl: banked profit only.
  // followers: reach, which needs no threshold to be meaningful.
  const key=u=>mode==="rewards"?(u.rewards||0)
            :mode==="followers"?(u.followers||0)
            :(u.pnl||0);
  /* Who this board is actually a ranking of. By PnL is a record of closed
     trades, so someone who has never closed one is not ranked last, they are
     not on it at all. Ranking everybody and then hiding the ones who do not
     qualify left their positions behind as gaps: the only picker with a real
     PnL showed as #3, below two people the board was not listing. */
  const eligible=u=>mode==="pnl" ? ((u.closed||0)>0||!!u.pnl)
                  : mode==="rewards" ? (u.rewards||0)>0
                  : true;
  const ranked=[...users].filter(eligible).sort((a,b)=>key(b)-key(a));
  /* Equal figures share a place rather than being split by list order, so two
     pickers on the same PnL are not shown as first and second. */
  const rankOf=new Map();
  ranked.forEach((u,i)=>{
    const prev=i>0?ranked[i-1]:null;
    rankOf.set(u.id, prev && key(prev)===key(u) ? rankOf.get(prev.id) : i+1);
  });
  const q=(state.lbQuery||"").trim().toLowerCase();
  const myRank=rankOf.get("me")||0, me=byId("me");
  const head=state.authed
    ?`<div class="rank-you">${uAv(me,30)}
        <span style="flex:1"><span class="lbl">Your rank</span><br><b>${myRank?"#"+myRank:"Unranked"}</b></span>
        <span class="lbl" style="text-align:right">${mode==="rewards"?"Rewards claimed":mode==="followers"?"Followers":"Realised PnL"}<br>
          <b class="${mode==="pnl"&&key(me)<0?"down":(mode==="pnl"&&key(me)>0?"up":"")}" style="${mode!=="pnl"||!key(me)?"color:var(--text)":""}">
            ${mode==="followers"?kfmt(key(me)):`${mode==="pnl"&&key(me)>0?"+":""}${fmt(key(me))}`}</b>
          ${mode==="pnl"?`<br><span class="lbl">${(me.closed||0)?((me.closed||0)+" closed"):"no closed trades yet"}</span>`:""}</span></div>`
    :`<div class="rank-you"><span style="flex:1;font-size:12px;color:var(--muted)">Sign in to appear on the leaderboard.</span></div>`;
  // signed out, the guest account is not a real picker, so it is left out
  let shown=state.authed?ranked:ranked.filter(u=>u.id!=="me");
  if(q) shown=shown.filter(u=>String(u.name||"").toLowerCase().includes(q)||String(u.handle||"").toLowerCase().includes(q));
    if(!shown.length) return head+`<div class="empty">${q
    ?`No picker matches &ldquo;${q}&rdquo;.`
    :mode==="pnl"?"No one has closed a trade yet."
    :mode==="rewards"?"No one has claimed a reward yet."
    :"No pickers yet."}</div>`;
  return head+shown.map(u=>{
    const place=rankOf.get(u.id);
    const meRow=u.id==="me";
    return `<div class="lb-row${meRow?' me':''}">
      <span class="medal ${place<=3?'m'+place:''}">${place}</span>
      <span class="clickable-u" data-profile="${u.id}" style="display:flex;flex-shrink:0">${uAv(u,30)}</span>
      <span class="nm clickable-u" data-profile="${u.id}">${meRow
        ?`<b>@${u.handle} <span class="you-tag">(you)</span></b>`
        :`<b>${u.name}</b><small>@${u.handle}</small>`}</span>
      ${lbNumHTML(u,mode,key(u))}
      ${meRow?'':`<button class="follow ${u.following?'on':''}" data-follow="${u.id}">${u.following?'Following':'Follow'}</button>`}
    </div>`;}).join("");
}

/* -------- left pane -------- */
/* keep the tab buttons in step with what the pane is actually showing: they
   were only updated on click, while the pane follows state.lTab from saved
   data, so a reload could highlight Stocks with notifications underneath */
function paintLeftTabs(){
  document.querySelectorAll("#lTabs button[data-l]").forEach(b=>
    b.classList.toggle("on", b.dataset.l===state.lTab));
}
function renderLeft(){
  paintLeftTabs();
  const p=$("#lPane"), q=state.watchOnly?"":"";   // search now uses its own dropdown
  if(state.lTab==="tokens"){
    const rows=Object.entries(stocks)
      .filter(([t])=>!state.watchOnly||state.starred[t])
      .filter(([t,s])=>!q||t.toLowerCase().includes(q)||s.name.toLowerCase().includes(q));
    // starred markets ride at the top, in the order they were starred
    const starred=rows.filter(([t])=>state.starred[t]);
    const rest=rows.filter(([t])=>!state.starred[t]);
    const row=([t,s])=>`
      <button class="tok-row ${t===state.sel?'on':''}${state.starred[t]?' fav':''}" data-tok="${t}">
        ${tAv(t,30)}
        <span class="nm"><b>${s.name}</b><small>${t}</small></span>
        <span class="pr"><b>${fmt(s.price)}</b><span class="${s.chg24>=0?'up':'down'}">${s.chg24>=0?'+':''}${s.chg24.toFixed(2)}%</span></span>
      </button>`;
    const divider=(starred.length&&rest.length&&!state.watchOnly)
      ? `<div class="tok-sep"><span>All markets</span></div>` : "";
    p.innerHTML=(state.watchOnly?`<div class="rw-h" style="margin-top:2px">Watchlist</div>`:"")
      +starred.map(row).join("")+divider+rest.map(row).join("");
  }
  if(state.lTab==="leaderboard"){
    p.innerHTML=lbToggleHTML()+lbBodyHTML();
  }
  if(state.lTab==="feed"){
    const list=feedList();
    p.innerHTML=feedToggleHTML()+(list.length?list.map(pickCard).join(""):feedEmptyHTML());
  }
  if(state.lTab==="alerts"){
    const list=(state.alerts||[]);
    p.innerHTML=(state.introDone?"":introHTML())+
      (list.length?list.map(a=>`
      <div class="alert-card${a.uid?" clickable-u":""}"${a.uid?` data-profile="${a.uid}"`:""}>
        ${alertFaceHTML(a)}
        <span><b>${a.title}</b><small>${a.sub} · ${ago(a.ts)} ago</small></span>
      </div>`).join(""):`<div class="empty">No notifications yet. Follow people to get notifications and track when they post a pick.</div>`);
    if(unreadAlerts()) markAlertsRead();
  }
}

/* the contract address, from the one place it is defined: config.js */
function siteCA(){ return String((window.STOCKPICKR_CA||"")).trim(); }
function caBoxHTML(){
  const ca=siteCA();
  const shown=ca?(ca.slice(0,6)+String.fromCharCode(8230)+ca.slice(-4)):"soon";
  return '<div class="rw-ca'+(ca?'':' rw-ca-soon')+'"'+(ca?' id="rwCa" title="'+ca+'"':'')+'>'
    +'<span class="rw-ca-l">CA:</span><span class="rw-ca-v">'+shown+'</span>'
    +(ca?'<span class="rw-ca-c">copy</span>':'')+'</div>';
}
function wireCaBox(){
  const b=document.getElementById("rwCa"); if(!b) return;
  b.onclick=()=>{ const ca=siteCA(); if(!ca||!navigator.clipboard) return;
    navigator.clipboard.writeText(ca).then(()=>{
      const c=b.querySelector(".rw-ca-c"); if(!c) return;
      c.textContent="copied"; setTimeout(()=>{c.textContent="copy";},1200);
    }).catch(()=>{});
  };
}
/* -------- claiming rewards --------
   The server publishes what each picker earned as a Merkle root and funds a
   distributor contract. Claiming is a transaction the picker signs from their
   own wallet: nothing here can move money, it can only present a proof that
   the published root already agrees with. */
const REWARDS_ADDR=()=>String(window.STOCKPICKR_REWARDS||"").trim();
let myRewards={loaded:false,total:0n,cycles:[]};
let paidPicks={};                 // pick id -> what it was actually paid
/* wallet -> total wei actually paid out to it, which is what the rewards
   board ranks on. Nothing was ever filling the old figure in, so every picker
   sat at $0.00 whatever they had earned. */
let claimedByWallet={};
function applyClaimed(){
  const px=ethRate();
  for(const u of users){
    let wei=0n;
    const list=(u.id==="me") ? allMyWallets() : [u.id];
    for(const w of list){
      const v=claimedByWallet[String(w).toLowerCase()];
      if(v) wei+=BigInt(v);
    }
    u.claimedEth=Number(wei)/1e18;
    u.rewards=u.claimedEth*px;
  }
}
/* Whether the treasury can pay a claim at all. A distributor contract pays
   from its own balance and needs nothing from us, so it counts as ready. */
let payoutsReady=true;
async function loadPaidPicks(){
  try{
    const d=await API.get("/api/rewards");
    paidPicks=d.picks||{};
    if(d.nextPoolWei) nextPoolEth=Number(BigInt(d.nextPoolWei))/1e18;
    if(d.claimed) claimedByWallet=d.claimed;
    if(d.ethUsd>0) poolRateUsd=d.ethUsd;
    if(d.maxPickUsd>0) SCORE.MAX_PICK_USD=d.maxPickUsd;
    if(d.payouts) payoutsReady=(d.payouts==="ready");
    if(!walletState.ethUsd){ try{ walletState.ethUsd=await ethPriceUsd(); }catch(e){} }
    refreshScores();                     // estimates are priced off that pool
    applyClaimed();                      // and the board ranks on what was paid
    renderAll();
  }catch(e){ /* an estimate is still shown */ }
}
// a cycle can settle while the page is open, so keep checking what was paid
setInterval(loadPaidPicks, 120000);
/* Once a cycle is settled the figure is no longer a guess, so say which it is.
   Before that, the estimate is what the current pool would pay if the cycle
   closed now. */
function rewardCellHTML(c){
  const paid=paidPicks[String(c.id)];
  if(paid){
    const e=Number(BigInt(paid.amount))/1e18;
    const usd=ethRate()?e*ethRate():0;
    // a few cents rounds to $0.00, which reads as nothing rather than as paid
    const shown=usd>=0.01?fmt(usd):`${ethFmt(e)} ETH`;
    return `<b class="gold">${shown}</b><small>paid</small>`;
  }
  const est=SC.est.get(c.id)||0;
  if(est>0){
    // a few tenths of a cent reads as $0.00, which looks like nothing earned
    const shown=est>=0.01?fmt(est):(ethRate()?`${ethFmt(est/ethRate())} ETH`:"tiny");
    return `<b class="gold">${shown}</b><small>estimate</small>`;
  }
  const sc=SC.out.get(c.id);
  // say which kind of nothing it is, rather than leaving it ambiguous
  return `<b>${sc&&sc.eligible?"Pending":"None yet"}</b>`;
}

/* Tell you when a pick has earned.

   Same rule as picks: the first look on a browser records what is already
   owed without announcing it, so signing in does not replay every cycle ever
   settled. After that a newly owed cycle is one notification, once. */
function announceRewards(open){
  const seen=new Set(state.seenRewards||[]);
  const first=!Array.isArray(state.seenRewards)||!state.seenRewards.length;
  const fresh=[];
  for(const c of open){
    const k=String(c.cycle);
    if(seen.has(k)) continue;
    seen.add(k);
    if(!first) fresh.push(c);
  }
  state.seenRewards=[...seen].slice(-200);
  fresh.sort((x,y)=>(x.settledAt||0)-(y.settledAt||0));
  for(const c of fresh){
    const eth=Number(BigInt(c.amount))/1e18;
    const usd=ethRate()?` (${fmt(eth*ethRate())})`:"";
    const what=(c.items&&c.items.length)
      ? `Your pick on ${c.items[0].tick}${c.items.length>1?" and "+(c.items.length-1)+" more":""} earned`
      : "One of your picks earned";
    pushAlert("pool","You earned a reward",
      `${what} ${ethFmt(eth)} ETH${usd}. Claim it on the Rewards tab.`,
      null,"reward:"+c.cycle);
  }
  if(fresh.length||first) save();
}

async function loadRewards(){
  const w=myWallet(); if(!w){ myRewards={loaded:true,total:0n,cycles:[]}; return; }
  try{
    const d=await API.get("/api/rewards?wallet="+w);
    /* The server says what it has already paid, and that is the answer when
       the treasury pays directly. Without this every cycle stayed claimable
       on screen after it had been paid, which reads as money going missing. */
    const cycles=(d.cycles||[]);
    const addr=REWARDS_ADDR();
    if(addr){
      const v=await viem();
      for(const c of cycles){
        try{
          const data=v.encodeFunctionData({
            abi:v.parseAbi(["function hasClaimed(uint256,address) view returns (bool)"]),
            functionName:"hasClaimed",args:[BigInt(c.cycle),v.getAddress(w)]});
          const r=await rpcCall("eth_call",[{to:addr,data},"latest"]);
          c.claimed=BigInt(r||"0x0")===1n;
        }catch(e){ c.claimed=false; }
      }
    }
    const open=cycles.filter(c=>!c.claimed);
    myRewards={loaded:true,cycles,total:open.reduce((a,c)=>a+BigInt(c.amount),0n)};
    announceRewards(open);
    paintClaimed();
  }catch(e){ myRewards={loaded:true,total:0n,cycles:[]}; }
  // the rewards panel prices itself in dollars, so make sure we have a rate
  if(!walletState.ethUsd){ try{ walletState.ethUsd=await ethPriceUsd(); }catch(e){} }
  paintRewardDot();
  if(state.pageNav==="rewards") renderPage("rewards");
}

async function claimCycle(cycle){
  const w=myWallet(); if(!w) return toast("Connect a wallet first.");
  const c=myRewards.cycles.find(x=>String(x.cycle)===String(cycle));
  if(!c) return toast("Nothing to claim for that cycle.");
  const btn=document.querySelector(`[data-claim="${cycle}"]`);
  if(btn){ btn.disabled=true; btn.textContent="Claiming"+String.fromCharCode(8230); }
  const done=()=>{ if(btn){ btn.disabled=false; btn.textContent="Claim"; } };
  const addr=REWARDS_ADDR();
  try{
    if(addr){
      // a distributor is deployed: claim it yourself, from your own wallet
      const v=await viem();
      const data=v.encodeFunctionData({
        abi:v.parseAbi(["function claim(uint256,address,uint256,bytes32[])"]),
        functionName:"claim",
        args:[BigInt(c.cycle), v.getAddress(w), BigInt(c.amount), c.proof]});
      await sendTx({to:addr,data,value:"0x0"}, `Claiming ${ethFmt(Number(BigInt(c.amount))/1e18)} ETH...`);
    }else{
      // otherwise the treasury pays it out directly
      const r=await API.post("/api/claim",{wallet:w,cycle:c.cycle});
      if(r && r.txHash) toast(`Paid ${ethFmt(Number(BigInt(c.amount))/1e18)} ETH to your wallet.`);
    }
    c.claimed=true;
    myRewards.total=myRewards.cycles.filter(x=>!x.claimed).reduce((a,x)=>a+BigInt(x.amount),0n);
    paintRewardDot();
    fetchWalletBalance();
    if(state.pageNav==="rewards") renderPage("rewards");
    toast("Rewards claimed. The ETH is in your wallet.");
  }catch(e){
    const m=String(e.message||e);
    // the server is the record: if it says this is paid, the screen was stale
    if(/already claimed/i.test(m)){
      c.claimed=true;
      myRewards.total=myRewards.cycles.filter(x=>!x.claimed).reduce((a,x)=>a+BigInt(x.amount),0n);
      paintRewardDot();
      if(state.pageNav==="rewards") renderPage("rewards");
      toast("That one has already been paid out.");
    }else toast("Claim failed: "+m.slice(0,120));
  }
  done();
}

/* a quiet marker on the Rewards tab when money is waiting, in the top nav and
   on the phone bar, cleared as soon as it has been claimed */
/* Nothing to repaint if the panel is not on screen; loadRewards runs on a
   timer and the rewards page rerenders itself from myRewards. */
function paintClaimed(){ if(state.pageNav==="rewards") renderPage("rewards"); }
function paintRewardDot(){
  const owed=myRewards.loaded && myRewards.cycles.some(c=>!c.claimed);
  document.querySelectorAll('#topNav [data-nav="rewards"], #tabbar [data-tab="rewards"]')
    .forEach(b=>b.classList.toggle("has-reward", !!owed));
}
/* ETH means little on its own, so every figure carries what it is worth. The
   price is only known once the wallet balance has loaded, so the tag is left
   off rather than showing a wrong zero. */
function usdTag(wei){
  const px=ethRate();
  if(!px) return "";
  return ` <span class="rw-usd">${fmt(Number(BigInt(wei))/1e18*px)}</span>`;
}
function claimPanelHTML(){
  if(!state.authed) return "";
  const addr=REWARDS_ADDR();
  if(!myRewards.loaded) return `<div class="rw-claim"><div class="rw-claim-h">Your rewards</div>
    <div class="rw-claim-sub">Checking what you are owed&hellip;</div></div>`;
  const open=myRewards.cycles.filter(c=>!c.claimed);
  const eth=Number(myRewards.total)/1e18;
  if(!open.length) return `<div class="rw-claim"><div class="rw-claim-h">Your rewards</div>
    <div class="rw-claim-sub">Nothing to claim yet. Make picks on tokenized stocks to claim.</div></div>`;
  /* A row is named after the work it paid for, not the cycle it landed in: the
     stock that was called and when. Cycle numbers are ours, not theirs. */
  const label=c=>{
    const it=c.items||[];
    if(!it.length) return `Cycle ${c.cycle}`;
    const when=it[0].at?` <small>${ago(it[0].at)} ago</small>`:"";
    const head=it[0].tick||"Pick";
    const more=it.length>1?` <small>+${it.length-1} more</small>`:"";
    return `${head}${more}${when}`;
  };
  /* Nothing is lost while payouts are down: an allocation is a settled record
     and stays claimable. Better to say so than to offer a button that fails. */
  const live=!!addr||payoutsReady;
  const rows=open.map(c=>`<div class="rw-claim-row">
    <span>${label(c)}</span>
    <b>${ethFmt(Number(BigInt(c.amount))/1e18)} ETH${usdTag(c.amount)}</b>
    ${live?`<button class="rw-claim-btn" data-claim="${c.cycle}">Claim</button>`
          :`<span class="rw-claim-wait">Pending</span>`}
  </div>`).join("");
  return `<div class="rw-claim">
    <div class="rw-claim-h">Your rewards</div>
    <div class="rw-claim-total">${ethFmt(eth)} ETH${usdTag(myRewards.total)}<small>${live?"ready to claim":"earned, waiting on payouts"}</small></div>
    ${rows}
    ${live?"":`<div class="rw-claim-sub" style="margin-top:12px">Payouts are being switched on. What you have earned is recorded and stays yours to claim.</div>`}

  </div>`;
}
function wireClaims(){
  document.querySelectorAll("#pvBody [data-claim]").forEach(b=>b.onclick=()=>claimCycle(b.dataset.claim));
}

function rewardsNoticeHTML(){
  return `${claimPanelHTML()}<div class="rw-notice">
    <span class="rw-badge">25%</span>
    <h3>25% of the fees go to the creators</h3>
    <p>A quarter of the fees from the coin we are launching on Robinhood goes into a treasury wallet,
    and gets paid out to the creators who pick the market.</p>
    ${caBoxHTML()}
    <div class="rw-divide"></div>

  </div>
  <div class="rw-how">
    <div class="rw-how-h">How it works</div>
    <div class="rw-steps">
      <div class="rw-step"><span class="n">1</span>
        <b>Fees</b><span>Stockpickr takes nothing from a trade. The pool is funded by 25% of the trading fees on the Stockpickr coin.</span></div>
      <div class="rw-step"><span class="n">2</span>
        <b>Rewards pool</b><span>That share is routed into the treasury wallet that holds the rewards pool.</span></div>
      <div class="rw-step"><span class="n">3</span>
        <b>Payouts</b><span>The pool is used to pay the creators for their picks.</span></div>
    </div>
  </div>`;
}
function rewardsPaneHTML(){
    const share=SC.shares.get("me")||0;
    const myEst=poolAmount()*share;
    const topRows=[...SC.shares.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
    return `
      ${claimPanelHTML()}
      <div class="rw-pool">
        <div class="lbl">Pick Rewards pool</div>
        <div class="big">25% of coin fees</div>
        <div class="rw-pool-sub">Routed to the treasury and paid out to pickers every 24 hours.</div>
      </div>
      ${state.authed?`<div class="rw-mine">
        <div class="row"><span>Your eligible picks</span><b>${picks.filter(c=>c.user==="me"&&c.epoch===state.epochN&&SC.out.get(c.id)?.eligible).length}</b></div>
        <div class="row"><span>Your pool share</span><b>${(share*100).toFixed(2)}%</b></div>
        <div class="row"><span>Estimated payout this cycle</span><b class="gold">${myEst>0?fmt(myEst):"None yet"}</b></div>
        <div class="row"><span>Lifetime rewards</span><b>${fmt(byId("me").rewards)}</b></div>
      </div>`:`<div class="rw-mine"><div class="row"><span>Sign in to earn from the pool.</span></div></div>`}
      <div class="rw-h">Top earners right now</div>
      ${topRows.length?topRows.map(([uid,sh],i)=>{const u=byId(uid);return `
        <div class="lb-row">
          <span class="medal ${i<3?'m'+(i+1):''}">${i+1}</span>
          <span class="clickable-u" data-profile="${u.id}" style="display:flex;flex-shrink:0">${uAv(u,30)}</span>
          <span class="nm clickable-u" data-profile="${u.id}"><b>${u.name}</b><small>@${u.handle}</small></span>
          <span class="pnl">${fmt(poolAmount()*sh)}<small>${(sh*100).toFixed(1)}% share</small></span>
        </div>`;}).join(""):`<div class="empty">No eligible picks yet.</div>`}
      <div class="rw-h">Past payouts</div>
      <table class="rw-hist">${[...state.history].reverse().map(h=>`
        <tr><td><b>Payout</b><br>top: @${h.top}</td><td>pool ${fmt0(h.pool)}<br><b class="${h.mine>0?'up':''}">${h.mine>0?"you: "+fmt(h.mine):", "}</b></td></tr>`).join("")}
      </table>`;
}

/* -------- center -------- */
function renderHead(){
  const t=state.sel,s=stocks[t];
  if(!s) return;   // the market list can change under us while data loads
  const up=s.chg24>=0;
  $("#stockHead").innerHTML=`
    <div class="sh-hero">
      <div class="shh-price">
        <b>${fmt(s.price)}</b>
        <span class="${up?"up":"down"}">${up?"▲":"▼"} ${Math.abs(s.chg24).toFixed(2)}% <i>24h</i></span>
      </div>
      <div class="shh-mc"><b>${s.mcap}</b><small>Market cap</small></div>
    </div>
    <div class="sh-id">
      ${tAv(t,34)}
      <span><b>${s.name}</b> <button class="star ${state.starred[t]?'on':''}" id="starBtn">★</button><small>${t} · tokenized</small></span>
    </div>
    <div class="stats">
      <div class="stat"><div class="lbl">Market cap${s.rank?" · #"+s.rank:""}</div><b>${s.mcap}</b></div>
      <div class="stat"><div class="lbl">Price</div><b>${fmt(s.price)}</b></div>
      <div class="stat"><div class="lbl">24H change</div><b class="${s.chg24>=0?'up':'down'}">${s.chg24>=0?'▲':'▼'} ${Math.abs(s.chg24).toFixed(2)}%</b></div>
      ${(s.live||s.poolLive)?`
      <div class="stat"><div class="lbl">Volume (24h)</div><b>${s.vol24||", "}</b></div>
      <div class="stat"><div class="lbl">FDV</div><b>${s.fdv||", "}</b></div>
      <div class="stat"><div class="lbl">Circulating supply</div><b>${s.supply||", "}</b></div>`:`
      <div class="stat"><div class="lbl">Liquidity</div><b>${s.liq}</b></div>
      <div class="stat"><div class="lbl">Holders</div><b>${s.holders}</b></div>`}
    </div>`;
  $("#starBtn").onclick=()=>{
    state.starred[t]=!state.starred[t];
    renderHead(); renderLeft();          // the list re-orders as you star
    save();
    toast(state.starred[t]?`<b>${t}</b> pinned to the top of your list.`:`<b>${t}</b> unpinned.`);
  };
}

/* -------- live on-chain chart (GeckoTerminal embed, Robinhood Chain) -------- */
let poolCache={}; try{poolCache=JSON.parse(localStorage.getItem("sp_pools")||"{}")}catch(e){}
/* A pool lookup that fails is not the same as a market that does not exist.
   The old form treated a rate limit as "no market", cached nothing, and the
   picker then showed "No on-chain market found" for a stock that trades fine.
   Undefined means we could not find out; null means we asked and there is
   genuinely nothing. Only the second is remembered. */
async function resolvePool(tick){
  if(poolCache[tick]!==undefined) return poolCache[tick];
  const sym=tick.replace(/x$/,"");
  const d=await gtFetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${encodeURIComponent(sym)}&network=robinhood`);
  if(!d) return undefined;                 // could not ask; try again later
  const cands=(d.data||[]).filter(x=>String(x.attributes&&x.attributes.name||"").toUpperCase().startsWith(sym+" /"));
  cands.sort((a,b)=>(+((b.attributes.volume_usd||{}).h24)||0)-(+((a.attributes.volume_usd||{}).h24)||0));
  const addr=(cands[0]&&cands[0].attributes.address)||null;
  poolCache[tick]=addr;
  try{localStorage.setItem("sp_pools",JSON.stringify(poolCache))}catch(e){}
  return addr;
}
/* Every GeckoTerminal call goes through one queue with a minimum gap between
   requests. Independent retries were tripping each other into 429s, so adding
   retries made the app slower, not faster. Foreground work - the chart and the
   stats for the stock you are looking at - jumps ahead of background work like
   token discovery.

   Answers are cached for a few seconds too: switching to a stock and back used
   to re-ask for something we had just been told. */
const GT_GAP=900;                    // ms between requests, comfortably under the limit
let gtLast=0, gtChain=Promise.resolve();
const gtQueue=[];                    // background work, drained when nothing urgent
const gtCache=new Map();             // url -> cached answer
const GT_TTL=8000;

function gtRun(fn){
  gtChain=gtChain.then(async()=>{
    const wait=Math.max(0, gtLast+GT_GAP-Date.now());
    if(wait) await new Promise(r=>setTimeout(r,wait));
    gtLast=Date.now();
    return fn();
  }).catch(()=>null);
  return gtChain;
}

async function gtRaw(url){
  for(let i=0;i<3;i++){
    let r;
    try{ r=await fetch(url,{cache:"no-store"}); }
    catch(e){ await new Promise(z=>setTimeout(z,500*(i+1))); continue; }
    if(r.status===429||r.status>=500){ await new Promise(z=>setTimeout(z,900*(i+1))); continue; }
    if(!r.ok) return null;
    try{ return await r.json(); }catch(e){ return null; }
  }
  return null;
}

async function gtFetch(url){
  const hit=gtCache.get(url);
  if(hit && Date.now()-hit.t<GT_TTL) return hit.v;      // just asked, reuse it
  const v=await gtRun(()=>gtRaw(url));
  if(v) gtCache.set(url,{t:Date.now(),v});
  return v;
}
async function fetchPoolStats(tick){
  const pool=await resolvePool(tick);
  if(!pool||!stocks[tick]) return;          // undefined or null: nothing to read yet
  try{
    const j=await gtFetch(`https://api.geckoterminal.com/api/v2/networks/robinhood/pools/${pool}`);
    if(!j) return;
    const a=(j.data||{}).attributes; if(!a) return;
    const st=stocks[tick]; if(!st) return;
    const num=v=>{const n=parseFloat(v); return isFinite(n)?n:null;};
    const price=num(a.base_token_price_usd);   if(price)  st.price=price;
    const chg  =num((a.price_change_percentage||{}).h24); if(chg!=null) st.chg24=chg;
    const mc   =num(a.market_cap_usd);         if(mc)     st.mcap=big$(mc);
    const fdv  =num(a.fdv_usd);                if(fdv)    st.fdv=big$(fdv);
    const vol  =num((a.volume_usd||{}).h24);   if(vol!=null) st.vol24=big$(vol);
    const liq  =num(a.reserve_in_usd);         if(liq)    st.liq=big$(liq);
    const tx=(a.transactions||{}).h24;
    if(tx) st.txns={buys:+tx.buys||0,sells:+tx.sells||0,buyers:+tx.buyers||0,sellers:+tx.sellers||0};
    if(mc&&price) st.supply=kfmt(mc/price)+" "+tick;
    st.poolLive=true; st.liveLoaded=true;
    st.statsAt=Date.now();
    if(state.sel===tick){
      const before=$("#stockHead").textContent;
      renderHead(); renderAbout(); renderMobileTrade(); renderBuy();
      if($("#stockHead").textContent!==before) pulseHead();
    }
    if(state.lTab==="tokens") renderLeft();
    if(state.pageNav) refreshPage();
  }catch(e){}
}
let chartTick=null;
let chartRetry=null, chartTries=0;
async function renderChart(){
  const t=state.sel, wrap=$("#chartWrap");
  if(!wrap||chartTick===t) return;          // only rebuild when the asset changes
  chartTick=t;
  const sym=t.replace(/x$/,"");
  $("#chartPair").textContent=`${sym} · on-chain price · Robinhood Chain`;
  wrap.innerHTML=`<div class="chart-loading">Loading live ${sym} chart…</div>`;
  const pool=await resolvePool(t);
  if(chartTick!==t) return;                  // user switched while we were fetching
  const be=$("#birdeyeLink");
  if(be) be.href=`https://birdeye.so/token/${stocks[t]&&stocks[t].addr||""}?chain=robinhood`;
  if(pool===undefined){
    // the lookup failed rather than came back empty: say so and try again
    wrap.innerHTML=`<div class="chart-loading">Loading live ${sym} chart&hellip;</div>`;
    chartTick=null;
    clearTimeout(chartRetry);
    chartTries=Math.min(5,(chartTries||0)+1);
    chartRetry=setTimeout(()=>{ if(state.sel===t) renderChart(); }, 900*Math.pow(1.8,chartTries));
    return;
  }
  if(!pool){ wrap.innerHTML=`<div class="chart-loading">No on-chain market found for ${sym} yet.</div>`; return; }
  chartTries=0;
  wrap.innerHTML=`<iframe class="chart-embed" title="${sym} live chart" loading="lazy"
    src="https://www.geckoterminal.com/robinhood/pools/${pool}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0"
    allow="clipboard-write" frameborder="0"></iframe>`;
}

/* a brief highlight when a live figure changes */
function pulseHead(){
  document.querySelectorAll("#stockHead .stat b").forEach(el=>{
    el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  });
}

/* -------- bottom panel -------- */
function renderBp(){
  const t=state.sel, b=$("#bpBody");
  document.querySelectorAll("#bpTabs [data-bp]").forEach(x=>x.classList.toggle("on",x.dataset.bp===state.bpTab));
  const th=picks.filter(c=>c.tick===t).sort((a,b)=>b.ts-a.ts);
  document.querySelector('[data-bp="thesis"]').textContent=`Picks (${th.length})`;
  if(state.bpTab==="thesis"){
    b.innerHTML=th.length?`<table><thead><tr><th>Picker</th><th>Pick</th><th>Since pick</th><th>Thesis</th><th>Reward</th><th></th><th></th></tr></thead><tbody>`+
      th.map(c=>{
        const u=byId(c.user);
        const pnl=sinceCall(c), est=SC.est.get(c.id)||0;
        return `<tr>
          <td><span class="u clickable-u" data-profile="${u.id}">${uAv(u,26)}<span><b>${u.name}</b><small>@${u.handle} · reach ${kfmt(c.m.viewers)}</small></span></span></td>
          <td><span style="color:var(--muted)">${fmt(c.entry)}</span></td>
          <td class="${pnl>=0?'up':'down'}" style="font-weight:600">${pnl>=0?'+':''}${pnl.toFixed(1)}%</td>
          <td class="thesis-txt">${c.thesis}</td>
          <td style="color:var(--accent);font-weight:600">${rewardCellHTML(c)}</td>
          <td><button class="likes ${c.liked?'on':''}" data-like="${c.id}">♥ ${c.likes}</button></td>
          <td><button class="via-btn" data-via="${c.id}">Buy via</button></td>
        </tr>`;}).join("")+`</tbody></table>`
      :`<div class="empty">No picks on ${t} yet. Post the first one, early discovery earns more.</div>`;
  }
  if(state.bpTab==="positions"){ b.innerHTML=positionsHTML(); }
  if(state.bpTab==="holders"){
    b.innerHTML=`<table><thead><tr><th>Trader</th><th>Position</th><th>PnL</th><th>Avg. entry</th></tr></thead><tbody>`+
      (holdersData[t]||[]).map(h=>{
        const u=byId(h.u);
        return `<tr>
          <td><span class="u clickable-u" data-profile="${u.id}">${uAv(u,26)}<span><b>${u.name}</b><small>@${u.handle}</small></span></span></td>
          <td><b>${fmt(h.pos)}</b></td>
          <td class="${h.pnl>=0?'up':'down'}" style="font-weight:600">${h.pnl>=0?'+':'-'}${fmt(Math.abs(h.pnl))}</td>
          <td style="color:var(--muted)">${fmt(h.entry)}</td>
        </tr>`;}).join("")+`</tbody></table>`;
  }
  if(state.bpTab==="swaps"){
    b.innerHTML=`<table><thead><tr><th>Trader</th><th>Side</th><th>Size</th><th>When</th></tr></thead><tbody>`+
      (swapsData[t]||[]).map(w=>{
        const u=byId(w.u);
        return `<tr>
          <td><span class="u clickable-u" data-profile="${u.id}">${uAv(u,26)}<span><b>${u.name}</b><small>@${u.handle}</small></span></span></td>
          <td class="${w.side==="Buy"?'up':'down'}" style="font-weight:600">${w.side}</td>
          <td><b>${fmt(w.usd)}</b></td>
          <td style="color:var(--muted)">${w.ago} ago</td>
        </tr>`;}).join("")+`</tbody></table>`;
  }
}

/* -------- right -------- */
function renderBuy(){
  const t=state.sel, amt=Math.max(0,parseFloat($("#buyAmt").value)||0);
  $("#availTxt").textContent=walletState.live?`${walletText()}${walletUsd()?" ("+walletUsd()+")":""} in wallet`:`${fmt(state.balance)} available`;
  $("#feeHint").textContent="No Stockpickr fee";
  const via=state.via?picks.find(c=>c.id===state.via):null;
  $("#viaLine").classList.toggle("on",!!via);
  if(via) $("#viaTxt").textContent=`Attributed to @${byId(via.user).handle}'s pick`;
  $("#feeBox").innerHTML=`
    <div class="row"><span>Order</span><b>${fmt(amt)}</b></div>
    <div class="row"><span>Stockpickr fee</span><span class="gold">None</span></div>
    <div class="row"><span>Attribution</span><b>${via?"@"+byId(via.user).handle:", "}</b></div>
    <div class="row"><span>Total</span><b>${fmt(amt)}</b></div>`;
  $("#bigBuy").textContent=`Buy ${t}`;
}
function renderSell(){
  // every open position, selected asset first, not just the asset on screen
  const list=$("#sellList"), pos=[...state.positions].sort((a,b)=>(b.tick===state.sel)-(a.tick===state.sel));
  list.innerHTML=pos.length?pos.map(p=>{
    const cur=stocks[p.tick].price, val=p.usd*(cur/p.entry), chg=(cur-p.entry)/p.entry*100;
    return `<div class="pos-row">
      ${tAv(p.tick,26)}
      <span class="grow"><b>${p.tick}</b> <small style="color:var(--muted)">${fmt(val)}</small><br><small style="color:var(--muted)">in at ${fmt(p.entry)}</small></span>
      <span class="${chg>=0?'up':'down'}" style="font-weight:600;font-size:12px">${chg>=0?'+':''}${chg.toFixed(1)}%</span>
      <button class="sellbtn" data-sell="${p.id}">Sell</button>
    </div>`;}).join(""):`<div class="empty">No open positions.</div>`;
}
function renderAbout(){
  const t=state.sel;
  if(!t||!stocks[t]) return;   // selection can be missing while markets load
  const s=stocks[t], r=rng([...t].reduce((a,c)=>a*7+c.charCodeAt(0),5));
  $("#aboutName").textContent=`About ${t}`;
  $("#aboutSub").textContent=(s.live||s.poolLive)?`${s.name} · live market data`:`${s.name}, tokenized 1:1 · settles on-chain`;
  if((s.live||s.poolLive)&&s.liveLoaded){
    $("#tfTiles").innerHTML=`
      <div class="tf-tile"><div class="lbl">24h low</div><b>${s.lo24>=1000?fmt0(s.lo24):fmt(s.lo24)}</b></div>
      <div class="tf-tile"><div class="lbl">24h high</div><b>${s.hi24>=1000?fmt0(s.hi24):fmt(s.hi24)}</b></div>
      <div class="tf-tile"><div class="lbl">24h</div><b class="${s.chg24>=0?'up':'down'}">${s.chg24>=0?'▲':'▼'} ${Math.abs(s.chg24).toFixed(2)}%</b></div>
      <div class="tf-tile"><div class="lbl">Rank</div><b>#${s.rank||", "}</b></div>`;
  }else{
    const tf=[["5M",(r()-.4)*1.4],["1H",(r()-.4)*3],["4H",(r()-.35)*6],["1D",s.chg24]];
    $("#tfTiles").innerHTML=tf.map(([l,v])=>`<div class="tf-tile"><div class="lbl">${l}</div><b class="${v>=0?'up':'down'}">${v>=0?'▲':'▼'} ${Math.abs(v).toFixed(2)}%</b></div>`).join("");
  }
  // your live position in this stock, if you hold one
  const box=$("#aboutPos");
  if(box){
    const held=state.positions.filter(p=>p.tick===t);
    if(!state.authed||!held.length){ box.hidden=true; box.innerHTML=""; }
    else{
      const cost=held.reduce((a,p)=>a+p.usd,0);
      const val=held.reduce((a,p)=>a+p.usd*(s.price/p.entry),0);
      const avg=held.reduce((a,p)=>a+p.entry*p.usd,0)/(cost||1);
      const pnl=val-cost, pct=cost?pnl/cost*100:0;
      box.hidden=false;
      box.innerHTML=`<div class="ap-row">
        <span><small>Your position</small><b>${fmt(val)}</b></span>
        <span><small>Avg. entry</small><b>${fmt(avg)}</b></span>
        <span class="ap-pnl"><small>Live PnL</small>
          <b class="${pnl>=0?"up":"down"}">${pnl>=0?"+":"-"}${fmt(Math.abs(pnl))}
          <i>(${pct>=0?"+":""}${pct.toFixed(2)}%)</i></b></span>
      </div>`;
    }
  }
  const tx=s.txns;
  const buys=tx?tx.buys:1800+Math.floor(r()*2200), sells=tx?tx.sells:1600+Math.floor(r()*2200);
  $("#buysN").textContent=buys.toLocaleString()+" buys"; $("#sellsN").textContent=sells.toLocaleString()+" sells";
  $("#bsBar").innerHTML=`<span class="g" style="width:${buys/(buys+sells)*100}%"></span><span class="r" style="flex:1"></span>`;
  const buyers=tx?tx.buyers:900+Math.floor(r()*900), sellers=tx?tx.sellers:800+Math.floor(r()*900);
  $("#buyersN").textContent=buyers.toLocaleString()+" buyers"; $("#sellersN").textContent=sellers.toLocaleString()+" sellers";
  $("#brBar").innerHTML=`<span class="g" style="width:${buyers/(buyers+sellers)*100}%"></span><span class="r" style="flex:1"></span>`;
}
/* positions live in the bottom panel now, beside Holders and Swaps */
function positionsHTML(){
  if(!state.authed) return `<div class="empty">Sign in to trade and see positions.</div>`;
  if(!state.positions.length) return `<div class="empty">No open positions. Buy a stock to open one.</div>`;
  return `<table><thead><tr><th>Market</th><th>Value</th><th>Avg. entry</th><th>PnL</th><th></th></tr></thead><tbody>`+
    state.positions.map(p=>{
      const st=stocks[p.tick];
      const cur=st?st.price:p.entry, val=p.usd*(cur/p.entry), chg=(cur-p.entry)/p.entry*100;
      const pnl=val-p.usd;
      return `<tr>
        <td><span class="u">${tAv(p.tick,26)}<span><b>${p.tick}</b><small>${st?st.name:""}</small></span></span></td>
        <td><b>${fmt(val)}</b></td>
        <td style="color:var(--muted)">${fmt(p.entry)}</td>
        <td class="${chg>=0?'up':'down'}" style="font-weight:600">${pnl>=0?'+':'-'}${fmt(Math.abs(pnl))} <small>(${chg>=0?'+':''}${chg.toFixed(1)}%)</small></td>
        <td><button class="sellbtn" data-sell="${p.id}">Sell</button></td>
      </tr>`;}).join("")+`</tbody></table>`;
}
function renderPositions(){ if(state.bpTab==="positions") renderBp(); }
/* your avatar, painted on its own so a slow or failing section of the page
   can never leave it stale */
/* Installed as an app, the wordmark must not navigate out to the marketing
   site: there is no browser chrome to come back with. */
const inApp=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
/* Offer the app on a desktop browser only, and never inside the installed app:
   there is nothing to download once you are already running it. */
/* The header link to the app.

   This used to wait for beforeinstallprompt and install in place. That event
   fires once per browser and never again after it has been answered, so on
   most visits the button was simply absent, which read as it having been
   removed. It now points at the download page, which covers every platform,
   asks for the install prompt itself, and can say when the app is already
   installed. The only thing worth hiding it for is being inside the installed
   app already, or being on a phone, where the page is reached from the store
   badge instead. */
function wireGetApp(){
  const b=document.getElementById("getApp"); if(!b) return;
  const ua=navigator.userAgent||"";
  const phone=/Android|iPhone|iPad|iPod/i.test(ua);
  const wanted=!phone && !inApp();
  b.hidden=!wanted;
  if(wanted) b.style.display="inline-flex";
  // running as the installed app: remember it, so a later browser visit stays quiet
  if(inApp()){ try{ localStorage.setItem("sc_installed","1"); }catch(e){} }
  addEventListener("appinstalled",()=>{
    try{ localStorage.setItem("sc_installed","1"); }catch(e){}
  });
}
function lockToApp(){
  if(!inApp()) return;
  document.querySelectorAll('a[href="/"], a[href="index.html"]').forEach(a=>{
    a.removeAttribute("href"); a.style.cursor="default";
  });
  document.querySelectorAll(".statusbar a").forEach(a=>{
    if(a.getAttribute("href")==="/") a.remove();
  });
}
function paintMyAvatar(){
  const me=byId("me"), av=document.querySelector(".me-av");
  const tb=document.getElementById("tbAvatar");
  if(tb&&me) tb.src=me.img||"/logo.svg";
  if(!me||!av) return;
  av.innerHTML=me.img?`<img src="${me.img}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`
    :`<img src="/logo.svg" alt="" style="width:100%;height:100%;border-radius:50%;filter:hue-rotate(${me.hue||0}deg) saturate(1.15)">`;
}
function renderMoney(){
  const authed=!!state.authed;
  $("#depositChip").style.display=authed?"":"none";
  document.querySelector(".me-av").style.display=authed?"":"none";
  // the address belongs on the portfolio page, not in the header
  $("#privyBtn").style.display=privyState.wallet?"none":"";
  if(!authed)$("#privyLbl").textContent="Sign in";
  paintMyAvatar();
  $("#balance").innerHTML=balanceChipHTML();

}
function renderStatus(){
  paintRewardDot();
  $("#statusbar").innerHTML=Object.entries(stocks).slice(0,5).map(([t,s])=>
    `<span><b>${t}</b> ${fmt(s.price)} <span class="${s.chg24>=0?'up':'down'}">${s.chg24>=0?'▲':'▼'}${Math.abs(s.chg24).toFixed(2)}%</span></span>`).join("")+
    `<span class="links"><a href="/">Home</a><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Help</a></span>`;
}
function refreshPage(){ if(state.pageNav && !$("#pageView").hidden) renderPage(state.pageNav); }
function renderAll(){
  // each section is independent: one throwing must not blank the others
  for(const step of [refreshScores,renderLeft,paintTabDot,renderMobileTrade,renderHead,
                     renderChart,renderBp,renderBuy,renderSell,renderAbout,renderPositions,
                     renderMoney,renderStatus,refreshPage]){
    try{ step(); }catch(e){ console.error("render step failed:",step.name,e); }
  }
}

/* -------- profile -------- */
/* -------- portfolio: your account, in one page --------
   Everything that used to live in the profile modal, plus the wallets on the
   account and the positions the chain says you hold. */
function linkedWallets(){
  const P=window.Privy||{};
  return (P.wallets||[]).map(w=>({
    address:w.address,
    kind:w.walletClientType==="privy"?"Created by Privy":(w.walletClientType||"wallet"),
    active:(privyState.wallet&&privyState.wallet.address||"").toLowerCase()===String(w.address).toLowerCase()
  }));
}
const pfoAddr=a=>a?a.slice(0,6)+String.fromCharCode(8230)+a.slice(-4):"";

/* What the current pool would pay you if the cycle closed now. Driven by the
   live treasury balance, which is read but never displayed. */
function myEstimate(){
  try{ refreshScores(); return poolAmount()*(SC.shares.get("me")||0); }
  catch(e){ return 0; }
}
function portfolioHTML(){
  if(!state.authed) return `<div class="empty">Sign in to see your portfolio.</div>`;
  const u=byId("me");
  const needsHandle=!u.profileSet||!u.handle||u.handle==="you";
  const calls=picks.filter(c=>c.user==="me").sort((a,b)=>b.ts-a.ts);
  const wallets=linkedWallets();
  // one number for the whole book, from the same maths the positions table uses
  const bk=myBook();
  const cost=bk.cost, value=bk.value, pnl=bk.pnl, pct=bk.pct;

  return `
  <div class="pfo-top">
    <label class="pfo-av edit" for="pfoImg" title="Change your picture">
      ${pfoDraftImg
        ?`<img class="u-av" src="${pfoDraftImg}" alt="" style="width:64px;height:64px;object-fit:cover">`
        :uAv(u,64)}
      <span class="pfo-cam"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg></span>
    </label>
    <div class="pfo-who">
      <b>${needsHandle?"Your account":"@"+u.handle}</b>
      ${pfoDraftImg?`<span class="pfo-img-save">
        <button id="pfoImgSave">Save picture</button>
        <button id="pfoImgCancel" class="ghost">Cancel</button></span>`:""}
    </div>
    <button class="ghost pfo-out" id="pfoSignOut">Sign out</button>
  </div>

  ${needsHandle?`<div class="pfo-need">
     <b>Pick your username</b>
     <span>You need an @username before you can post picks or appear on the leaderboard.</span>
     <button class="primary" id="pfoMakeHandle">Create username</button>
   </div>`:""}

  <div class="pfo-sum">
    <div><small>Portfolio value</small><b>${fmt(value)}</b></div>
    <div><small>Open PnL</small><b class="${pnl>=0?"up":"down"}">${pnl>=0?"+":"-"}${fmt(Math.abs(pnl))}
      <i>(${pct>=0?"+":""}${pct.toFixed(2)}%)</i></b></div>
    <div><small>Realised all-time</small><b class="${(state.realised||0)>=0?"up":"down"}">
      ${(state.realised||0)>=0?"+":"-"}${fmt(Math.abs(state.realised||0))}
      <i>${(state.closed||0)?((state.closed||0)+" closed"):"none closed"}</i></b></div>
    <div><small>Rewards earned</small><b class="gold">${fmt(u.rewards||0)}</b></div>
    <div><small>Est. this cycle</small><b class="gold">${myEstimate()>0?fmt(myEstimate()):"None yet"}</b></div>
  </div>

  <div class="pfo-sec">
    <div class="pfo-h">Wallets<span>${wallets.length} linked</span></div>
    ${wallets.length?wallets.map(w=>`<div class="pfo-wal">
      <span class="pfo-dot ${w.active?"on":""}"></span>
      <span class="grow"><b>${pfoAddr(w.address)}</b><small>${w.kind}${w.active?" · trading from this one":""}</small></span>
      <button class="ghost pfo-copy" data-copy="${w.address}">Copy</button>
    </div>`).join(""):`<div class="empty">No wallet connected.</div>`}
    <button class="ghost pfo-add" id="pfoLink">Link another wallet</button>
    <div class="pfo-note">Linking a wallet adds it to this account. It does not create a second account, and your username stays the same.</div>
  </div>

  <div class="pfo-sec">
    <div class="pfo-h">Positions<span>${state.positions.length}</span></div>
    ${positionsHTML()}
  </div>

  <div class="pfo-sec">
    <div class="pfo-h">Your picks<span>${calls.length}</span></div>
    ${calls.length?calls.slice(0,10).map(c=>{
      const move=sinceCall(c);
      const av=stocks[c.tick]?tAv(c.tick,26)
        :`<span class="t-av" style="width:26px;height:26px;font-size:9px;background:${color(c.tick)}">${c.tick.slice(0,2)}</span>`;
      return `<div class="pf-call">
        <div class="pf-call-h">
          ${av}
          <span class="grow"><b>${c.tick}</b><small>${ago(c.ts)} ago · at ${fmt(c.entry)}</small></span>
          <span class="pf-call-num"><b class="${move>=0?"up":"down"}">${move>=0?"+":""}${move.toFixed(1)}%</b>
            <small class="pf-call-rw">${(SC.est.get(c.id)||0)>0?fmt(SC.est.get(c.id)):"no reward yet"}</small></span>
        </div>
        ${c.thesis?`<div class="pf-call-tx">${c.thesis}</div>`:""}
      </div>`;}).join(""):`<div class="empty">No picks yet. Buy a stock, then call it.</div>`}
  </div>

`;
}

/* the picture input is wired once at boot: it outlives every re-render */
/* A picture off a phone is several megabytes as a data URL, well past what the
   profile field holds, so it was stored truncated and came back broken or not
   at all. Everything is squared and scaled down to an avatar before it is sent,
   which also keeps it out of the way in local storage. */
function shrinkImage(file, px){
  return new Promise((resolve,reject)=>{
    const rd=new FileReader();
    rd.onerror=()=>reject(new Error("could not read that file"));
    rd.onload=()=>{
      const im=new Image();
      im.onerror=()=>reject(new Error("that file is not an image"));
      im.onload=()=>{
        const side=Math.min(im.width,im.height);        // centre crop to a square
        const cv=document.createElement("canvas");
        cv.width=cv.height=px;
        cv.getContext("2d").drawImage(im,(im.width-side)/2,(im.height-side)/2,side,side,0,0,px,px);
        let out=cv.toDataURL("image/jpeg",0.85);
        // a stubborn image gets another turn of the screw rather than failing
        if(out.length>300000) out=cv.toDataURL("image/jpeg",0.6);
        resolve(out);
      };
      im.src=rd.result;
    };
    rd.readAsDataURL(file);
  });
}

/* Your own picture is yours until the server confirms it. Syncing runs on a
   timer, and it used to copy the stored picture back over a fresh one that had
   not finished uploading, so a new avatar appeared and then vanished. */
let imgPending=false;
/* A picture you have picked but not saved. Holding it here rather than writing
   it straight to the account means the page can show it, you can back out of
   it, and a failed upload has nothing to undo. */
let pfoDraftImg=null;

async function pickPicture(file){
  try{ pfoDraftImg=await shrinkImage(file,256); }
  catch(e){ toast(String(e.message||e)); return; }
  if(state.pageNav==="portfolio") renderPage("portfolio");
}
function cancelPicture(){
  pfoDraftImg=null;
  if(state.pageNav==="portfolio") renderPage("portfolio");
}
async function savePicture(){
  const me=byId("me"); if(!me||!pfoDraftImg) return;
  const before=me.img||"";
  const btn=document.getElementById("pfoImgSave");
  if(btn){ btn.disabled=true; btn.textContent="Saving"+String.fromCharCode(8230); }
  me.img=pfoDraftImg; imgPending=true;
  save(); paintMyAvatar();
  let ok=false;
  try{ ok=await pushProfile(); }catch(e){ ok=false; }
  imgPending=false;
  if(ok){ pfoDraftImg=null; toast("Profile picture saved."); }
  else{ me.img=before; save(); paintMyAvatar(); toast("Could not save that picture. It has not been changed."); }
  if(state.pageNav==="portfolio") renderPage("portfolio");
}

(function wirePictureInput(){
  const inp=document.getElementById("pfoImg"); if(!inp) return;
  inp.onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    pickPicture(f);
    inp.value="";                       // the same file can be chosen again
  };
})();
function wirePortfolio(){
  const on=(id,fn)=>{ const el=document.getElementById(id); if(el) el.onclick=fn; };
  on("pfoMakeHandle",()=>showUsernameGate());
  on("pfoImgSave",savePicture);
  on("pfoImgCancel",cancelPicture);
  on("pfoLink",async()=>{
    const P=window.Privy;
    if(!P||!P.linkWallet) return toast("Privy is still loading, one moment.");
    const b=document.getElementById("pfoLink");
    b.disabled=true; b.textContent="Opening Privy"+String.fromCharCode(8230);
    try{ await P.linkWallet(); }
    catch(e){ toast("Wallet not linked: "+String((e&&e.message)||e).slice(0,90)); }
    b.disabled=false; b.textContent="Link another wallet";
  });
  document.querySelectorAll("#pvBody [data-copy]").forEach(b=>b.onclick=()=>{
    const a=b.dataset.copy;
    if(navigator.clipboard) navigator.clipboard.writeText(a).then(()=>{
      b.textContent="Copied"; setTimeout(()=>{b.textContent="Copy";},1200);
    }).catch(()=>{});
  });
  on("pfoSignOut",async()=>{
    const b=document.getElementById("pfoSignOut");
    try{ b.disabled=true; b.textContent="Signing out"+String.fromCharCode(8230);
      await (window.Privy&&window.Privy.logout?window.Privy.logout():Promise.resolve());
    }catch(_){}
    closePage(); toast("Signed out.");
  });

}

/* -------- public profiles: stockpickr.org/@handle --------
   The same shape as your own portfolio, minus anything private: no email,
   no wallet list, no settings. Holdings come from the chain, which is public
   anyway, so a picker can be checked against their own book. */
const HANDLE_RE=/^\/@([a-zA-Z0-9_.]{1,20})\/?$/;
function userByHandle(h){
  const k=String(h||"").toLowerCase();
  return users.find(u=>String(u.handle||"").toLowerCase()===k)||null;
}
/* Handles reach here from stored records and from on-screen text, so they turn
   up with a leading "@" or trailing junk attached. Everything that is not part
   of a handle is dropped before it is put in the address bar. */
const cleanHandle=h=>String(h||"").toLowerCase().replace(/^@+/,"").replace(/[^a-z0-9_.]/g,"").slice(0,20);
const profilePath=h=>"/@"+cleanHandle(h);

let pubHoldings={};                      // handle -> [{tick, units, usd}]
const pubBusy=new Set();
async function loadPublicHoldings(u){
  const w=u&&u.wallet; if(!w) return;
  const theirs=Array.isArray(u.wallets)&&u.wallets.length?u.wallets:[w];
  const key=u.handle;
  if(pubBusy.has(key)) return;            // the page repaints every 4s; do not restart
  pubBusy.add(key);
  const paint=rows=>{
    pubHoldings[key]=rows;
    if(state.pageNav==="public" && state.pubHandle===key) renderPage("public");
  };
  try{
    const all=Object.keys(stocks);
    const rows=[], seen=new Set();
    // nothing here may hang: a pool lookup or an RPC read that never settles
    // must not leave the page stuck on "Reading their wallet"
    const cap=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);
    const readBatch=async list=>{
      for(let i=0;i<list.length;i+=8){
        const batch=list.slice(i,i+8);
        const got=await Promise.all(batch.map(async t=>{
          try{
            let tot=null;
            for(const addr of theirs){
              const b=await cap(erc20Balance(tokenOf[t],addr),6000);
              if(b!=null) tot=(tot||0n)+b;
            }
            return [t,tot];
          }catch(e){ return [t,null]; }
        }));
        for(const [t,bal] of got){
          if(bal==null||bal<=0n||seen.has(t)) continue;
          seen.add(t);
          const st=stocks[t], units=Number(bal)/1e18;
          rows.push({tick:t,units,usd:units*(st?st.price:0)});
        }
        paint(rows.slice());             // show what we have as it arrives
      }
    };
    // 1. whatever we already know the address for, straight away
    await readBatch(all.filter(t=>tokenOf[t]));
    paint(rows.slice());                 // the page is answered by this point
    // 2. then fill in addresses we have never looked up, without blocking above
    const want=all.filter(t=>tokenOf[t]===undefined).slice(0,24);
    for(let i=0;i<want.length;i+=4){
      const batch=want.slice(i,i+4);
      await Promise.all(batch.map(t=>cap(tokenFor(t),5000)));
      await readBatch(batch.filter(t=>tokenOf[t]));
    }
    paint(rows);
  }catch(e){ paint(pubHoldings[key]||[]); }
  finally{ pubBusy.delete(key); }
}
function holdRowsHTML(rows){
  if(!rows.length) return `<div class="empty">No tokenised stocks in this wallet.</div>`;
  const body=rows.map(r=>`<tr><td><span class="u">${tAv(r.tick,26)}<span><b>${r.tick}</b><small>${stocks[r.tick]?stocks[r.tick].name:""}</small></span></span></td><td style="color:var(--muted)">${r.units.toFixed(4)}</td><td><b>${fmt(r.usd)}</b></td></tr>`).join("");
  return `<table><thead><tr><th>Market</th><th>Amount</th><th>Value</th></tr></thead><tbody>${body}</tbody></table>`;
}
function callRowsHTML(calls,limit){
  if(!calls.length) return `<div class="empty">No picks yet.</div>`;
  return calls.slice(0,limit).map(c=>{
    const move=sinceCall(c);
    const av=stocks[c.tick]?tAv(c.tick,26)
      :`<span class="t-av" style="width:26px;height:26px;font-size:9px;background:${color(c.tick)}">${c.tick.slice(0,2)}</span>`;
    const th=c.thesis?`<div class="pf-call-tx">${c.thesis}</div>`:"";
    return `<div class="pf-call"><div class="pf-call-h">${av}<span class="grow"><b>${c.tick}</b><small>${ago(c.ts)} ago · at ${fmt(c.entry)}</small></span><span class="pf-call-num"><b class="${move>=0?"up":"down"}">${move>=0?"+":""}${move.toFixed(1)}%</b></span></div>${th}</div>`;
  }).join("");
}

function publicHTML(handle){
  const u=userByHandle(handle);
  if(!u) return `<div class="empty">No picker called @${handle} yet.</div>`;
  if(u.id==="me") return portfolioHTML();      // your own handle shows your own page
  const calls=picks.filter(c=>c.user===u.id).sort((a,b)=>b.ts-a.ts);
  const wins=calls.filter(c=>sinceCall(c)>0).length;
  const winPct=calls.length?Math.round(wins/calls.length*100):0;
  const held=pubHoldings[u.handle];
  const book=(held||[]).reduce((a,r)=>a+(stocks[r.tick]?r.units*stocks[r.tick].price:r.usd),0);
  /* Price their book at the current price, using the per-unit cost they
     published for each holding. Units come from the chain and are current;
     cost per unit is the only thing the chain cannot tell us. Scaling by unit
     rather than trusting a total is what stops a basis published for one
     position being subtracted from a book that now holds three.

     A holding with no published basis is priced at cost, contributing zero,
     so an unknown can never invent a profit. */
  const perUnit=new Map((u.basis||[]).map(b=>[String(b.tick),
    Number(b.per)|| (b.units>0?Number(b.cost)/Number(b.units):0)]));
  let liveCost=0, liveVal=0, missing=0;
  for(const r of (held||[])){
    const px=stocks[r.tick]?stocks[r.tick].price:0;
    const val=r.units*px;
    const per=perUnit.get(r.tick);
    liveVal+=val;
    if(per>0) liveCost+=r.units*per; else { liveCost+=val; missing++; }
  }
  const havePriced=held && held.length>0 && missing<held.length;
  const pnlV=havePriced ? (liveVal-liveCost) : (Number(u.open)||0);
  const pnlPct=havePriced ? (liveCost>0?(liveVal-liveCost)/liveCost*100:null)
                          : (u.cost>0?((Number(u.open)||0)/u.cost*100):null);
  const staleBook=!havePriced && (Number(u.open)||0)!==0;
  const joined=u.joined?" · joined "+new Date(u.joined).toLocaleDateString("en-GB",{month:"short",year:"numeric"}):"";
  const holdings=held?holdRowsHTML(held):`<div class="empty">Reading their wallet&hellip;</div>`;
  return `
  <div class="pfo-top">
    <span class="pfo-av">${uAv(u,64)}</span>
    <div class="pfo-who">
      <b>@${u.handle}</b>
      <small>${u.wallet?pfoAddr(u.wallet):""}${joined}</small>
    </div>
    <button class="follow ${u.following?"on":""}" data-follow="${u.id}">${u.following?"Following":"Follow"}</button>
  </div>
  <div class="pfo-sum">
    <div><small>Realised all-time</small><b class="${(u.pnl||0)>=0?"up":"down"}">
      ${(u.pnl||0)>=0?"+":"-"}${fmt(Math.abs(u.pnl||0))}
      <i>${(u.closed||0)?((u.closed||0)+" closed"):"none closed"}</i></b></div>
    <div><small>Open PnL</small><b class="${pnlV>=0?"up":"down"}">${pnlV>=0?"+":"-"}${fmt(Math.abs(pnlV))}
      ${pnlPct!=null?`<i>(${pnlPct>=0?"+":""}${pnlPct.toFixed(2)}%)</i>`:""}</b>
      ${staleBook?`<small class="pfo-stale">as of their last visit</small>`
        :(missing?`<small class="pfo-stale">${missing} holding${missing===1?"":"s"} without a recorded entry</small>`:"")}</div>
    <div><small>Rewards earned</small><b class="gold">${fmt(u.rewards||0)}</b></div>
    <div><small>Picks</small><b>${calls.length}</b></div>
  </div>
  <div class="pfo-sec">
    <div class="pfo-h">Positions<span>${held?held.length:""}</span></div>
    ${holdings}
  </div>
  <div class="pfo-sec">
    <div class="pfo-h">Their picks<span>${calls.length}</span></div>
    ${callRowsHTML(calls,20)}
  </div>`;
}

function wirePublic(){
  const u=userByHandle(state.pubHandle);
  if(u && !pubHoldings[u.handle]) loadPublicHoldings(u);
}

/* open someone else's page, and put it in the address bar so it can be shared */
function openPublic(handle,push){
  const h=cleanHandle(handle);
  const u=userByHandle(h);
  if(u && u.id==="me") return openPortfolio();
  state.pubHandle=h;
  PV.public=["@"+h,"Public profile"];
  openPage("public");
  if(typeof markTab==="function") markTab("");
  document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.remove("on"));
  if(push!==false){ try{ history.pushState({pub:h},"",profilePath(h)); }catch(e){} }
}

function openProfile(uid){
  const m=byId("me");
  // your own account is a full page now; everyone else gets their public one
  if(uid==="me"){ openPortfolio(); return; }
  const other=byId(uid);
  if(other && other.handle && other.handle!=="you"){ openPublic(other.handle); return; }
  if(state.authed && (!m.profileSet || m.handle==="you")) return showUsernameGate();
  const u=byId(uid); if(!u) return;
  const calls=picks.filter(c=>c.user===uid).sort((a,b)=>b.ts-a.ts);
  const wins=calls.filter(c=>sinceCall(c)>0).length;
  const winPct=calls.length?Math.round(wins/calls.length*100):0;
  const isMe=uid==="me";
  const tab=isMe?(state.profTab||"profile"):"profile";
  const firstRun=isMe&&!u.profileSet;   // must choose a username before using the app
  $("#profileModal").innerHTML=`
    ${firstRun?"":`<button class="modal-x" data-close aria-label="Close">&times;</button>`}
    <div class="pf-head">
      ${uAv(u,46)}
      <span class="nm"><b>${u.name}</b><small>@${u.handle}</small></span>
      ${isMe?"":`<button class="follow ${u.following?'on':''}" data-follow="${u.id}">${u.following?'Following':'Follow'}</button>`}
    </div>
    ${isMe?`<div class="lb-toggle">
      <button id="ptProfile" class="${tab==="profile"?"on":""}">Profile</button>
      <button id="ptRewards" class="${tab==="rewards"?"on":""}">Rewards</button>
    </div>`:""}
    ${tab==="rewards"?rewardsPaneHTML()+`<div class="modal-actions" style="margin-top:12px"><button class="ghost" data-close style="flex:1">Close</button>${isMe?`<button class="ghost" id="pfSignOut" style="color:var(--loss);border-color:rgba(242,85,126,.35)">Sign out</button>`:""}</div>`:""}
    ${tab==="rewards"?"":`
    ${isMe?`
    ${firstRun?`<div class="pf-onboard">Pick your @username to finish setting up your account. This is how you appear on picks and the leaderboard.</div>`:""}
    <div class="field"><label>Username</label>
      <div class="at-in locked"><span>@</span><b>${u.handle}</b><small>permanent</small></div>
      <div class="hint">Usernames cannot be changed once set.</div></div>
    <div class="field"><label>Profile picture</label>
      <div class="file-in">
        <span class="file-prev" id="pfPrev">${u.img?`<img src="${u.img}" alt="">`:`<img src="/logo.svg" alt="" style="filter:hue-rotate(${u.hue||0}deg) saturate(1.15)">`}</span>
        <label class="file-btn" for="pfImg">Choose image</label>
        <span class="file-name" id="pfFile">${u.img?"Current picture":"PNG or JPG, square works best"}</span>
        <input type="file" id="pfImg" accept="image/*" hidden>
      </div></div>
    <div class="cooldown-note on" id="pfErr" style="display:none"></div>
    <button class="primary" id="pfSave" style="width:100%;background:var(--accent);color:#101114;font-weight:600;padding:10px;border-radius:8.1px;margin-bottom:14px">Save picture</button>
    `:""}
    <div class="pf-grid">
      <div class="pf-cell"><small>Followers</small><b>${kfmt(u.followers)}</b></div>
      <div class="pf-cell"><small>Following</small><b>${kfmt(uid==="me"?users.filter(x=>x.following).length:(u.followingN??Math.max(1,Math.floor(u.followers/9))))}</b></div>
      <div class="pf-cell"><small>Total calls</small><b>${calls.length}</b></div>
      <div class="pf-cell"><small>Profitable calls</small><b>${calls.length?winPct+"%":"No calls"}</b></div>
      <div class="pf-cell"><small>Total rewards earned</small><b class="gold">${fmt(u.rewards)}</b></div>
    </div>
    <div class="pf-calls-h">Recent calls</div>
    ${isMe?`<div class="pf-rw-note">Each call earns from the rewards pool on how it performs and how much real trading it brings. The figure under the move is what that call is currently worth.</div>`:""}
    ${calls.length?calls.slice(0,6).map(c=>{
      const pnl=sinceCall(c);
      const av=stocks[c.tick]?tAv(c.tick,26)
        :`<span class="t-av" style="width:26px;height:26px;font-size:9px;background:${color(c.tick)}">${c.tick.slice(0,2)}</span>`;
      return `<div class="pf-call">
        <div class="pf-call-h">
          ${av}
          <span class="grow"><b>${c.tick}</b><small>${ago(c.ts)} ago · at ${fmt(c.entry)}</small></span>
          <span class="pf-call-num"><b class="${pnl>=0?'up':'down'}">${pnl>=0?'+':''}${pnl.toFixed(1)}%</b>
            <small class="pf-call-rw">${(SC.est.get(c.id)||0)>0?fmt(SC.est.get(c.id)):"no reward yet"}</small></span>
        </div>
        ${c.thesis?`<div class="pf-call-tx">${c.thesis}</div>`:""}
      </div>`;}).join(""):`<div class="empty">No calls yet.</div>`}
    <div class="modal-actions" style="margin-top:12px">
      ${firstRun?"":`<button class=\"ghost\" data-close style=\"flex:1\">Close</button>`}
      ${isMe?`<button class="ghost" id="pfSignOut" style="color:var(--loss);border-color:rgba(242,85,126,.35)">Sign out</button>`:""}
    </div>
    ${isMe?importWalletHTML():""}`}`;
  wireImportWallet();
  const soBtn=$("#pfSignOut");
  if(soBtn) soBtn.onclick=async()=>{
    try{
      soBtn.disabled=true; soBtn.textContent="Signing out&";
      await (window.Privy&&window.Privy.logout?window.Privy.logout():Promise.resolve());
    }catch(_){}
    // onPrivyChange clears local session state and reopens the gate
    $("#profileOverlay").classList.remove("open");
    toast("Signed out.");
  };
  if(isMe){
    $("#ptProfile").onclick=()=>{state.profTab="profile";openProfile("me");};
    $("#ptRewards").onclick=()=>{state.profTab="rewards";openProfile("me");};
  }
  if(isMe && tab==="profile"){
    let imgData=u.img||null;
    $("#pfImg").onchange=e=>{
      const f=e.target.files[0]; if(!f) return;
      shrinkImage(f,256).then(d=>{
        imgData=d;
        $("#pfPrev").innerHTML=`<img src="${imgData}" alt="">`;
        $("#pfFile").textContent=f.name;
      }).catch(err=>toast(String(err.message||err)));
    };
    $("#pfSave").onclick=()=>{
      // the username is fixed at signup; only the picture can change here
      u.img=imgData;
      save();
      paintMyAvatar();          // repaint now, not on the next full render
      renderAll();
      pushProfile();
  askNotifyPermission();      // by now they have chosen a username, so it is not a cold prompt            // and let everyone else see it
      $("#profileOverlay").classList.remove("open");
      toast("Profile picture updated.");
    };
  }
  $("#profileOverlay").classList.add("open");
}

/* ==================================================================
   On-chain swaps, Robinhood Chain (4663), Uniswap V4
   Buy : native ETH -> USDG -> stock token
   Sell: stock token -> USDG -> native ETH
   Encodings verified against live router transactions. Every send is
   simulated first, so a bad encoding reverts for free.
================================================================== */
const DEX={
  router:"0x8876789976decbfcbbbe364623c63652db8c0904",
  permit2:"0x000000000022D473030F116dDEE9F6B43aC78BA3",
  quoter:"0x8dc178efb8111bb0973dd9d722ebeff267c98f94",
  v3quoter:"0x33e885ed0ec9bf04ecfb19341582aadcb4c8a9e7",
  poolManager:"0x8366a39cc670b4001a1121b8f6a443a643e40951",
  usdg:"0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  native:"0x0000000000000000000000000000000000000000",
  ethUsdgPool:"0xbac3aa3b91584a53a579b3c999a56756e954e59247e497bad1d25a4334bde551",
  slipBps:100,                       // 1% floor, blocks sandwich attacks
  initTopic:"0xdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d6438"
};
const MS_SENDER="0x0000000000000000000000000000000000000001";
const ADDR_THIS="0x0000000000000000000000000000000000000002";
let _viem=null; const viem=async()=>_viem||(_viem=await import("viem"));
const PATHKEY={type:"tuple[]",components:[{type:"address"},{type:"uint24"},{type:"int24"},{type:"address"},{type:"bytes"}]};
const EXACT_IN={type:"tuple",components:[{type:"address"},PATHKEY,{type:"bytes"},{type:"uint128"},{type:"uint128"}]};
const lessSlip=x=>x-(x*BigInt(DEX.slipBps)/10000n);

/* pool keys come from the PoolManager's Initialize log, never guessed */
let poolKeys={}; try{poolKeys=JSON.parse(localStorage.getItem("sp_pk")||"{}")}catch(e){}
async function keyFromId(id){
  if(poolKeys[id]) return poolKeys[id];
  const v=await viem();
  const logs=await rpcCall("eth_getLogs",[{address:DEX.poolManager,topics:[DEX.initTopic,id],
    fromBlock:"0x0",toBlock:"latest"}]);
  if(!logs||!logs.length) return null;
  const l=logs[0];
  const [fee,ts,hooks]=v.decodeAbiParameters(
    [{type:"uint24"},{type:"int24"},{type:"address"},{type:"uint160"},{type:"int24"}],l.data);
  const k={c0:v.getAddress("0x"+l.topics[2].slice(26)),c1:v.getAddress("0x"+l.topics[3].slice(26)),
           fee:Number(fee),tickSpacing:Number(ts),hooks};
  poolKeys[id]=k; try{localStorage.setItem("sp_pk",JSON.stringify(poolKeys))}catch(e){}
  return k;
}
/* the chart picks the busiest pool of any kind; swaps need a V4 pool quoted
   in USDG, chosen by depth. Pairs against memecoins are ignored. */
let swapPools={}; try{swapPools=JSON.parse(localStorage.getItem("sc_swappools")||"{}")}catch(e){}
async function resolveSwapPool(tick){
  if(swapPools[tick]!==undefined) return swapPools[tick];
  const sym=tick.replace(/x$/,"").toUpperCase();
  try{
    const d=await gtFetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${encodeURIComponent(sym)}&network=robinhood`);
    if(!d) return null;
    const ok=(d.data||[]).filter(x=>{
      const n=String((x.attributes||{}).name||"").toUpperCase();
      const quote=(n.split("/")[1]||"").trim();
      return n.startsWith(sym+" /") && quote.startsWith("USDG");   // ignore memecoin pairs
    });
    ok.sort((a,b)=>(+b.attributes.reserve_in_usd||0)-(+a.attributes.reserve_in_usd||0));
    const best=ok[0];
    const res=best?{id:best.attributes.address,kind:best.attributes.address.length===66?"v4":"v3"}:null;
    swapPools[tick]=res;
    try{localStorage.setItem("sc_swappools",JSON.stringify(swapPools))}catch(e){}
    return res;
  }catch(e){ return null; }
}
/* a V3 pool is a real contract, so read its tokens and fee straight off it */
async function v3PoolInfo(addr){
  const v=await viem();
  const [t0,t1,fee]=await Promise.all([
    rpcCall("eth_call",[{to:addr,data:"0x0dfe1681"},"latest"]),
    rpcCall("eth_call",[{to:addr,data:"0xd21220a7"},"latest"]),
    rpcCall("eth_call",[{to:addr,data:"0xddca3f43"},"latest"])]);
  const a0=v.getAddress("0x"+t0.slice(26)), a1=v.getAddress("0x"+t1.slice(26));
  const usdg=v.getAddress(DEX.usdg);
  return {token:a0===usdg?a1:a0, fee:parseInt(fee,16)};
}
/* the stock leg: whichever currency in the pool is not USDG */
async function stockLeg(tick){
  const r=await resolveSwapPool(tick);
  if(!r) throw new Error("No tradable USDG pool for "+tick+" on Robinhood Chain");
  if(r.kind==="v3"){
    const i=await v3PoolInfo(r.id);
    return {kind:"v3", token:i.token, fee:i.fee};
  }
  const k=await keyFromId(r.id);
  if(!k) throw new Error("Could not read the "+tick+" pool");
  const v=await viem(), usdg=v.getAddress(DEX.usdg);
  return {kind:"v4", ...k, token:k.c0===usdg?k.c1:k.c0};
}
async function ethLeg(){ return keyFromId(DEX.ethUsdgPool); }

/* path hops for each direction */
async function buyPath(tick){
  const e=await ethLeg(), s=await stockLeg(tick);
  return {token:s.token, path:[[DEX.usdg,e.fee,e.tickSpacing,e.hooks,"0x"],
                               [s.token,s.fee,s.tickSpacing,s.hooks,"0x"]]};
}
async function sellPath(tick){
  const e=await ethLeg(), s=await stockLeg(tick);
  return {token:s.token, path:[[DEX.usdg,s.fee,s.tickSpacing,s.hooks,"0x"],
                               [DEX.native,e.fee,e.tickSpacing,e.hooks,"0x"]]};
}
async function quoteV3(path,amountIn){
  const v=await viem();
  const data=v.encodeFunctionData({abi:v.parseAbi([
    "function quoteExactInput(bytes path, uint256 amountIn) returns (uint256,uint160[],uint32[],uint256)"]),
    functionName:"quoteExactInput",args:[path,amountIn]});
  const r=await rpcCall("eth_call",[{to:DEX.v3quoter,data},"latest"]);
  return BigInt("0x"+r.slice(2,66));
}
async function quotePath(currencyIn,path,amountIn){
  const v=await viem();
  const data=v.encodeFunctionData({abi:[{name:"quoteExactInput",type:"function",stateMutability:"nonpayable",
    inputs:[{type:"tuple",components:[{type:"address"},PATHKEY,{type:"uint128"}]}],
    outputs:[{type:"uint256"},{type:"uint256"}]}],
    functionName:"quoteExactInput",args:[[currencyIn,path,amountIn]]});
  const r=await rpcCall("eth_call",[{to:DEX.quoter,data},"latest"]);
  return BigInt("0x"+r.slice(2,66));
}

/* --- build the two transactions --- */
async function buildBuy(tick,ethWei){
  const v=await viem(), st=await stockLeg(tick), e=await ethLeg();
  const dl=BigInt(Math.floor(Date.now()/1e3)+1200);
  const exec=(cmds,inputs)=>v.encodeFunctionData({abi:v.parseAbi(["function execute(bytes,bytes[],uint256)"]),
    functionName:"execute",args:[cmds,inputs,dl]});
  const ethHop=[[DEX.usdg,e.fee,e.tickSpacing,e.hooks,"0x"]];
  if(st.kind==="v4"){
    const path=[...ethHop,[st.token,st.fee,st.tickSpacing,st.hooks,"0x"]];
    const out=await quotePath(DEX.native,path,ethWei), min=lessSlip(out);
    const inputs=[v.encodeAbiParameters([{type:"bytes"},{type:"bytes[]"}],["0x070b0e",[
      v.encodeAbiParameters([EXACT_IN],[[DEX.native,path,"0x",ethWei,min]]),
      v.encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"bool"}],[DEX.native,ethWei,true]),
      v.encodeAbiParameters([{type:"address"},{type:"address"},{type:"uint256"}],[st.token,MS_SENDER,min])]])];
    return {to:DEX.router,data:exec("0x10",inputs),value:"0x"+ethWei.toString(16),token:st.token,out,min};
  }
  // V4 leg to USDG, held by the router, then a V3 swap into the stock
  const usdgOut=await quotePath(DEX.native,ethHop,ethWei), usdgMin=lessSlip(usdgOut);
  const path3=v.encodePacked(["address","uint24","address"],[DEX.usdg,st.fee,st.token]);
  const out=await quoteV3(path3,usdgMin), min=lessSlip(out);
  const v4in=v.encodeAbiParameters([{type:"bytes"},{type:"bytes[]"}],["0x070b0e",[
    v.encodeAbiParameters([EXACT_IN],[[DEX.native,ethHop,"0x",ethWei,usdgMin]]),
    v.encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"bool"}],[DEX.native,ethWei,true]),
    v.encodeAbiParameters([{type:"address"},{type:"address"},{type:"uint256"}],[DEX.usdg,ADDR_THIS,0n])]]);
  const v3in=v.encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"uint256"},{type:"bytes"},{type:"bool"},{type:"bytes"}],[MS_SENDER,usdgMin,min,path3,false,"0x"]);
  return {to:DEX.router,data:exec("0x1000",[v4in,v3in]),value:"0x"+ethWei.toString(16),token:st.token,out,min};
}
async function buildSell(tick,tokenWei){
  const v=await viem(), st=await stockLeg(tick), e=await ethLeg();
  const dl=BigInt(Math.floor(Date.now()/1e3)+1200);
  const exec=(cmds,inputs)=>v.encodeFunctionData({abi:v.parseAbi(["function execute(bytes,bytes[],uint256)"]),
    functionName:"execute",args:[cmds,inputs,dl]});
  const ethHop=[[DEX.native,e.fee,e.tickSpacing,e.hooks,"0x"]];
  /* SETTLE and TAKE take 0, which the router reads as "the whole open delta".

     Naming exact amounts is what broke every sale: the swap leaves a delta
     that is only known once it has run, so settling tokenWei and taking min
     left a remainder unsettled and V4 reverted with CurrencyNotSettled.
     A working sale on this chain, 0x29372bf5cf..., settles 0 and takes 0.
     Slippage is still enforced by minOut inside the swap itself. */
  if(st.kind==="v4"){
    const path=[[DEX.usdg,st.fee,st.tickSpacing,st.hooks,"0x"],...ethHop];
    const out=await quotePath(st.token,path,tokenWei), min=lessSlip(out);
    const inputs=[v.encodeAbiParameters([{type:"bytes"},{type:"bytes[]"}],["0x070b0e",[
      v.encodeAbiParameters([EXACT_IN],[[st.token,path,"0x",tokenWei,min]]),
      v.encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"bool"}],[st.token,0n,true]),
      v.encodeAbiParameters([{type:"address"},{type:"address"},{type:"uint256"}],[DEX.native,MS_SENDER,0n])]])];
    return {to:DEX.router,data:exec("0x10",inputs),value:"0x0",token:st.token,out,min};
  }
  // V3 out of the stock into USDG, then the V4 pool back to ETH
  const path3=v.encodePacked(["address","uint24","address"],[st.token,st.fee,DEX.usdg]);
  const usdgOut=await quoteV3(path3,tokenWei), usdgMin=lessSlip(usdgOut);
  const out=await quotePath(DEX.usdg,ethHop,usdgMin), min=lessSlip(out);
  const v3in=v.encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"uint256"},{type:"bytes"},{type:"bool"},{type:"bytes"}],[ADDR_THIS,tokenWei,usdgMin,path3,true,"0x"]);
  const v4in=v.encodeAbiParameters([{type:"bytes"},{type:"bytes[]"}],["0x070b0e",[
    v.encodeAbiParameters([EXACT_IN],[[DEX.usdg,ethHop,"0x",usdgMin,min]]),
    v.encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"bool"}],[DEX.usdg,0n,false]),
    v.encodeAbiParameters([{type:"address"},{type:"address"},{type:"uint256"}],[DEX.native,MS_SENDER,0n])]]);
  return {to:DEX.router,data:exec("0x0010",[v3in,v4in]),value:"0x0",token:st.token,out,min};
}
/* --- simulate, then send. A bad encoding reverts here for free --- */
async function sendTx(tx,label){
  const from=privyState.wallet && privyState.wallet.address;
  if(!from) throw new Error("No wallet connected");
  const req={from,to:tx.to,data:tx.data,value:tx.value||"0x0"};
  let gas;
  try{ gas=await rpcCall("eth_estimateGas",[req]); }
  catch(e){
    const d=e&&e.data&&String(e.data);
    const why=(d&&d.length>=10)?" ("+d.slice(0,10)+")":"";
    throw new Error("Simulation failed, nothing sent: "+String(e.message||e).slice(0,120)+why);
  }
  toast(label);
  const hash=await privyState.provider.request({method:"eth_sendTransaction",
    params:[{...req,gas:"0x"+((BigInt(gas)*13n)/10n).toString(16)}]});
  for(let i=0;i<90;i++){
    const r=await rpcCall("eth_getTransactionReceipt",[hash]).catch(()=>null);
    if(r){ if(BigInt(r.status||"0x0")===0n) throw new Error("Transaction reverted on chain"); return r; }
    await new Promise(z=>setTimeout(z,2000));
  }
  throw new Error("Timed out waiting for confirmation");
}
async function erc20Balance(token,who){
  const v=await viem();
  const r=await rpcCall("eth_call",[{to:token,data:v.encodeFunctionData({
    abi:v.parseAbi(["function balanceOf(address) view returns (uint256)"]),
    functionName:"balanceOf",args:[who]})},"latest"]);
  return BigInt(r);
}
/* selling an ERC-20 needs a one-time approval to Permit2, then to the router */
async function ensureSellApproval(token,amount){
  const v=await viem(), me=privyState.wallet.address;
  const e=v.parseAbi(["function allowance(address,address) view returns (uint256)","function approve(address,uint256) returns (bool)"]);
  const cur=BigInt(await rpcCall("eth_call",[{to:token,data:v.encodeFunctionData({abi:e,functionName:"allowance",args:[me,DEX.permit2]})},"latest"]));
  if(cur<amount) await sendTx({to:token,value:"0x0",data:v.encodeFunctionData({abi:e,functionName:"approve",
    args:[DEX.permit2,(1n<<256n)-1n]})},"Approving the token, one time…");
  const p=v.parseAbi(["function allowance(address,address,address) view returns (uint160,uint48,uint48)","function approve(address,address,uint160,uint48)"]);
  const r=await rpcCall("eth_call",[{to:DEX.permit2,data:v.encodeFunctionData({abi:p,functionName:"allowance",args:[me,token,DEX.router]})},"latest"]);
  if(BigInt("0x"+r.slice(2,66))<amount) await sendTx({to:DEX.permit2,value:"0x0",
    data:v.encodeFunctionData({abi:p,functionName:"approve",
      args:[token,DEX.router,(1n<<160n)-1n,Math.floor(Date.now()/1e3)+60*60*24*30]})},"Approving the router, one time…");
}


/* -------- actions -------- */
function selectStock(t){state.sel=t;state.via=null;renderAll();save();fetchPoolStats(t);}
function requireAuth(){
  if(state.authed) return true;
  showGate();
  return false;
}
async function trade(){
  if(!requireAuth()) return;
  if(PAPER) return paperTrade();
  const t=state.sel, amt=Math.max(0,parseFloat($("#buyAmt").value)||0);
  if(amt<=0) return toast("Enter an amount first.");
  if(!privyState.provider||!privyState.wallet) return toast("Connect a wallet first.");
  const ethUsd=ethRate();
  if(!ethUsd) return toast("Still loading the ETH price, one moment.");
  const ethWei=BigInt(Math.floor((amt/ethUsd)*1e18));   // order is priced in dollars, paid in ETH
  if(ethWei<=0n) return toast("That order is too small.");
  const btn=$("#bigBuy"), label=btn.textContent;
  let rec, tx;
  try{
    btn.disabled=true; btn.textContent="Building the swap...";
    tx=await buildBuy(t,ethWei);
    btn.textContent="Confirm in your wallet...";
    rec=await sendTx(tx,`Swapping ${(Number(ethWei)/1e18).toFixed(6)} ETH for ${t}...`);
  }catch(err){
    btn.disabled=false; btn.textContent=label;
    return toast("Swap failed: "+String(err.message||err).slice(0,120));
  }
  btn.disabled=false; btn.textContent=label;
  fetchWalletBalance();
  syncHoldings();
  let msg=`Bought ${fmt(amt)} of <b>${t}</b>`;
  const via=state.via?picks.find(c=>c.id===state.via):attributedPick();
  if(via && via.tick===t && via.epoch===state.epochN){
    if(!via.myTraded){ via.m.traders+=1; via.myTraded=true; }
    via.m.volume+=amt; via.m.fees+=fee;
    msg+=`, attributed to <b>@${byId(via.user).handle}</b>`;
  }
  // a real on-chain position: the token amount the swap actually returned
  state.positions.push({id:Date.now(),tick:t,usd:amt,entry:stocks[t].price,
    token:tx.token, tokenWei:tx.out.toString(), txHash:rec.transactionHash,
    openedAt:Date.now(), wallet:privyState.wallet.address});
  (swapsData[t]=swapsData[t]||[]).unshift({u:"me",side:"Buy",usd:amt,ago:"0m"});
  $("#buyAmt").value="";
  renderAll(); save(); toast(msg+".");
  // you can only call a stock you hold, so ask for the pick right after buying
  setTimeout(()=>openPickModal(true,t),700);
}
const shortAddr=a=>a?a.slice(0,6)+String.fromCharCode(8230)+a.slice(-4):"";
async function sellPos(id){
  const i=state.positions.findIndex(p=>p.id==id);
  if(i<0) return toast("That position is no longer open.");
  const p=state.positions[i];
  if(PAPER||p.paper) return paperSell(i);
  if(!stocks[p.tick]) return toast(`No live market for <b>${p.tick}</b> right now, try again shortly.`);
  if(!swapsData[p.tick]) swapsData[p.tick]=[];
  const cur=stocks[p.tick].price, val=p.usd*(cur/p.entry);
  const here=(privyState.wallet&&privyState.wallet.address)||null;
  // positions opened before wallets were stamped belong to whoever is signed in now
  const dest=p.wallet||here;
  if(dest&&here&&dest.toLowerCase()!==here.toLowerCase())
    return toast(`This position was funded by <b>${shortAddr(dest)}</b>. Sign in with that wallet to sell, proceeds return to it.`);
  if(!privyState.provider||!here) return toast("Connect a wallet first.");
  const tokenWei=BigInt(p.tokenWei||"0");
  if(!p.token||tokenWei<=0n) return toast("This position has no on-chain tokens to sell.");
  let rec;
  try{
    const held=await erc20Balance(p.token,here);
    const amtWei=held<tokenWei?held:tokenWei;          // never try to sell more than the wallet holds
    var soldAmt=amtWei;
    if(amtWei<=0n){
      // the record outlived the holding: drop it rather than leaving a row
      // that cannot be sold
      state.positions.splice(i,1); save(); renderAll();
      return toast(`Your wallet no longer holds <b>${p.tick}</b>, so that position has been cleared.`);
    }
    // the pool trades one specific token. If the position names a different
    // one, the swap would be built against the wrong asset and revert deep
    // inside the router with nothing useful to show for it.
    const leg=await stockLeg(p.tick);
    if(leg&&leg.token&&p.token&&leg.token.toLowerCase()!==p.token.toLowerCase()){
      return toast(`<b>${p.tick}</b> now trades a different token than this position holds, so it cannot be sold here.`);
    }
    await ensureSellApproval(p.token,amtWei);
    const tx=await buildSell(p.tick,amtWei);
    rec=await sendTx(tx,`Selling ${p.tick} back to ETH...`);
    if(rec) rec.__amt=soldAmt;
  }catch(err){
    return toast("Sale failed: "+String(err.message||err).slice(0,120));
  }
  fetchWalletBalance();
  // Proceeds are in the wallet now, so this profit is banked rather than a
  // paper figure. Only what was actually sold counts: a partial fill takes a
  // proportional slice of the cost basis with it.
  const soldWei=(rec&&rec.__amt)||tokenWei;
  const part=tokenWei>0n?Number(soldWei)/Number(tokenWei):1;
  // nothing is deducted: what the position made is what it made
  const gross=val*part, cost=p.usd*part;
  const realised=gross-cost;
  state.realised=(state.realised||0)+realised;
  state.closed=(state.closed||0)+1;
  const me=byId("me"); me.pnl=state.realised;
  if(part>=0.999){ state.positions.splice(i,1); }
  else{ p.usd-=cost; p.tokenWei=(tokenWei-soldWei).toString(); p.units=Number(p.tokenWei)/1e18; }
  (swapsData[p.tick]=swapsData[p.tick]||[]).unshift({u:"me",side:"Sell",usd:val,ago:"0m"});
  renderAll(); save();
  toast(`Sold <b>${p.tick}</b> for ${fmt(val)}, ${realised>=0?"up":"down"} <b>${fmt(Math.abs(realised))}</b>${dest?", settled to "+shortAddr(dest):""}.`);
}
function cooldownBlocked(tick){
  return picks.some(c=>c.user==="me"&&c.tick===tick&&!c.dupe&&Date.now()-c.ts<CFG.COOLDOWN_MS);
}

/* -------- events -------- */
function onboardingLocked(){
  const m=byId("me");
  return (($("#profileOverlay").classList.contains("open")||$("#usernameOverlay").classList.contains("open"))
          && state.authed && (!m.profileSet || m.handle==="you"));
}
document.addEventListener("click",e=>{
  const tk=e.target.closest("[data-tok]");
  if(tk && !e.target.closest("[data-profile]")){ closePage(); selectStock(tk.dataset.tok); return; }
  const pf=e.target.closest("[data-profile]");
  if(pf && !e.target.closest("[data-follow]")){ openProfile(pf.dataset.profile); return; }
  const sd=e.target.closest("[data-sd]"); if(sd) return pickSearch(sd.dataset.sd);
  const tok=e.target.closest("[data-tok]"); if(tok) return selectStock(tok.dataset.tok);
  const fl=e.target.closest("[data-follow]");
  if(fl){
    const u=byId(fl.dataset.follow); if(!u) return;
    u.following=!u.following; u.followers=Math.max(0,(u.followers||0)+(u.following?1:-1));
    state.follows=state.follows||{};
    if(u.wallet){ if(u.following) state.follows[u.wallet]=1; else delete state.follows[u.wallet]; }
    renderLeft();
    if($("#profileOverlay").classList.contains("open")) openProfile(u.id);
    if(state.pageNav==="public"||state.pageNav==="leaderboard") renderPage(state.pageNav);
    save();
    const me=myWallet();
    if(me && u.wallet) API.post("/api/follow",{wallet:me,target:u.wallet,on:u.following})
      .then(r=>{ if(r&&typeof r.followers==="number"){ u.followers=r.followers; renderLeft(); } })
      .catch(()=>{});
    toast(u.following?`Following <b>@${u.handle}</b>.`:`Unfollowed @${u.handle}.`);
    return;
  }
  const lk=e.target.closest("[data-like]");
  if(lk){
    const c=picks.find(x=>x.id==lk.dataset.like); if(!c) return;
    c.liked=!c.liked; c.likes+=c.liked?1:-1;
    // repaint just this pick's buttons: a full render rebuilds 100+ rows and their logos
    document.querySelectorAll('[data-like="'+c.id+'"]').forEach(btn=>{
      btn.classList.toggle("on",c.liked);
      btn.textContent="♥ "+c.likes;
    });
    save();
    const w=myWallet();
    if(w) API.post("/api/like",{wallet:w,pickId:c.id,on:c.liked}).catch(()=>{});
    return;
  }
  const sv=e.target.closest("[data-save]");
  if(sv){const c=picks.find(x=>x.id==sv.dataset.save);c.m.saves+=1;touch(c.id);sv.classList.add("on");save();toast("Saved. This counts as a meaningful interaction.");return;}
  const sh=e.target.closest("[data-share]");
  if(sh){const c=picks.find(x=>x.id==sh.dataset.share);c.m.shares+=1;save();toast("Share link copied (demo).");return;}
  const via=e.target.closest("[data-via]");
  if(via){const c=picks.find(x=>x.id==via.dataset.via);
    if(!c.myOpened){c.m.opens+=1;c.m.viewers+=1;c.myOpened=true;}
    touch(c.id);
    state.sel=c.tick;state.via=c.id;state.side="buy";
    $("#tabBuy").classList.add("on");$("#tabSell").classList.remove("on");$("#buyPane").hidden=false;$("#sellPane").hidden=true;
    renderAll();save();$("#buyAmt").focus();toast(`Opened via <b>@${byId(c.user).handle}</b>, trades in the next 24h are attributed to their pick.`);return;}
  const mk=e.target.closest("[data-mk]");
  if(mk){state.bpTab="thesis";renderBp();return;}
  const gt=e.target.closest("[data-goto]");
  if(gt){ const nv=gt.dataset.goto;
    document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.toggle("on",x.dataset.nav===nv));
    if(gt.closest(".intro-card")) state.introDone=true;
    save(); openPage(nv); return; }
  if(e.target.id==="introSkip"){ state.introDone=true; renderLeft(); save(); return; }
  const sl=e.target.closest("[data-sell]"); if(sl) return sellPos(sl.dataset.sell);
  const chip=e.target.closest("[data-amt]"); if(chip){$("#buyAmt").value=chip.dataset.amt;renderBuy();return;}
  const lbm=e.target.closest("[data-lbm]");
  if(lbm){ state.lbMode=lbm.dataset.lbm;
    if(state.pageNav==="leaderboard") renderPage("leaderboard"); else renderLeft();
    save(); return; }
  const fm=e.target.closest("[data-feedm]");
  if(fm){ state.feedFollowing=fm.dataset.feedm==="fol";
    // refresh the full-page feed when it is the visible one, otherwise the sidebar
    if(state.pageNav==="feed") renderPage("feed"); else renderLeft();
    save(); return; }
  if(e.target.matches("[data-close]")||e.target.classList.contains("overlay")){
    if(onboardingLocked()) return;   // must pick a username first
    document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("open"));
  }
});
const PV={feed:["Feed","Every pick on the platform, newest first"],
  leaderboard:["Leaderboard","Top pickers by rewards earned, realised PnL and reach"],
  rewards:["Pick Rewards","25% of the trading fees on the Stockpickr coin, paid to the pickers who get it right"],
  portfolio:["Portfolio","Your positions, your picks and the wallets on this account"],
  public:["Profile","Public profile"]
};
function openPortfolio(){
  openPage("portfolio");
  if(typeof markTab==="function") markTab("profile");
  document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.remove("on"));
}
/* a shared link lands straight on that profile */
function routeFromUrl(push){
  const m=HANDLE_RE.exec(location.pathname);
  if(!m) return false;
  openPublic(m[1],push);
  return true;
}
addEventListener("popstate",()=>{ if(!routeFromUrl(false)) closePage(); });
function closePage(){
  state.pageNav=null; $("#pageView").hidden=true; document.querySelector(".cols").style.display="";
  renderMobileTrade();                       // back on a stock, so the bar returns
  if(typeof markTab==="function") markTab("markets");
  clearPictureDraft();
  dropProfileUrl();
}

/* A profile owns the address bar only while it is on screen. Anything that
   navigates away from one puts the plain URL back, not just closing it, or a
   stale /@handle is what gets copied and shared. */
/* a picture you chose and walked away from was not a decision to keep it */
function clearPictureDraft(){ pfoDraftImg=null; }
function dropProfileUrl(){
  if(state.pageNav==="public") return;
  if(!HANDLE_RE.test(location.pathname)) return;
  try{ history.pushState({},"","/dashboard"); }catch(e){}
}
function openPage(nv){
  const pv=$("#pageView");
  if(nv==="tokens"){ closePage(); return; }              // Markets = the trading terminal
  document.querySelector(".cols").style.display="none";  // swap the terminal out, no overlay clipping
  state.pageNav=nv;
  const [title,sub]=PV[nv]||[nv,""];
  if(nv!=="portfolio") clearPictureDraft();
  dropProfileUrl();                                      // a different page, a different URL
  pv.hidden=false;
  pv.innerHTML=`<div class="pv-head"><div><h2>${title}</h2><div class="sub">${sub}</div></div>
      <button class="pv-close" id="pvClose">← Back to markets</button></div>
    <div class="pv-head-slot" id="pvHeadSlot"></div>
    <div class="pv-body"><div id="pvBody"></div></div>`;
  $("#pvClose").onclick=closePage;
  renderMobileTrade();                       // a full page has no buy button
  renderPage(nv);
}
function renderPage(nv){
  const body=$("#pvBody"); if(!body) return;
  if(nv==="rewards"){
    body.className="pv-narrow"; body.innerHTML=rewardsNoticeHTML();
    wireCaBox(); wireClaims();
    if(!myRewards.loaded) loadRewards();
    return;
  }
  if(nv==="portfolio"){ body.className="pv-narrow"; body.innerHTML=portfolioHTML(); wirePortfolio(); return; }
  if(nv==="public"){
    const who=userByHandle(state.pubHandle);
    if(who && who.id==="me"){ openPortfolio(); return; }   // your own handle is your private page
    body.className="pv-narrow"; body.innerHTML=publicHTML(state.pubHandle); wirePublic(); return;
  }
  if(nv==="leaderboard"){
    const slot=$("#pvHeadSlot");
    if(slot) slot.innerHTML=`<div class="pv-tabs">
      <button data-lbm="rewards" class="${state.lbMode==="rewards"?'on':''}">Rewards claimed</button>
      <button data-lbm="pnl" class="${state.lbMode==="pnl"?'on':''}">By PnL</button>
      <button data-lbm="followers" class="${state.lbMode==="followers"?'on':''}">By followers</button>
    </div>`;
    body.className="pv-narrow";
    body.innerHTML=lbBodyHTML();
    return;
  }
  if(nv==="feed"){
    const list=feedList(), slot=$("#pvHeadSlot");
    if(slot) slot.innerHTML=`<div class="pv-tabs">
      <button data-feedm="all" class="${!state.feedFollowing?'on':''}">All</button>
      <button data-feedm="fol" class="${state.feedFollowing?'on':''}">Following</button>
    </div>`;
    body.className="pv-feed";
    body.innerHTML=list.length?`<div class="pv-grid">${list.map(pickCard).join("")}</div>`:feedEmptyHTML();
    return;
  }
  const prevTab=state.lTab, prevWatch=state.watchOnly;
  state.watchOnly = nv==="watchlist";
  state.lTab = nv==="watchlist" ? "tokens" : nv;
  renderLeft();                                   // build the markup once…
  body.className = "pv-narrow";
  body.innerHTML = $("#lPane").innerHTML;         // …then show it full-width
  state.lTab=prevTab; state.watchOnly=prevWatch; renderLeft();
}
document.querySelectorAll("#topNav [data-nav]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.toggle("on",x===b));
  openPage(b.dataset.nav);
  markTab(b.dataset.nav);
});

/* -------- phones: bottom tab bar and the markets drawer -------- */
function markTab(name){
  document.querySelectorAll("#tabbar [data-tab]").forEach(x=>
    x.classList.toggle("on",x.dataset.tab===name));
}
function setDrawer(open){
  const cols=document.querySelector(".cols"), scrim=$("#drawerScrim");
  if(!cols) return;
  cols.classList.toggle("drawer-open",!!open);
  if(scrim){ scrim.hidden=!open; scrim.classList.toggle("on",!!open); }
  document.body.style.overflow = open ? "hidden" : "";
  renderMobileTrade();               // the trade bar follows the drawer
}
const onPhone=()=>matchMedia("(max-width:980px)").matches;
document.querySelectorAll("#tabbar [data-tab]").forEach(b=>b.onclick=()=>{
  const t=b.dataset.tab;
  markTab(t);
  if(t==="markets"){
    // back to the terminal, with the stock list one tap away
    closePage();
    document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.toggle("on",x.dataset.nav==="tokens"));
    setDrawer(true);
    state.lTab="tokens";
    document.querySelectorAll("#lTabs button").forEach(x=>x.classList.toggle("on",x.dataset.l==="tokens"));
    renderLeft();
    return;
  }
  setDrawer(false);
  if(t==="profile"){ openProfile("me"); markTab("profile"); return; }
  openPage(t);
  document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.toggle("on",x.dataset.nav===t));
});
const scrimEl=$("#drawerScrim"); if(scrimEl) scrimEl.onclick=()=>setDrawer(false);
/* picking a stock closes the drawer so the chart is visible straight away */
document.addEventListener("click",e=>{
  if(onPhone() && e.target.closest("#lPane .tok-row")) setDrawer(false);
},true);
addEventListener("resize",()=>{ if(!onPhone()) setDrawer(false); });
document.querySelectorAll("#lTabs button").forEach(b=>b.onclick=()=>{state.lTab=b.dataset.l;state.watchOnly=false;
  document.querySelectorAll("#lTabs button").forEach(x=>x.classList.toggle("on",x===b));
  if(state.lTab==="alerts") markAlertsRead();
  renderLeft(); paintTabDot(); save();});
document.querySelectorAll("#bpTabs [data-bp]").forEach(b=>b.onclick=()=>{state.bpTab=b.dataset.bp;renderBp();});
$("#tabBuy").onclick=()=>{state.side="buy";$("#tabBuy").classList.add("on");$("#tabSell").classList.remove("on");$("#buyPane").hidden=false;$("#sellPane").hidden=true;};
$("#tabSell").onclick=()=>{state.side="sell";$("#tabSell").classList.add("on");$("#tabBuy").classList.remove("on");$("#buyPane").hidden=true;$("#sellPane").hidden=false;renderSell();};
$("#buyAmt").addEventListener("input",renderBuy);
$("#bigBuy").onclick=trade;
$("#viaClear").onclick=()=>{state.via=null;renderBuy();};



/* -------- search: results drop from the field -------- */
let sdHits=[], sdIdx=-1;
function closeSearch(){ sdHits=[]; sdIdx=-1; $("#searchDrop").hidden=true; }
function renderSearch(){
  const q=($("#searchIn").value||"").trim().toLowerCase();
  const d=$("#searchDrop");
  if(!q){ closeSearch(); return; }
  sdHits=Object.entries(stocks)
    .filter(([t,st])=>t.toLowerCase().includes(q)||String(st.name||"").toLowerCase().includes(q))
    .sort((a,b)=>{               // exact ticker match first, then by name length
      const A=a[0].toLowerCase().startsWith(q)?0:1, B=b[0].toLowerCase().startsWith(q)?0:1;
      return A-B || String(a[1].name).length-String(b[1].name).length;
    })
    .slice(0,8);
  sdIdx=sdHits.length?0:-1;
  d.innerHTML=sdHits.length?sdHits.map(([t,st],i)=>`
    <button class="sd-row ${i===sdIdx?"on":""}" data-sd="${t}">
      ${tAv(t,28)}
      <span class="nm"><b>${st.name}</b><small>${t}</small></span>
      <span class="pr"><b>${fmt(st.price)}</b><span class="${st.chg24>=0?"up":"down"}">${st.chg24>=0?"+":""}${(st.chg24||0).toFixed(2)}%</span></span>
    </button>`).join(""):`<div class="sd-empty">No market matches &ldquo;${q}&rdquo;</div>`;
  d.hidden=false;
}
function pickSearch(t){
  $("#searchIn").value="";
  closeSearch();
  closePage();                                  // searching from a full-page view returns to the terminal
  document.querySelectorAll("#topNav [data-nav]").forEach(x=>x.classList.toggle("on",x.dataset.nav==="tokens"));
  selectStock(t);
}
$("#searchIn").addEventListener("input",renderSearch);
$("#searchIn").addEventListener("focus",renderSearch);
$("#searchIn").addEventListener("keydown",e=>{
  if(!sdHits.length) return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){
    e.preventDefault();
    sdIdx=(sdIdx+(e.key==="ArrowDown"?1:-1)+sdHits.length)%sdHits.length;
    [...$("#searchDrop").querySelectorAll(".sd-row")].forEach((el,i)=>el.classList.toggle("on",i===sdIdx));
  }else if(e.key==="Enter"){ e.preventDefault(); if(sdHits[sdIdx]) pickSearch(sdHits[sdIdx][0]); }
  else if(e.key==="Escape"){ $("#searchIn").value=""; closeSearch(); }
});
document.addEventListener("click",e=>{ if(!e.target.closest(".search")) closeSearch(); });
function openPickModal(justBought,tick){
  if(!requireAuth()) return;
  /* Coming straight off a confirmed swap, the receipt is the proof of holding.
     Asking the chain again here raced the same lag that loses the position,
     and the prompt to call the stock out simply never appeared. */
  if(tick && tick!==state.sel) selectStock(tick);
  const on=tick||state.sel;
  const held=justBought||state.positions.some(p=>p.tick===on && BigInt(p.tokenWei||"0")>0n);
  if(!held) return toast(`Buy <b>${on}</b> first, you can only call a stock you hold.`);
  $("#postSub").textContent=justBought
    ? `You now hold ${state.sel}. Pick it so your trade can earn from the rewards pool.`
    : `On ${state.sel} at ${fmt(stocks[state.sel].price)}`;
  const blocked=cooldownBlocked(state.sel);
  const n=$("#cooldownNote");
  n.classList.toggle("on",blocked);
  if(blocked) n.textContent="You already have a reward-eligible pick on this stock in the last 30 minutes. You can still post, but this one will not earn.";
  $("#postThesis").value="";
  $("#postOverlay").classList.add("open");
  setTimeout(()=>{ const a=$("#postThesis"); if(a) a.focus(); },80);
}
// direction was removed: every pick is simply a call on the stock
state.dir="long";
$("#confirmPost").onclick=async()=>{
  const th=$("#postThesis").value.trim(); if(!th) return toast("Write a thesis first.");
  const w=myWallet(); if(!w) return toast("Sign in first.");
  const dupe=cooldownBlocked(state.sel);
  const btn=$("#confirmPost"); btn.disabled=true;
  try{
    await API.post("/api/picks",{wallet:w,tick:state.sel,dir:state.dir,
      entry:stocks[state.sel].price,thesis:th});
    $("#postThesis").value=""; $("#postOverlay").classList.remove("open");
    state.bpTab="thesis"; save();
    await syncFromServer(true);                 // everyone sees it, not just this browser
    toast(dupe?`Posted on <b>${state.sel}</b>, not reward-eligible (cooldown).`
              :`Pick posted on <b>${state.sel}</b>. It earns from the rewards pool as it gains real traction.`);
  }catch(e){ toast("Could not post: "+String(e.message||e).slice(0,90)); }
  btn.disabled=false;
};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!onboardingLocked())document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("open"));});

/* -------- clocks -------- */
function epochTick(){
  checkEpoch();
  // no countdown is shown anywhere; this only keeps the payout cycle ticking over
}
setInterval(epochTick,1000);

/* -------- the live tick --------

   This used to run a demo simulation over real data: it invented viewers,
   shares, saves, followers and attributed trades for genuine picks, routed
   imaginary fees into the rewards pool, and added a random amount to the
   author's PnL on every pass - up to a few hundred dollars a tick against a
   position worth a dollar. That is where "+$75.15 realised" came from on an
   account that had never closed a trade, and why it moved on its own.

   Nothing here invents activity any more. Numbers change when the market does
   or when somebody does something. */
setInterval(()=>{
  // a sharp move on the asset you are watching is worth a ping
  const sel=stocks[state.sel];
  if(sel && Math.abs(sel.chg24)>=6 && Math.random()<.05)
    pushAlert("up",`${state.sel} is ${sel.chg24>=0?"up":"down"} ${Math.abs(sel.chg24).toFixed(1)}%`,"Big move on a market you follow");
  renderHead();renderChart();renderStatus();renderMoney();renderMobileTrade();
  refreshScores();
  if(state.bpTab==="thesis")renderBp();
  if(["tokens","feed","rewards","leaderboard"].includes(state.lTab))renderLeft();
  refreshPage();                       // the open full-page view tracks live numbers too
  if(state.pageNav==="portfolio"||state.pageNav==="public") renderPage(state.pageNav);
  renderPositions();if(state.side==="sell")renderSell();
  save();
},4000);

/* -------- live market data (CoinGecko free API) --------
   Live spot prices + 24h change + market cap for the crypto assets.
   Tokenized stock prices stay simulated (no keyless free stock API). */
const big$=n=>n>=1e12?"$"+(n/1e12).toFixed(2)+"T":n>=1e9?"$"+(n/1e9).toFixed(2)+"B":n>=1e6?"$"+(n/1e6).toFixed(1)+"M":fmt0(n);
let xstocksLoaded=false;
function applyRow(tick,row){
  const prev=stocks[tick]||{}, first=!prev.liveLoaded;
  stocks[tick]={...prev,
    name:(prev.live&&!prev.dom)?prev.name:row.name.replace(/\s*[•·]\s*Robinhood Token\s*$/i,"").replace(/\s*xStock$/i,""),
    price:row.current_price,
    chg24:row.price_change_percentage_24h||0,
    mcap:big$(row.market_cap||0),
    vol24:big$(row.total_volume||0),
    fdv:row.fully_diluted_valuation?big$(row.fully_diluted_valuation):", ",
    supply:row.circulating_supply?kfmt(row.circulating_supply)+" "+tick:", ",
    hi24:row.high_24h, lo24:row.low_24h, rank:row.market_cap_rank,
    img:row.image, live:row.id, liveLoaded:true,
    addr:(String(row.image||"").match(/(0x[0-9a-fA-F]{40})/)||[])[1]||prev.addr||"",
    liq:big$((row.total_volume||0)*.04), holders:prev.holders&&prev.holders!==", "?prev.holders:kfmt(2000+((row.market_cap||1e6)%90000))};
  if(first||!series[tick]) series[tick]=genSeries(tick);   // rescale chart to the real price
  else{const arr=series[tick],last=arr[arr.length-1],p=row.current_price;last.c=p;last.h=Math.max(last.h,p);last.l=Math.min(last.l,p);}
}
async function fetchLive(){
  const ids=Object.values(stocks).filter(s=>s.live&&!s.dom).map(s=>s.live).join(",");
  if(ids) try{
    const r=await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`);
    if(r.ok) for(const row of await r.json()){
      const ent=Object.entries(stocks).find(([,s])=>s.live===row.id);
      if(ent) applyRow(ent[0],row);
    }
  }catch(e){}
  try{ // Robinhood Chain tokenized stocks, live prices, mcap, volume, logos
    const r=await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=robinhood-chain-stocks-ecosystem&per_page=250&price_change_percentage=24h`);
    if(r.ok){
      const rows=await r.json(), seen=new Set();
      for(const row of rows){
        if(!row.current_price||!row.symbol) continue;
        const tick=row.symbol.toUpperCase()+"x";
        seen.add(tick);
        applyRow(tick,row);
        stocks[tick].dom=1;   // marks equities (crypto majors have no dom)
      }
      if(!xstocksLoaded&&seen.size>20){
        // drop every tokenized stock that isn't on Robinhood Chain
        const held=new Set(state.positions.map(p=>p.tick));   // never prune an asset you hold
        for(const t in stocks) if(!stocks[t].live&&!seen.has(t)&&!held.has(t)) delete stocks[t];
        picks=picks.filter(c=>stocks[c.tick]);
        if(!stocks[state.sel]) state.sel=Object.keys(stocks)[0];
        for(const t in holdersData) if(!stocks[t]) delete holdersData[t];
        for(const t in swapsData) if(!stocks[t]) delete swapsData[t];
        for(const t of seen){ if(!holdersData[t]) holdersData[t]=genHolders(t); if(!swapsData[t]) swapsData[t]=genSwaps(t); }
        xstocksLoaded=true;
        renderAll(); save();
      }
    }
  }catch(e){/* offline, last known prices continue */}
  renderHead();renderStatus();renderAbout();
  if(state.lTab==="tokens")renderLeft();
  if(stocks[state.sel]&&stocks[state.sel].live)renderChart();
}
async function liveLoop(){ await fetchLive(); }
liveLoop(); setInterval(liveLoop, 45000);
/* live header stats: poll the selected market, and catch up instantly when
   the tab regains focus so it never looks frozen */
/* warm the pool addresses for the visible list, slowly, so the first click on
   any of them has nothing to look up */
async function warmPools(){
  const list=Object.keys(stocks).slice(0,14);
  for(const t of list){
    if(poolCache[t]!==undefined) continue;
    if(document.hidden) return;
    await resolvePool(t);
  }
}
setTimeout(warmPools, 2500);
fetchPoolStats(state.sel);
setInterval(()=>{ if(!document.hidden) fetchPoolStats(state.sel); }, 12000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) fetchPoolStats(state.sel); });
window.addEventListener("focus",()=>fetchPoolStats(state.sel));
// the treasury balance is the rewards pool, so watch it closely and catch up on focus
fetchTreasury();
setInterval(()=>{ if(!document.hidden) fetchTreasury(); }, 15000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) fetchTreasury(); });
setInterval(fetchWalletBalance, 20000);               // the trader's own on-chain balance   // stay inside CoinGecko's free-tier rate limit

/* -------- Privy, auth + embedded wallet --------
   The UI (login modal, transaction confirmation) is rendered by Privy itself,
   via @privy-io/react-auth mounted in the module script at the end of <body>.
   This file only talks to the bridge it puts on window.Privy. */
const PRIVY_CONFIG = { appId:"cmtmnaimd026q0cjs1xxlww3s", clientId:"client-WY6d6ovz4QebqBm9p7BNXcmEmzndYGtJpcRV9STvcVqqj" };

const privyState={user:null,wallet:null,provider:null};

function assignDefaultPfp(){
  const me=byId("me");
  if(me.hue==null){ me.hue=Math.floor(Math.random()*360); save(); }  // discord-style random default color
}

/* called whenever the Privy React bridge reports a state change */
async function onPrivyChange(){
  const P=window.Privy;
  if(!P||!P.ready) return;
  if(!P.authenticated){
    if(ACCOUNT) save();                       // keep this account's data before letting go of it
    privyState.user=null; privyState.wallet=null; privyState.provider=null;
    loadAccount(null);                        // back to the signed-out view, account data stays on disk
    state.authed=false; $("#privyLbl").textContent="Sign in";
    showGate(); renderAll();
    return;
  }
  // one account per Privy identity: switching logins loads that account, never overwrites another
  // keyed on the wallet address: a different wallet is a different account
  const w0=(P.externalWallets&&P.externalWallets[0])||(P.wallets||[])[0];
  const uid=(P.user&&P.user.id)||null;
  const acct=(w0&&w0.address&&w0.address.toLowerCase())||uid;
  let switched=false;
  if(acct && ACCOUNT!==acct){
    // the embedded wallet and the previous key are where an email account may still live
    const emb=(P.embeddedWallets&&P.embeddedWallets[0]&&P.embeddedWallets[0].address||"").toLowerCase();
    save(); loadAccount(acct,[uid,emb,ACCOUNT]); switched=true;
  }
  const first=switched||!state.authed;
  privyState.user=P.user;
  state.authed=true;
  assignDefaultPfp();
  const w=(P.externalWallets&&P.externalWallets[0])||(P.wallets||[])[0];
  if(w){
    privyState.wallet={address:w.address};
    // the provider is what triggers Privys own Confirm transaction modal on signing
    try{ privyState.provider=await w.getEthereumProvider(); }catch(_){ privyState.provider=null; }
    fetchWalletBalance();
  }
  const short=w?w.address.slice(0,6)+String.fromCharCode(8230)+w.address.slice(-4):"Connected";
  $("#privyLbl").textContent=short;
  hideGate(); renderAll(); save();
  // Pull first. This wallet may already have a username on the server, and
  // asking for one again would lock a returning user out of their own account.
  await syncFromServer(true);
  pushProfile();
  syncHoldings();                              // and read what the wallet really holds
  loadRewards();                               // and what the platform owes you
  loadPaidPicks();                          // and what each pick has been paid
  if(first) toast(`Signed in with <b>Privy</b>${w?", wallet "+short:""}.`);
  const me=byId("me");
  if(!me.profileSet || !me.handle || me.handle==="you"){
    openPortfolio();          // set-up happens on your own page, not over the terminal
    showUsernameGate();
  }else if(HANDLE_RE.test(location.pathname)){
    routeFromUrl(false);      // now that we know who you are, resolve the link again
  }
}
window.addEventListener("privy:change",onPrivyChange);

/* -------- real holdings: the wallet is the source of truth --------
   Positions are not bookkeeping any more. Whatever tokenised stock the
   connected wallet actually holds is what shows, whether it was bought
   here or arrived from somewhere else. */
let tokenOf={}; try{tokenOf=JSON.parse(localStorage.getItem("sc_tokens")||"{}")}catch(e){}
async function tokenFor(tick){
  if(tokenOf[tick]!==undefined) return tokenOf[tick];
  try{ const st=await stockLeg(tick); tokenOf[tick]=st.token||null; }
  catch(e){ tokenOf[tick]=null; }                    // no pool we can trade, skip it
  try{localStorage.setItem("sc_tokens",JSON.stringify(tokenOf))}catch(e){}
  return tokenOf[tick];
}
let holdingsBusy=false;
/* every address on this account, because a position is a position wherever it
   is held */
function allMyWallets(){
  const P=window.Privy||{};
  const out=new Set();
  for(const w of (P.wallets||[])) if(w&&w.address) out.add(String(w.address).toLowerCase());
  const active=privyState.wallet&&privyState.wallet.address;
  if(active) out.add(String(active).toLowerCase());
  return [...out];
}
/* How long a position we opened ourselves survives a zero balance. A swap is
   mined before every node agrees it happened, so reading straight after one
   can report nothing held. Treating that as a sale deleted the position and,
   with it, the prompt to call the stock out. */
const FRESH_MS=120000;
const justOpened=p=>p&&p.openedAt&&(Date.now()-p.openedAt)<FRESH_MS;

async function syncHoldings(){
  const me=privyState.wallet&&privyState.wallet.address;
  if(!me||holdingsBusy) return;
  if(PAPER) return;
  holdingsBusy=true;
  try{
    const all=Object.keys(stocks);
    // learn a couple of new token addresses each pass, plus whatever is on screen,
    // so the map fills in over time instead of hammering the pool API at once
    const learn=all.filter(t=>tokenOf[t]===undefined).slice(0,2);
    if(state.sel && tokenOf[state.sel]===undefined) learn.push(state.sel);
    for(const t of learn) await tokenFor(t);
    const known=all.filter(t=>tokenOf[t]);
    const wallets=allMyWallets();
    // sum each holding across every linked wallet
    const pairs=await Promise.all(known.map(async t=>{
      let total=null;
      for(const w of wallets){
        try{ const b=await erc20Balance(tokenOf[t], w); if(b!=null) total=(total||0n)+b; }
        catch(e){ /* one wallet failing must not hide the others */ }
      }
      return [t,total];
    }));
    const prev=new Map(state.positions.map(p=>[p.tick,p]));
    const next=[];
    for(const [t,bal] of pairs){
      if(bal==null || bal<=0n){
        // too new to be believed gone: keep it until the chain agrees
        const fresh=prev.get(t);
        if(justOpened(fresh)) next.push(fresh);
        continue;
      }
      const st=stocks[t]; if(!st) continue;
      const units=Number(bal)/1e18;
      const old=prev.get(t);
      // keep the cost basis of a position opened here; anything that arrived
      // from outside starts flat, so PnL is measured from when we first saw it
      const entry=(old&&old.entry)||st.price;
      next.push({id:old&&old.id||("w:"+t), tick:t, token:tokenOf[t], tokenWei:bal.toString(),
        units, usd:units*entry, entry, wallet:me, external:!old});
    }
    const checked=new Set(known);
    // positions for tickers we could not look up, but which name their own
    // token, get read directly rather than being trusted indefinitely
    const unchecked=state.positions.filter(p=>!checked.has(p.tick));
    const kept=[];
    for(const p of unchecked){
      if(!p.token){ kept.push(p); continue; }              // nothing to verify against
      let bal=null;
      try{
        for(const w of allMyWallets()){
          const b=await erc20Balance(p.token, w);
          if(b!=null) bal=(bal||0n)+b;
        }
      }catch(e){ kept.push(p); continue; }
      if(bal==null){ kept.push(p); continue; }             // could not read, keep it
      if(bal<=0n){ if(justOpened(p)) kept.push(p); continue; }   // sold, unless it is brand new
      const st=stocks[p.tick];
      const units=Number(bal)/1e18;
      const entry=p.entry||(st?st.price:0);
      kept.push({...p, tokenWei:bal.toString(), units, usd:units*entry, entry, wallet:me});
    }
    const merged=[...next,...kept];
    const key=list=>JSON.stringify(list.map(p=>[p.tick,p.tokenWei]).sort());
    const changed=key(merged)!==key(state.positions);
    state.positions=merged;
    if(changed){ save(); renderAll(); pushProfile(); }   // the leaderboard tracks the book
  }catch(e){ /* keep the last known holdings */ }
  finally{ holdingsBusy=false; }
}

/* -------- the shared backend --------
   Profiles, picks and likes live on the server so every signed-in wallet
   sees the same site. localStorage still holds your own positions and
   settings, which are yours alone. */
const API={
  async token(){
    const P=window.Privy;
    try{ return (P&&P.getAccessToken)? await P.getAccessToken() : null; }catch(_){ return null; }
  },
  async get(path){
    const r=await fetch(path,{cache:"no-store"});
    if(!r.ok) throw new Error("API "+r.status);
    return r.json();
  },
  async post(path,body){
    const t=await this.token();
    const r=await fetch(path,{method:"POST",
      headers:Object.assign({"content-type":"application/json"},t?{authorization:"Bearer "+t}:{}),
      body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d.error||("API "+r.status));
    return d;
  }
};
const myWallet=()=>(privyState.wallet&&privyState.wallet.address||"").toLowerCase();

/* a server profile in the shape the UI already renders */
/* tickers came back from the API in whatever case they were posted in,
   so line them up with the ones this app knows */
const TICK_BY_UPPER=Object.fromEntries(Object.keys(stocks).map(t=>[t.toUpperCase(),t]));
const normTick=t=>TICK_BY_UPPER[String(t||"").toUpperCase()]||String(t||"");
function userFromProfile(p,mine){
  return {id:mine?"me":p.wallet, wallet:p.wallet, handle:p.handle||"you",
    name:p.handle||"You", img:p.img||"", hue:p.hue,
    following:!!(state.follows&&state.follows[p.wallet]),
    profileSet:!!p.handle, joined:p.createdAt||0,
    calls:0, wins:0, rewards:0, followers:0, streak:0,
    pnl:Number(p.realised)||0,                 // all-time realised: what the board ranks on
    open:Number(p.open)||0, closed:Number(p.closed)||0,
    basis:Array.isArray(p.basis)?p.basis:[], basisAt:Number(p.basisAt)||0,
    wallets:Array.isArray(p.wallets)?p.wallets:[],
    book:Number(p.book)||0, cost:Number(p.cost)||0,
    positions:Number(p.positions)||0};
}
/* Tell you when a picker you follow posts.

   The first sync of a browser records what already exists without announcing
   any of it, so signing in does not fire off a notification for every pick
   ever made. After that, anything new from somebody you follow is one alert,
   once, and the id is remembered so a reload does not repeat it. */
function alertOnNewPicks(){
  const seen=new Set(state.seenCalls||[]);
  const first=!Array.isArray(state.seenCalls)||!state.seenCalls.length;
  const fresh=[];
  for(const c of picks){
    const id=String(c.id);
    if(seen.has(id)) continue;
    seen.add(id);
    if(first||c.user==="me") continue;         // no backlog, and not your own
    const u=byId(c.user);
    if(!u||!u.following) continue;
    fresh.push({c,u});
  }
  // keep the newest ids only, so this cannot grow without limit
  state.seenCalls=[...seen].slice(-400);
  // oldest first, so the newest pick ends up at the top of the list
  fresh.sort((x,y)=>x.c.ts-y.c.ts);
  for(const {c,u} of fresh){
    const th=String(c.thesis||"").trim();
    pushAlert("call",`@${u.handle} called ${c.tick}`,
      th?`"${th.length>90?th.slice(0,90)+String.fromCharCode(8230):th}"`:`at ${fmt(c.entry)}`,
      u.id, "call:"+c.id);
  }
  if(fresh.length||first) save();
}

let syncing=false, lastSync=0, routedOnce=false;
async function syncFromServer(force){
  if(syncing) return; if(!force && Date.now()-lastSync<4000) return;
  syncing=true;
  try{
    const mine=myWallet();
    const [pd,cd,fd]=await Promise.all([
      API.get("/api/profile"),
      API.get("/api/picks"+(mine?("?wallet="+mine):"")),
      API.get("/api/follow"+(mine?("?wallet="+mine):"")).catch(()=>({counts:{},following:[]}))
    ]);
    const fCounts=(fd&&fd.counts)||{};
    state.follows={};
    for(const w of ((fd&&fd.following)||[])) state.follows[w]=1;
    const me=byId("me");
    const server=(pd.profiles||[]);
    // every wallet on this account, plus the Privy identity behind them
    const myId=(privyState.user&&privyState.user.id)||null;
    const myWallets=new Set(((window.Privy&&window.Privy.wallets)||[])
      .map(x=>String(x.address||"").toLowerCase()).filter(Boolean));
    if(mine) myWallets.add(mine);
    const isMine=p=>{
      const w=String(p.wallet||"").toLowerCase();
      if(myId && p.privyId) return p.privyId===myId;
      return myWallets.has(w);
    };
    const others=server.filter(p=>!isMine(p))
                       .map(p=>{ const u=userFromProfile(p,false);
                                 u.followers=fCounts[String(p.wallet).toLowerCase()]||0; return u; });
    const minePro=server.find(isMine);
    if(minePro && me){ me.handle=minePro.handle||me.handle; me.name=me.handle;
      // do not undo a picture that is still on its way to the server
      if(minePro.img && !imgPending) me.img=minePro.img;
      if(minePro.hue!=null) me.hue=minePro.hue;
      me.profileSet=!!minePro.handle; }
    if(minePro && me) me.wallet=String(minePro.wallet||"").toLowerCase();
    if(me){ const b=myBook();
      me.pnl=state.realised||0;          // the board ranks on banked profit only
      me.open=b.pnl; me.book=b.value; me.cost=b.cost; me.positions=b.n;
      me.closed=state.closed||0;
      me.followers=fCounts[mine]||0; }
    users=[...others,...(me?[me]:[])];
    // real picks only, authored by real profiles
    const mineWallets=myWallets;
    picks=(cd.picks||[]).map(c=>({
      id:c.id, user:(mineWallets.has(String(c.wallet).toLowerCase())?"me":c.wallet),
      tick:normTick(c.tick), dir:c.dir, entry:+c.entry, thesis:c.thesis||"",
      likes:c.likes||0, liked:!!c.liked, ts:c.ts||Date.now(), epoch:epochOf(c.ts||Date.now()),
      m:m(0,0,0,0,0,0,0), myOpened:false, myTraded:false, dupe:false, flagged:false
    }));
    // a picker who posted before their profile row loaded still needs a row
    for(const c of picks){
      if(c.user!=="me" && !byId(c.user))
        users.unshift(userFromProfile({wallet:c.user,handle:c.handle||"picker"},false));
    }
    applyClaimed();
    alertOnNewPicks();
    lastSync=Date.now();
    renderAll();
    if(!routedOnce){ routedOnce=true; routeFromUrl(false); }   // honour /@handle once pickers load
  }catch(e){ /* offline or cold API: keep whatever is on screen */ }
  finally{ syncing=false; }
}
/* push your profile up so other people can see you */
/* Your open book, from the positions the chain says you hold. Published with
   your profile so the leaderboard can rank on real, combined PnL rather than
   on nothing. Cost basis lives only on your own device, so only you can
   compute this for you. */
function myBook(){
  const rows=state.positions||[];
  let cost=0,value=0;
  for(const p of rows){
    const st=stocks[p.tick];
    const px=st?st.price:p.entry;
    cost+=p.usd;
    value+=p.usd*(px/p.entry);
  }
  return {cost,value,pnl:value-cost,pct:cost?(value-cost)/cost*100:0,n:rows.length};
}
/* the address this account is registered under: the one the server already
   knows for this identity, not simply whichever wallet is active */
function accountWallet(){
  const me=byId("me");
  if(me && me.wallet) return String(me.wallet).toLowerCase();
  return myWallet();
}
async function pushProfile(){
  const w=accountWallet(); if(!w) return;
  const me=byId("me"); if(!me||!me.profileSet) return;
  const b=myBook();
  // what each holding cost, per unit, so anyone can price it live
  const basis=(state.positions||[])
    .filter(p=>p.units>0 && p.usd>=0)
    .map(p=>({tick:p.tick, units:p.units, cost:p.usd}));
  try{ await API.post("/api/profile",{wallet:w,handle:me.handle,img:me.img||"",hue:me.hue,
    realised:state.realised||0, closed:state.closed||0,
    open:b.pnl, book:b.value, cost:b.cost, positions:b.n, basis,
    wallets:allMyWallets()}); return true; }
  catch(e){ toast("Could not save your profile: "+String(e.message||e).slice(0,80)); return false; }
}
/* -------- import an existing wallet --------
   Email sign-ins get an embedded wallet from Privy automatically. This lets
   them attach a wallet they already own; it is hidden once one is attached. */
function embeddedAddr(){
  const P=window.Privy, e=P&&P.embeddedWallets&&P.embeddedWallets[0];
  return (e&&e.address)||null;
}
function canImportWallet(){
  const P=window.Privy;
  return !!(P&&P.ready&&P.authenticated&&!P.hasExternalWallet&&P.linkWallet);
}
function importWalletHTML(){
  if(!canImportWallet()) return "";
  const a=embeddedAddr();
  const made=a?("Privy created "+a.slice(0,6)+String.fromCharCode(8230)+a.slice(-4)+" for you when you signed in with email.")
             :"Privy is setting up a wallet for you.";
  return '<div class="imp-wallet">'
    +'<div class="imp-h">Your Stockpickr wallet</div>'
    +'<div class="imp-sub">'+made+' Already have a wallet? Attach it and Stockpickr will trade from that one instead.</div>'
    +'<button class="ghost" id="pfImportWallet">Import an existing wallet</button>'
    +'</div>';
}
function wireImportWallet(){
  const b=$("#pfImportWallet"); if(!b) return;
  b.onclick=async()=>{
    const P=window.Privy;
    if(!P||!P.linkWallet) return toast("Privy is still loading, one moment.");
    b.disabled=true; b.textContent="Opening Privy"+String.fromCharCode(8230);
    try{ await P.linkWallet(); }
    catch(e){ toast("Wallet not imported: "+String((e&&e.message)||e).slice(0,90)); }
    b.disabled=false; b.textContent="Import an existing wallet";
  };
}

/* -------- login gate: one button, Privy renders the rest -------- */
const gateErr=t=>{const e=$("#gateErr");e.hidden=!t;e.textContent=t||"";};
function showGate(){ $("#loginGate").hidden=false; gateErr(""); }
function hideGate(){ $("#loginGate").hidden=true; }
$("#gateLogin").onclick=()=>{
  const P=window.Privy;
  if(!P||!P.ready) return gateErr("Still loading Privy, one moment&");
  gateErr("");
  P.login();                      // opens the Privy modal
};
$("#privyBtn").onclick=()=>{
  if(privyState.wallet){ openDeposit(); return; }
  showGate();
};
function openDeposit(){
  const w=privyState.wallet;
  if(PAPER){
    $("#depBody").innerHTML=
      `<p style="font-size:12.5px;color:var(--muted);line-height:1.6">`+
      `This is a paper account: the ${fmt(state.balance)} you are trading is a practice `+
      `balance, not a wallet. There is no address to fund, and nothing here settles `+
      `on-chain. Configure a wallet provider to trade for real.</p>`;
    $("#depositOverlay").classList.add("open");
    return;
  }
  $("#depBody").innerHTML=w?`
    <div class="fee-box" style="margin-bottom:10px">
      <div class="row"><span>Network</span><b>Ethereum / Base</b></div>
      <div class="row" style="word-break:break-all"><span>Your wallet</span></div>
      <div style="font-size:12px;color:var(--text);word-break:break-all;padding:4px 0 2px">${w.address}</div>
    </div>
    <p style="font-size:12px;color:var(--muted)">Send USDC to this address to fund your account. Balances credit automatically once your payment processor / contract is wired to this wallet.</p>`
    :`<p style="font-size:12.5px;color:var(--muted)">Sign in with Privy first to get your deposit wallet. In demo mode your account uses simulated cash (${fmt(state.balance)}).</p>`;
  // the treasury balance is deliberately not shown anywhere in the app
  $("#depositOverlay").classList.add("open");
}
/* tapping the balance switches the unit rather than opening anything */
$("#depositChip").onclick=()=>{
  state.balUsd=!state.balUsd;
  $("#balance").innerHTML=balanceChipHTML();
  save();
};

/* -------- first login: username is required -------- */
function showUsernameGate(){
  const o=$("#usernameOverlay");
  if(o.classList.contains("open")) return;
  $("#unErr").style.display="none";
  $("#unInput").value="";
  $("#unStep1").hidden=false; $("#unStep2").hidden=true;
  $("#unDot2").classList.remove("on");
  document.querySelector(".un-point").innerHTML='<span class="un-arrow">&#8595;</span> Create your username to unlock the terminal';
  o.classList.add("open");
  setTimeout(()=>$("#unInput").focus(),50);
}
function saveUsername(){
  const err=t=>{const n=$("#unErr");n.style.display=t?"block":"none";n.textContent=t||"";};
  const h=$("#unInput").value.trim().replace(/^@/,"");
  if(!h) return err("Pick a username to continue.");
  if(!/^[a-zA-Z0-9_.]{3,20}$/.test(h)) return err("3-20 characters: letters, numbers, _ or .");
  if(users.some(x=>x.id!=="me"&&x.handle.toLowerCase()===h.toLowerCase())) return err(`@${h} is already taken, pick another.`);
  const u=byId("me");
  u.handle=h.toLowerCase(); u.name=u.handle;
  if(u.hue==null) u.hue=randHue();
  // step 2: the picture, optional
  $("#unStep1").hidden=true; $("#unStep2").hidden=false;
  $("#unDot2").classList.add("on");
  $("#unPoint")&&0;
  document.querySelector(".un-point").innerHTML='<span class="un-arrow">&#8595;</span> One more step, then you are in';
  save(); return;
}
function finishSetup(){
  const u=byId("me");
  u.profileSet=true;
  $("#usernameOverlay").classList.remove("open");
  state.introDone=false; state.lTab="alerts";
  document.querySelectorAll("#lTabs button").forEach(x=>x.classList.toggle("on",x.dataset.l==="alerts"));
  save(); renderAll();
  toast(`You are <b>@${u.handle}</b>. Welcome to Stockpickr.`);
  pushProfile();                               // claim the handle on the server
}
$("#unSave").onclick=saveUsername;
$("#unDone").onclick=finishSetup;
$("#unImg").onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  shrinkImage(f,256).then(d=>{
    byId("me").img=d;
    $("#unPrev").innerHTML=`<img src="${d}" alt="">`;
    $("#unFile").textContent=f.name; save();
  }).catch(err=>toast(String(err.message||err)));
};
$("#unInput").addEventListener("keydown",e=>{ if(e.key==="Enter") saveUsername(); });
$("#unInput").addEventListener("input",()=>{
  const n=$("#unErr"), h=$("#unInput").value.trim().replace(/^@/,"");
  const show=(t,ok)=>{ n.style.display=t?"block":"none"; n.textContent=t||"";
    n.style.color=ok?"var(--gain)":"#f5c451"; };
  if(!h) return show("");
  if(!/^[a-zA-Z0-9_.]{3,20}$/.test(h)) return show("3-20 characters: letters, numbers, _ or .",false);
  if(users.some(x=>x.id!=="me"&&x.handle.toLowerCase()===h.toLowerCase()))
    return show(`@${h} is taken, pick another.`,false);
  show(`@${h} is available.`,true);
});

/* -------- mobile trade bar -------- */
function renderMobileTrade(){
  const bar=$("#mTrade"); if(!bar) return;
  const t=state.sel, st=stocks[t];
  /* Buy and Sell belong to one screen: a tokenised stock you are looking at.
     Not the feed, the leaderboard, rewards or a profile, where there is
     nothing to buy, and not while the markets list is slid over the top of
     it, where the buttons would act on whatever is behind the drawer. */
  const cols=document.querySelector(".cols");
  const drawerOpen=!!(cols && cols.classList.contains("drawer-open"));
  const overlayOpen=!!document.querySelector(".overlay.open");
  const onStock=!state.pageNav && !drawerOpen && !overlayOpen && !!st;
  bar.hidden=!onStock;
  if(!onStock) return;
  $("#mTradeTick").textContent=t;
  $("#mTradePrice").textContent=`${fmt(st.price)}  ${st.chg24>=0?"+":""}${(st.chg24||0).toFixed(2)}%`;
  $("#mTradePrice").className=st.chg24>=0?"up":"down";
}
/* bring the trade card into view and focus the amount */
function jumpToTrade(side){
  if(!requireAuth()) return;
  if(side==="sell"){ $("#tabSell").click(); } else { $("#tabBuy").click(); }
  const card=document.querySelector(".right .card");
  if(card) card.scrollIntoView({behavior:"smooth",block:"start"});
  if(side!=="sell") setTimeout(()=>{ const a=$("#buyAmt"); if(a) a.focus(); },400);
}
$("#mTradeBuy").onclick=()=>jumpToTrade("buy");
$("#mTradeSell").onclick=()=>jumpToTrade("sell");

/* -------- collapsible left panel -------- */
function applyLeftPanel(){
  document.querySelector(".cols").classList.toggle("left-hidden", !!state.leftHidden);
  $("#leftReopen").hidden = !state.leftHidden;
}
$("#lCollapse").onclick=()=>{ state.leftHidden=true;  applyLeftPanel(); save(); };
$("#leftReopen").onclick=()=>{ state.leftHidden=false; applyLeftPanel(); renderLeft(); save(); };

/* -------- boot -------- */
checkEpoch();
state.authed=false;                 // only a live Privy session authenticates
renderAll();
applyLeftPanel();
epochTick();
// the Privy bridge fires privy:change once it is ready; show the gate only if still signed out
setTimeout(()=>{ if(!state.authed) showGate(); }, 1200);
lockToApp(); wireGetApp();
syncFromServer(true);                            // real pickers, signed in or not
TIMERS.push(setInterval(()=>syncFromServer(false), 6000));     // the feed keeps itself current
TIMERS.push(setInterval(syncHoldings, 25000));                 // and the wallet stays tracked
// and catch up the moment the tab comes back into focus
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) syncFromServer(true); });
window.addEventListener("focus",()=>syncFromServer(true));

/* ==================== paper settlement ====================
   Reached only when PAPER is on. An order moves the seeded practice balance
   instead of building a swap, and every position written here is marked so a
   later live session can tell it apart from a real holding. */
function paperTrade(){
  const t=state.sel, amt=Math.max(0,parseFloat($("#buyAmt").value)||0);
  if(amt<=0) return toast("Enter an amount first.");
  if(!stocks[t]) return toast("No market for that ticker right now.");
  if(amt>state.balance)
    return toast(`That is more than your ${fmt(state.balance)} practice balance.`);

  state.balance-=amt;
  const fee=amt*CFG.FEE;
  state.positions.push({id:Date.now(),tick:t,usd:amt,entry:stocks[t].price,
    openedAt:Date.now(),wallet:paperAddress(),paper:true});

  let msg=`Bought ${fmt(amt)} of <b>${t}</b>`;
  const via=state.via?picks.find(c=>c.id===state.via):attributedPick();
  if(via && via.tick===t && via.epoch===state.epochN){
    if(!via.myTraded){ via.m.traders+=1; via.myTraded=true; }
    via.m.volume+=amt; via.m.fees+=fee;
    msg+=`, attributed to <b>@${byId(via.user).handle}</b>`;
  }
  (swapsData[t]=swapsData[t]||[]).unshift({u:"me",side:"Buy",usd:amt,ago:"0m"});
  $("#buyAmt").value="";
  renderAll(); save(); toast(msg+", on paper.");
  // you can only pick a stock you hold, so ask for the pick right after buying
  setTimeout(()=>openPickModal(true,t),700);
}

function paperSell(i){
  const p=state.positions[i];
  const st=stocks[p.tick];
  if(!st) return toast(`No market for <b>${p.tick}</b> right now, try again shortly.`);
  const val=p.usd*(st.price/p.entry), realised=val-p.usd;
  state.balance+=val;
  state.realised=(state.realised||0)+realised;
  state.closed=(state.closed||0)+1;
  const me=byId("me"); if(me) me.pnl=state.realised;
  state.positions.splice(i,1);
  (swapsData[p.tick]=swapsData[p.tick]||[]).unshift({u:"me",side:"Sell",usd:val,ago:"0m"});
  renderAll(); save();
  toast(`Sold <b>${p.tick}</b> for ${fmt(val)}, ${realised>=0?"up":"down"} `+
        `<b>${fmt(Math.abs(realised))}</b>, on paper.`);
}

  return cleanup;
}
