/* ---------------------------------------------------------------------------
   STOCKPICKR shared config.

   THE CONTRACT ADDRESS LIVES HERE AND NOWHERE ELSE.
   Set `ca` to the token address and every place on the site that shows it
   updates: the nav pill on the landing page, the footer, and the Rewards
   panel in the terminal. Left "" before launch, all three render "soon"
   rather than inventing an address.
--------------------------------------------------------------------------- */

export const site = {
  name: "STOCKPICKR",
  /* the same name set as a word, for running prose where all caps shouts */
  word: "Stockpickr",
  /* the wordmark is one word in two tones: ink, then brass */
  markHead: "Stock",
  markTail: "pickr",
  tagline: "where the picks get paid",
  legalEntity: "Stockpickr Labs",

  /* empty until the token is deployed */
  ca: "",

  /* the Picker Rewards distributor. Deploy it, fund it from the treasury,
     and paste its address here. Empty means claiming is not live yet and
     the app says so rather than pretending. */
  rewards: "",

  /* the treasury wallet the rewards pool accrues into. Empty means the
     landing page shows "Not yet" instead of reading a balance that is not
     ours to quote. */
  treasury: "",

  chainId: 4663,
  rpc: "https://rpc.mainnet.chain.robinhood.com",

  x: "https://x.com/stockpickr",

  /* the economics, quoted in one place so the copy cannot drift from the
     terminal's maths */
  poolCut: 0.25, // share of coin trading fees that funds the rewards pool
  tradeFee: 0, // what an order costs on Stockpickr itself
} as const;

export const shortCa = (ca: string) => (ca ? ca.slice(0, 3) + "…" : "soon");
