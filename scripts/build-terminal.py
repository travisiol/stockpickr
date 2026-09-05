"""Record of how src/app/(terminal)/terminal.js was produced.

The terminal began life as one standalone HTML page. This script is the
transformation that turned it into a module: it takes the page's <style>, its
body markup and its <script> (extracted to out/terminal.css, out/shell.html
and out/terminal-body.js), applies every deliberate change listed below, and
writes out/terminal.js.

It is kept as documentation rather than as a build step: it needs those
extracted inputs, which are not in the repo. Every `assert` below is a claim
about the source that failed loudly if the source was not what was expected.

What it changes, beyond the rename:
  - paper mode branches in trade, sellPos, fetchWalletBalance, syncHoldings
  - the header balance chip and deposit modal, which had no paper wording
  - a hardcoded treasury wallet, which now comes from site.ts and ships empty
  - the chain RPC, relayed through /api/rpc because the public endpoint sends
    a doubled Access-Control-Allow-Origin header that browsers reject
  - two addresses shortened with a literal "&" where the rest of the file used
    an ellipsis
  - copy that still said "call" where the product now says "pick", and
    sign-in prompts that assumed a wallet
  - localStorage keys still carrying the old prefix
  - viem imported from the project instead of a CDN
  - the boot block's timers handed to TIMERS so the effect can stop them
"""

import io, os

HERE = os.path.dirname(os.path.abspath(__file__))
shell = open(os.path.join(HERE, 'out/shell.html'), encoding='utf-8').read()
body = open(os.path.join(HERE, 'out/terminal-body.js'), encoding='utf-8').read()

NL = chr(10)
BS = chr(92)


def patch(text, anchor, add, label):
    assert text.count(anchor) == 1, (label, text.count(anchor))
    return text.replace(anchor, anchor + add)


body = patch(
    body,
    'async function trade(){' + NL + '  if(!requireAuth()) return;',
    NL + '  if(PAPER) return paperTrade();', 'trade')

body = patch(
    body,
    'async function sellPos(id){' + NL + '  const i=state.positions.findIndex(p=>p.id==id);' + NL +
    '  if(i<0) return toast("That position is no longer open.");' + NL + '  const p=state.positions[i];',
    NL + '  if(PAPER||p.paper) return paperSell(i);', 'sellPos')

body = patch(
    body,
    'async function fetchWalletBalance(){' + NL + '  const a=privyState.wallet&&privyState.wallet.address;',
    NL + '  if(PAPER){ walletState.live=false; renderMoney(); return; }', 'fetchWalletBalance')

body = patch(
    body,
    'async function syncHoldings(){' + NL + '  const me=privyState.wallet&&privyState.wallet.address;' + NL +
    '  if(!me||holdingsBusy) return;',
    NL + '  if(PAPER) return;', 'syncHoldings')

# the practice balance belongs in the header chip, not "Not connected"
body = patch(
    body,
    'function balanceChipHTML(){',
    NL + '  if(PAPER) return `<b class="bal-cur">PAPER</b>${fmt(state.balance)}`;', 'balanceChip')

# a paper account has no address to fund, so the deposit modal says so
DEPOSIT = NL.join([
    '',
    '  if(PAPER){',
    '    $("#depBody").innerHTML=',
    '      `<p style="font-size:12.5px;color:var(--muted);line-height:1.6">`+',
    '      `This is a paper account: the ${fmt(state.balance)} you are trading is a practice `+',
    '      `balance, not a wallet. There is no address to fund, and nothing here settles `+',
    '      `on-chain. Configure a wallet provider to trade for real.</p>`;',
    '    $("#depositOverlay").classList.add("open");',
    '    return;',
    '  }',
])
body = patch(
    body,
    'function openDeposit(){' + NL + '  const w=privyState.wallet;',
    DEPOSIT, 'openDeposit')

# The original shortens an address with a literal "&" in two places, where the
# rest of the file uses an ellipsis. Same intent, so make all four agree.
for a, b in [
    ('w.address.slice(0,6)+"&"+w.address.slice(-4)',
     'w.address.slice(0,6)+String.fromCharCode(8230)+w.address.slice(-4)'),
    ('a.slice(0,6)+"&"+a.slice(-4)',
     'a.slice(0,6)+String.fromCharCode(8230)+a.slice(-4)'),
]:
    assert body.count(a) == 1, a
    body = body.replace(a, b)

# Copy the rename could not reach: "a call" is what this product used to be
# about, and these strings are the ones a user actually reads.
COPY = [
    ('whose calls were right', 'whose picks were right'),
    ('whose calls are right', 'whose picks are right'),
    ('<small>Called at</small>', '<small>Picked at</small>'),
    ('<small>Call is</small>', '<small>Pick is</small>'),
    ('Call a stock you hold, with your thesis.', 'Pick a stock you hold, with your thesis.'),
    ('track when they call out.', 'track when they post a pick.'),
    ('`Your call on ${', '`Your pick on ${'),
    ('the creators who call the market', 'the creators who pick the market'),
    ('<th>Call</th><th>Since call</th>', '<th>Pick</th><th>Since pick</th>'),
    ('Call it so your trade can earn', 'Pick it so your trade can earn'),
    # these read wrong in paper mode, where there is no wallet to sign in with
    ('Sign in with your wallet to earn from the pool.', 'Sign in to earn from the pool.'),
    ('Sign in with your wallet to trade and see positions.', 'Sign in to trade and see positions.'),
    ('Sign in with your wallet to see your portfolio.', 'Sign in to see your portfolio.'),
    ('Sign in with your wallet to appear on the leaderboard.', 'Sign in to appear on the leaderboard.'),
]
for a, b in COPY:
    n = shell.count(a) + body.count(a)
    assert n == 1, ('copy', a, n)
    shell = shell.replace(a, b)
    body = body.replace(a, b)

# the pool caches still carried the old "sc_" prefix in localStorage
for a, b in [('"sc_pools"', '"sp_pools"'), ('"sc_pk"', '"sp_pk"')]:
    assert body.count(a) == 2, (a, body.count(a))
    body = body.replace(a, b)

# The port carried the original's own treasury wallet hardcoded. That address
# is not ours to read a balance from or to present as this product's treasury,
# so it comes from site.ts and ships empty.
old_treasury = 'address:"0xfcb7d6E48E3718e235035fcE48D0cB1db94D09F0",   // Pick Rewards treasury'
assert body.count(old_treasury) == 1
body = body.replace(
    old_treasury,
    'address:site.treasury,                        // Picker Rewards treasury, empty until there is one')

# Robinhood Chain's public RPC sends "Access-Control-Allow-Origin: *,*", which
# every browser rejects, so every chain read is relayed through our own route.
old_rpc = 'rpc:"https://rpc.mainnet.chain.robinhood.com",// Robinhood Chain mainnet, chain id 4663'
assert body.count(old_rpc) == 1
body = body.replace(
    old_rpc,
    'rpc:"/api/rpc",                               // relayed: the public RPC sends a malformed CORS header')

# viem comes from the project rather than from a CDN
old = 'await import("https://esm.sh/viem@2.56.0")'
assert body.count(old) == 1
body = body.replace(old, 'await import("viem")')

# the boot block starts timers; hand them to TIMERS so the effect can stop them
for a, b in [
    ('setInterval(()=>syncFromServer(false), 6000);',
     'TIMERS.push(setInterval(()=>syncFromServer(false), 6000));'),
    ('setInterval(syncHoldings, 25000);',
     'TIMERS.push(setInterval(syncHoldings, 25000));'),
]:
    assert body.count(a) == 1, a
    body = body.replace(a, b)


def esc(s):
    return s.replace(BS, BS * 2).replace('`', BS + '`').replace('${', BS + '${')


HEADER = '''
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
'''

PRELUDE = '''
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
'''

PAPER = '''

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
'''

out = io.open(os.path.join(HERE, 'out/terminal.js'), 'w', encoding='utf-8', newline=NL)
out.write('/* eslint-disable */' + NL)
out.write(HEADER)
out.write(NL + 'const SHELL = `' + esc(shell) + '`;' + NL)
out.write(PRELUDE)
out.write(NL + '/* ==================== the ported terminal ==================== */' + NL)
out.write(body)
out.write(PAPER)
out.write(NL + '  return cleanup;' + NL + '}' + NL)
out.close()

n = sum(1 for _ in io.open(os.path.join(HERE, 'out/terminal.js'), encoding='utf-8'))
print('terminal.js:', n, 'lines')
