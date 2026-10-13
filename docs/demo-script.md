# 🎬 AgentBL · Video Demo Script

> **Purpose**: the "voiceover + visuals" script for recording a 3-4 minute project walkthrough video.
> **Companion commands**: `npm run dev` (web dashboard), `npm run demo:default` (credit-default P&L demo), `npm run price` (pricing fallback).
> **Single through-line**: every sentence lands on *"why this project must have AI"* - matching the "Core Logic Chain" in the README.
> **All numbers are measured outputs of the pricing engine** and can be read out as written.

---

## ⏱️ 30-Second Elevator Pitch (use on its own at the opening or the close)

> In international trade, once the goods are shipped, the money takes more than a month to come back. AgentBL lets exporters pledge an electronic bill of lading; the AI prices real trade risk into the RWA's issuance discount, and investors subscribe at the discount with a target redemption of 1 USD.
> The key point is: **1 USD is a target, not a guarantee - deals can default and investors can lose; that discount is the price the AI puts on default risk**. Ordinary DeFi lets the market guess the price; we let the AI price the risk correctly and write it on-chain before investors place their orders.

---

## 🎥 Full Version (about 3 min 30 s)

### [0:00-0:25] Opening: the pain point + the question that should be asked
**[Visual]** Web home page / project logo
**[Voiceover]**
> Hi everyone, this is AgentBL. First, the pain point: in international trade, once goods are shipped, the exporter waits 30 to 45 days to get paid - they urgently need working capital, while plenty of capital in the market wants "collateralised, short-duration" yield assets. We use an AI Agent to connect the two sides.
> But before the demo, I want to ask, on the judges' behalf, the sharpest question: the RWA is issued at a discount with a target redemption of 1 USD - **so don't investors just buy low, sell high, and always win? What's the point of having AI predict risk?** The next three minutes are a direct answer to that.

### [0:25-1:05] Exporter side: how the AI turns risk into a price
**[Visual]** Select **Clean copper** at the top; show the AI Pricing Console waterfall chart + the Exporter Financing Quote card
**[Voiceover]**
> The exporter pledges the electronic bill of lading, which represents title to copper in transit, into the smart contract. The AI reads the cargo value, the documents and live macro risk, and discounts the exporter's desired "payout speed" and the deal's "risk" step by step from the 1 USD target redemption price: the base anchor, minus the urgency discount, minus the risk discount, giving an issue price of **0.80**.
> Note the economic foundation of this discount - it **equals the exporter's financing cost**, and it only gives up part of their **verifiable gross margin**. The more urgent the request and the higher the risk, the lower the issue price and the higher the investor's potential return.

### [1:05-2:00] Head-on rebuttal: investors can lose - that is the point of the AI ★ climax
**[Visual]** Run `npm run demo:default` in the terminal; the camera stops on each of the three settlement outputs in turn
**[Voiceover]**
> Now to answer the opening question. We take **the same copper cargo** and run it through three different outcomes.
> First, the importer pays normally: investors buy at 0.80 and redeem at 1.00, making **25%**. It really does look like a sure win.
> But in the second - war crashes the copper price, the importer abandons the cargo, and insurance refuses to pay because of the "war exclusion" clause; the pool liquidates the copper and recovers only **0.698**. Investors who came in at 0.80 **lose 12.8%**.
> In the third, the importer merely goes bankrupt but the cargo is intact, and **over-collateralisation makes investors whole on their principal**.
> So the conclusion is clear: **1 USD is a "target", not a guarantee; investors do "not" always win.** And that 0.20 discount is exactly the premium the AI charges up front for "the second, default tail". Without this risk pricing, the discount either fleeces safe exporters or dumps uncompensated losses on investors.

### [2:00-2:40] War: why AI, and not a price oracle
**[Visual]** Switch the web page to the **Hormuz war crisis** case (or click "Simulate in-transit risk"); the risk dimensions turn red and the status changes to **PAUSE**
**[Voiceover]**
> Now look at the AI's most hard-core move. When war breaks out, the copper price actually **rises**. An ordinary price oracle would see copper going up and conclude that "the collateral is worth more, so this loan is safer" - exactly the wrong way round.
> Our AI knows this is a **fragile war premium**: it simultaneously means higher default probability, collapsing insurance and lower recovery - every protection fails at once. So the AI does the opposite: it haircuts the verified cargo value by **21%**, pushes the risk score to **1410 basis points**, and goes straight to **PAUSE**, never letting investors board a ride that is bound to blow up. A price oracle that watches a single price can never do this.

### [2:40-3:05] Key insight: why the price must be right "before subscription"
**[Visual]** Contract timeline Created → … → Funded → InTransit
**[Voiceover]**
> Why must the AI get the price right **before** investors subscribe? Because the money goes to the exporter at the **Funded** moment, while the goods are still at sea. After that, however much the risk escalates or the AI reprices, it **cannot protect investors who have already taken their positions** - the discount is their only, prepaid compensation. That is the entire value of the AI in this chain.

### [3:05-3:30] On-chain + close
**[Visual]** Click "Push to RiskPricingOracle"; show the `PricingUpdated` event + `quote_hash` / `evidence_hash`
**[Voiceover]**
> Finally, every pricing decision, together with the **evidence hash** it relies on, is written to the on-chain RiskPricingOracle - auditable and tamper-proof.
> In one sentence: **ordinary DeFi lets the market guess the price; AgentBL lets the AI turn real-world trade risk into an explainable, on-chain RWA discount before investors place their orders. AI prices, the chain executes.** Thank you.

---

## 🗣️ Recording Tips

- **Read the numbers accurately**: `0.80` / `1.00` / `+25%` / `−12.8%` (recovery `0.698`) / `1410bps` / cargo value `−21%` / `PAUSE`.
- **Pacing**: the "three settlements" at `1:05-2:00` is the climax of the whole video - slow down and land the line "**investors can lose**"; the other sections can go a little faster.
- **Cutting to a 2-minute version**: keep only `[0:00 the opening question]` + `[1:05 three settlements]` + `[3:05 close]`, and skip the middle.
- **Fallback**: if the web page has problems, the whole talk can be delivered with the terminal output of `npm run demo:default` and `npm run price`; no logic is lost.
- **One-line tagline** (opening/closing caption): *The AI prices the deal. The chain enforces it.*

---

## 🔗 Mapping to the Docs

| Video section | README / doc anchor |
|---|---|
| The opening question + three settlements | README "🎯 Core Logic Chain" steps ②-④ |
| How the AI prices (waterfall) | README "🧠 Innovations" + `src/core/pricingEngine.js` |
| War → PAUSE | "Core Logic Chain" step ⑧ evidence table |
| Why pricing before subscription matters | "Core Logic Chain" step ⑥ |
| On-chain | README "⛓️ Smart Contracts" + `RiskPricingOracle` |
