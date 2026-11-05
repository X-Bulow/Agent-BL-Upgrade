# 🎬 AgentBL · Project Video Script (AI Agent × Blockchain · Security / Risk Agent)

> **Purpose**: Voice-over script for the hackathon submission video. The main thread is **"our idea + the AI highlights"**, deliberately aligned with
> the main track **AI Agent × Blockchain** and the special award **Security / Risk Agent**.
> **How it differs from [`demo-script.md`](./demo-script.md)**: `demo-script.md` is a financial-argument demo script about "can investors lose money";
> **this document is a product pitch video aimed at the judges**, presenting the AI as an Agent that carries security and risk-control
> responsibilities. Use either one, or combine them (use this one for the pitch and the "three settlements" from demo-script as the climax).
> **Companion commands**: `npm run dev` (web page), `npm run agent:value` (AI tool-call trace), `npm run demo:default`
> (three settlements), `npm run qa` (judge Q&A). **All numbers are measured outputs of the pricing engine and can be read out as-is.**

---

## 🎯 One-Line Positioning (the "winning point" of the whole video)

> **In most Web3 projects the "AI Agent" is just a chat box bolted on; AgentBL's AI is a real "Security & Risk Agent" that does the dirty work
> and takes responsibility — [before] investors place an order, it identifies trade fraud for them, prices real-world risk,
> and writes every decision on-chain to be enforced by smart contracts. The AI prices; the chain executes.**

English pitch (opening/closing subtitles):

> **AgentBL's AI isn't a chatbot — it's a Security & Risk Agent that prices real-world
> trade risk into an on-chain decision before investors are ever exposed.**
> *The AI prices the risk. The chain enforces it.*

---

## ⏱️ 30-Second Elevator Version (for the opening or a standalone submission)

> In international trade, once the goods are loaded onto the ship, the money takes more than a month to come back. The exporter pledges the **electronic bill of lading** that represents title to the goods on-chain and issues
> an RWA backed by the cargo value; capital providers subscribe at a discount, with a target redemption of 1 US dollar. But the off-chain world is full of fraud and risk —
> **who watches over all this for investors before they place an order?** AgentBL's answer is an **AI Security & Risk Agent**:
> it reviews documents for fraud, calls tools to value the cargo, prices war and insurance risk, and writes "whether to open the offering and at what issue price" into an on-chain contract.
> Ordinary DeFi lets the market guess the price; **we let AI set the risk as an explainable, on-chain discount before subscription.**

🇬🇧 *Goods ship, cash is locked for 45 days. We turn an electronic bill of lading into an
RWA, and let an AI Security & Risk Agent detect fraud and price real-world risk into the
on-chain issue price — before investors buy. The AI prices the risk; the chain enforces it.*

---

## ⏱️ 90-Second Short Version (idea → security highlight → war → close)

**[0:00–0:20 Idea]**
> This is AgentBL. The pain point is simple: the goods are loaded, but the money takes another 45 days to come back. The exporter pledges the electronic bill of lading and issues RWA to raise financing,
> and investors subscribe at a discount. But the really hard part is — who guards against off-chain fraud and risk? Our answer is an **AI Risk Agent**.

**[0:20–0:50 Security highlight: anti-fraud document review]**
> Before putting any price on the RWA, the Agent first performs an **anti-fraud document review**: it cross-checks the three documents for the same cargo — the electronic bill of lading, the commercial invoice and the insurance policy —
> do the quantities match, does the invoice unit price deviate from the market (over- or under-invoicing), does the insurance cover the cargo value,
> and will the policy expire before arrival at port. Every red flag is converted into risk basis points that directly push down the issue price. This is something a price oracle can never do.

**[0:50–1:15 War: seeing through the deceptive signal]**
> The most hard-core move: when war breaks out, copper prices **rise**, and an oracle that only looks at price thinks "the collateral is worth more, so it's safer" — completely backwards.
> Our Agent knows this is a fragile war premium: default↑, insurance void because of the war exclusion↓, recovery↓, so it does the opposite: a 21% haircut
> on the cargo value, risk pushed to 1410 basis points, and the offering is **paused** outright, keeping investors out of the blow-up.

**[1:15–1:30 On-chain + close]**
> Every decision, together with its **evidence hash**, is written to the on-chain RiskPricingOracle — auditable and tamper-proof.
> **Ordinary DeFi lets the market guess the price; AgentBL lets AI price trade risk into an on-chain discount before investors place an order.**
> The AI prices; the chain executes.

---

## 🎥 Full Version (about 3 min 40 s)

> Recording language suggestion: **voice-over + English subtitles** (key lines come with a condensed 🇬🇧 English version that can be used directly as subtitles or for a shorter English recording).
> The camera switches between **the two web interfaces** and, when needed, **the terminal**; all numbers can simply be read out as written.

### Opening Title Caption (3 seconds)
```
AgentBL · AI dynamically priced, eBL-backed RWA trade finance protocol
The AI prices the risk. The chain enforces it.
ETH Beijing 2026 · Main track AI Agent × Blockchain · Special award Security / Risk Agent
```

### [0:00–0:30] Opening: Our Idea & the Question That Should Be Asked
**[Visual]** Web home page / logo (top of interface ①)
**[Voice-over]**
> Hi everyone, this is AgentBL. First the pain point: in international trade, once the goods are loaded onto the ship, it takes 30 to 45 days for the exporter's money to come back;
> and the global trade finance gap is as high as **2.5 trillion US dollars**. We let exporters pledge the **electronic bill of lading** representing title to the in-transit goods on-chain,
> and issue an **RWA** backed by the value of that cargo; investors subscribe at a discount, with a target redemption of 1 US dollar.
> But the real challenge isn't issuing a token — it's that **the off-chain world is full of fraud and risk**: documents may be forged, insurance may be insufficient,
> and war could wipe everything out. **Who assesses and prices these risks correctly for investors before they place an order?**
> That is AgentBL's whole answer: an **AI Security & Risk Agent**.

🇬🇧 *The hard part isn't tokenizing a bill of lading — it's that the off-chain world is full of
fraud and risk. Who prices that for the investor, before they buy? That's our AI Risk Agent.*

### [0:30–1:00] Positioning: This Is What "AI Agent × Blockchain" Should Look Like
**[Visual]** README architecture diagram / simple sketch: `AI engine → API → smart contracts`
**[Voice-over]**
> AgentBL is an **AI dynamically priced RWA trade finance protocol**. Remember one thing: our AI is **not a chatbot**,
> but an Agent that carries real financial responsibilities — it **reviews documents, values cargo, prices risk, decides how much can be financed and whether to open the offering**,
> and then writes every decision on-chain, to be enforced by smart contracts.
> This is exactly the division of labour "AI Agent × Blockchain" should have: **AI makes the judgement; the blockchain handles execution and record-keeping.**
> Next, three AI highlights will show you what makes this Agent so capable.

🇬🇧 *The AI doesn't chat — it underwrites. It values cargo, prices risk, sets the financing cap
and the on-chain action. AI makes the call; the chain enforces and records it.*

### [1:00–1:45] ⭐ AI Highlight ① | Security: Anti-Fraud Document Review (the core of our special-award bid)
**[Visual]** In interface ①, select **"Copper · Shanghai → Hamburg (insurance gap)"** at the top → look at the "AI Cargo Valuation & Route Risk" card, with document/insurance items in red + data source tags
**[Voice-over]**
> The first highlight, and the core of our bid for the "Security / Risk Agent" special award: **before putting any price on the RWA,
> the Agent first performs an anti-fraud document review.** The most common form of trade finance fraud is when the three documents for the same cargo don't match —
> the electronic bill of lading, the commercial invoice and the insurance policy. Our Agent cross-checks them item by item like a document examiner:
> **do the quantities match** (mismatch +250bps), **does the invoice unit price deviate from the market price** — detecting over- or under-invoicing (+150bps),
> **does the insurance cover the cargo value** (under-insured +220bps), **does the policy expire before arrival at port**, **are the Incoterms consistent**...
> Every red flag is converted into specific **risk basis points** and pushed straight into the issue price.
> Look at this case: the AI catches it on the spot — **the insured amount is below the cargo value, and the policy expires almost exactly on the day of arrival at port** —
> these are off-chain risks that an oracle looking only at token prices can never see. **Risk control starts with document review.**

🇬🇧 *Trade-finance fraud shows up as mismatches between the eBL, the invoice and the insurance
policy. The Agent cross-checks them — quantity, mis-invoicing vs market, under-insurance,
a policy expiring before arrival — and folds each into the price in basis points.*

> 💡 **Director's note**: this segment is the "key theme" for the special award — slow down and lean on the words "anti-fraud / fraud detection".
> For a more hard-core touch, cut to the terminal: the document review logic is in `src/agent/documentConsistency.js`, with 7 cross-checks and a maximum penalty of 600bps.

### [1:45–2:25] ⭐ AI Highlight ② | Evidence-Backed: Tool-Calling Valuation + RAG Risk Intelligence
**[Visual]** Interface ① "AI Cargo Valuation" card + the **data source** tag on each item + the "AI Pricing Desk" waterfall chart; optionally cut to the terminal and run `npm run agent:value` to show the `tool_trace`
**[Voice-over]**
> The second highlight: **every number the Agent produces is backed by evidence, not generated out of thin air.** When valuing, it **calls tools** like a human analyst —
> pulling the **real-time LME copper price**, checking the **regional premium at the destination port**, and using **UN Comtrade historical comparable trades** for cross-verification,
> and finally, at the peak of the war premium, it **proactively applies a conservative volatility haircut**, never inflating the valuation at the top.
> At the same time, a **RAG retriever** pulls the most relevant macro events from the risk intelligence library, **each with its information source**.
> All of this comes together into an **"evidence graph"**: why the issue price is discounted step by step from 1 US dollar to 0.85 and 0.80 —
> which piece of evidence and which source sits behind each discount tier, laid out clearly.
> **Explainable and auditable** — that is the fundamental difference between a responsible Agent and a black-box model.

🇬🇧 *Every number is grounded. The Agent calls tools — live LME price, regional premium,
UN Comtrade historical comparables — applies a conservative war-premium haircut, and a RAG
retriever cites macro-risk intel with sources. The result is an auditable evidence graph.*

### [2:25–3:05] ⭐ AI Highlight ③ | Risk Instinct: Seeing Through the Deceptive "War Premium" Signal
**[Visual]** Interface ② Voyage Tracking → click **"⚔ Hormuz Conflict Escalation"** (price drops on the spot, risk turns red, AI pauses); or switch at the top to the **"Hormuz war crisis"** case for comparison (CRITICAL / PAUSE right at opening)
**[Voice-over]**
> The third highlight is where this Agent behaves most like a "risk expert". **When war breaks out, copper prices actually rise.**
> An oracle that only looks at price reaches a fatally wrong conclusion: the collateral is worth more, so this loan is safer — **completely backwards.**
> Our Agent knows this is a **"correlated double-edged sword"** — the war premium also means the importer's default probability rises,
> insurance fails because of the "war exclusion" clause, and the liquidation recovery rate falls; **all the protections collapse together.**
> So the Agent does the opposite: it applies a **21% haircut** to the verified cargo value, pushes the risk score to **1410 basis points**,
> and then directly **PAUSES the offering** — keeping investors off a ride that is bound to blow up.
> **That is the fundamental difference between a "Risk Agent" and a "price feed".**

🇬🇧 *War spikes the copper price. A price oracle thinks the collateral is now safer — exactly
backwards. The Agent knows war premium is a correlated double-edge: default up, insurance void,
recovery down. So it does the opposite — haircut 21%, risk 1410bps, and PAUSE.*

> 💡 **Optional reinforcement (financial rigour)**: cut to the terminal and run `npm run demo:default` to run the same copper deal through three settlements —
> repayment **0.80→1.00 earns 25%**, a war-tail default recovers only **0.698, a 12.8% loss**, and a mild default is made whole on principal by over-collateralisation.
> Nail it in one sentence: **1 US dollar is a target, not a guarantee; that 0.20 discount is exactly the premium the AI collects up front for the default tail.**

### [3:05–3:30] Closing the Security Loop: On-Chain Records + Why It Must Be Priced Right "Up Front"
**[Visual]** Interface ① click "⛓ Mint RWA On-Chain" (MetaMask signature / real Injective transaction) → the result card shows `tx_hash` / `quote_hash` / `evidence_hash`; or the contract timeline `Funded → InTransit`
**[Voice-over]**
> Finally, the security loop closes on-chain. **Every pricing decision the Agent makes, together with the hash of the evidence it relied on**, is written to the on-chain
> **RiskPricingOracle** — auditable, tamper-proof, and no one can alter it.
> Why must the price be right **before** subscription? Because the money is sent to the exporter at the moment of **Funded**, while the goods are still at sea;
> if risk escalates afterwards, no amount of repricing **can protect the money already invested** — that discount is the investor's only,
> **prepaid** compensation for risk.
> There is one more safety guardrail: **we let the LLM only write explanations, while the final price is validated by a deterministic engine and schema** —
> even if the model glitches, it cannot set a wild price. **148 tests** guard this invariant.

🇬🇧 *Every decision, with its evidence hash, is written to an on-chain RiskPricingOracle —
auditable and tamper-proof. And the LLM never sets the final price alone: a deterministic
policy and schema guardrail validate it. 148 tests guard that invariant.*

### [3:30–3:50] Close
**[Visual]** Full-screen tagline caption
**[Voice-over]**
> To sum up in one sentence: **ordinary DeFi lets the market guess the price and lets liquidation clean up afterwards; AgentBL lets an AI Security & Risk Agent,
> before investors place an order, price trade fraud and real-world risk into an explainable, on-chain RWA discount.**
> **The AI prices; the chain executes.** This is AgentBL. Thank you.

🇬🇧 *Ordinary DeFi lets the market guess the price and lets liquidation clean up the mess.
AgentBL lets an AI Security & Risk Agent price fraud and real-world risk into an explainable,
on-chain discount — before investors buy. The AI prices the risk. The chain enforces it.*

---

## 🏆 Why This Video Can Win the "Security / Risk Agent" Special Award

> Before recording, get the whole team aligned on these 5 "security" evidence points — these are exactly what the judges want, and each one has visual support in the video:

| # | Security / risk-control capability | Video segment | Code anchor |
|---|---|---|---|
| 1 | **Anti-fraud document review**: three-way cross-check of eBL / invoice / insurance, detecting over- and under-invoicing, under-insurance and expired policies | Highlight ① [1:00] | `src/agent/documentConsistency.js` (7 checks, max 600bps) |
| 2 | **Risk pricing**: turns off-chain risk into bps that directly determine the issue price, financing amount, and open/pause | Highlights ①②③ | `src/core/pricingEngine.js` (`scoreRisk` / `priceRwaOffering`) |
| 3 | **Seeing through deceptive signals**: the "correlated double edge" of the war premium, with a counter-move haircut + PAUSE | Highlight ③ [2:25] | warcrisis case → 1410bps / PAUSE |
| 4 | **Tamper-proof on-chain records**: every decision written to RiskPricingOracle with `evidence_hash` / `quote_hash` | On-chain [3:05] | `RiskPricingOracle.sol` · `oracle.js` |
| 5 | **AI safety guardrails**: the LLM only explains and never prices; deterministic engine + schema validation + offline fallback | On-chain [3:05] | `pricingSchema.js` · `valuationAgent.js` (fallback) |

**One line for the judges**: *Our agent's job is to protect the investor — it detects trade-finance fraud,
prices correlated tail risk, and pauses the deal when the math says stop, with every decision
anchored on-chain.*

---

## 🗣️ Recording Tips

- **Read the numbers accurately** (all are measured engine outputs): document review penalties `+250 / +220 / +150 / +120bps`; war crisis `1410bps` /
  cargo value `−21%` / `PAUSE`; three settlements `+25%` / recovery `0.698`, i.e. `−12.8%`; three issue price tiers `0.80 / 0.85 / 0.89`;
  tests `148 passing`.
- **Pacing**: Highlight ① (anti-fraud) and Highlight ③ (war) are the two climaxes that win the special award — **slow down and stress them**; Highlight ② can be a bit faster.
- **Repeat the keywords**: make sure "**anti-fraud / fraud detection**", "**Risk Agent**" and "**explainable, on-chain**"
  each appear at least twice in the voice-over — the judges are listening for the special-award keywords.
- **English version**: every segment has a 🇬🇧 line; you can record whole segments in English, or use voice-over + English subtitles (recommended, wider audience).
- **Fallback**: if the web page has problems, the whole thing can be presented from the terminal —
  `npm run agent:value` (tool-call trace), `npm run price` (one pricing quote), `npm run demo:default` (three settlements),
  `npm run qa` (judge Q&A), with no gap in the logic.
- **Bonus for real on-chain transactions**: if Injective Testnet is deployed (the top bar shows `● Contracts deployed`), be sure to click through the MetaMask signature live during the on-chain highlight segment,
  showing a real `tx_hash` + Etherscan — far more convincing than a simulated transaction.

---

## 🎬 Visual / Command Reference Table

| Video segment | Web visual | Terminal fallback command |
|---|---|---|
| Opening / positioning | Interface ① home page + architecture diagram | — |
| Highlight ① anti-fraud document review | Interface ①, select `Copper · Shanghai → Hamburg (insurance gap)`, view risk dimensions + data sources | `npm run price` (see risk_factors / doc penalty) |
| Highlight ② tool valuation + RAG | Interface ① cargo valuation card + data sources + pricing waterfall chart | `npm run agent:value` (tool_trace + sources) |
| Highlight ③ war → pause | Interface ② click "⚔ Hormuz Conflict Escalation" / switch to the `Hormuz war crisis` case | `npm run demo:default` (P&L of the three settlements) |
| On-chain + guardrails | Interface ① "⛓ Mint RWA On-Chain" → tx/quote/evidence hash | `npm run scenarios` (fast/balanced/reprice/pause) |
| Close | Full-screen tagline caption | — |

---

## 🔤 Tagline & Subtitle Options

**Main tagline (opening/closing)**
- **The AI prices the risk. The chain enforces it.**

**Special-award positioning line (can be used as a subtitle)**
- **Not a chatbot — an on-chain Security & Risk Agent.**

**Closing line**
- **Ordinary DeFi lets the market guess. AgentBL lets AI price the risk before you buy.**

---

## 🔗 Mapping to Other Docs

| Video content | Doc anchor |
|---|---|
| Our idea / positioning | `README.md` "✨ What is this" + "🎯 Core logic chain" |
| Highlight ① anti-fraud document review | `src/agent/documentConsistency.js` · `docs/background.md` §9.1 Document risk |
| Highlight ② tool calling + RAG | `docs/ai-valuation-tooling.md` · `src/agent/valuationAgent.js` · `src/agent/riskIntel.js` |
| Highlight ③ war → pause | `docs/PRD.md` §2.4 · `data/cases/copper-sg-shanghai-warcrisis.case.json` |
| On-chain records | `README.md` "⛓️ Smart Contracts" · `hardhat/contracts/RiskPricingOracle.sol` |
| Financial rigour (three settlements) | `docs/demo-script.md` "three settlements" climax segment |
