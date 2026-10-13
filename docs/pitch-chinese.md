# AgentBL Pitch Script

> Modelled on the storytelling style of wohainengren and wosilema: open with a pain-point story so people get it within 5 seconds.

---

## 🎯 One-Liner (for the poster board)

**"Your cargo is floating at sea, and your money is 45 days away. Who is watching the risk for you? AgentBL's AI risk-control Agent."**

---

## ⏱️ 30-Second Elevator Version (for judges walking past the booth)

> International trade has a harsh reality: **once the cargo is loaded, the money is locked up for 45 days.**
>
> The exporter pledges the electronic bill of lading, which represents title to the goods, on-chain to issue an RWA, and investors subscribe at a discount. It looks perfect.
>
> But **the real question is who watches the risk**: forged documents, under-insurance, the outbreak of war. None of these are visible to an oracle that only looks at prices.
>
> AgentBL does exactly one thing: **it lets AI price the risk correctly before you place your order.**
>
> It checks documents for fraud, pulls live copper prices and spots the war-premium trap, then writes every decision and its evidence into an on-chain contract.
>
> **AI prices the risk, the chain enforces it.**

---

## ⏱️ 1-Minute Version (pitch / quick demo)

### [0:00-0:15] Pain Point

> Good day, judges. Let's start with a real scenario:
>
> At the Port of Singapore, 500 tonnes of copper cathode are loaded for Shanghai. The invoice value is USD 4.5 million. The exporter urgently needs working capital,
> but under traditional trade finance the money takes **45 days** to arrive.
>
> The global trade finance gap is as large as **USD 2.5 trillion**. The problem is not a lack of money. It is that **risk is hard to read and pricing is opaque**.

### [0:15-0:35] Solution

> AgentBL's solution: **turn the electronic bill of lading into an RWA that AI prices dynamically.**
>
> Exporter pledges the eBL -> AI reviews documents and values the cargo -> risk discount -> investors subscribe at a discount -> on-chain execution.
>
> In three sentences:
> 1. **The AI is not a chatbot. It is underwriting.** It reviews documents, values cargo, scores risk and decides the issue price.
> 2. **The discount is not a guess. It is built on the exporter's verifiable trade margin.** The more urgently they need cash and the higher the risk, the deeper the discount.
> 3. **Every decision is recorded on-chain.** Evidence hashes are written to RiskPricingOracle, auditable and tamper-proof.

### [0:35-0:50] Highlight

> Our strongest move: **when war breaks out, copper prices go up.** A price-only oracle would conclude "the collateral is worth more, so it is safer". **That is exactly backwards.**
>
> AgentBL's AI knows the war premium is a **double-edged sword of correlation**: defaults go up, insurance coverage collapses, recoveries go down. So it does the opposite:
> **a 21% haircut on cargo value, risk pushed to 1410 basis points, and issuance paused outright**, keeping investors clear of the blow-up.
>
> And **when free intelligence is not enough, the AI pays to unlock premium data via the x402 protocol**: HTTP 402 -> on-chain payment -> intelligence unlocked, fully automated.

### [0:50-1:00] Close

> In one sentence: **Ordinary DeFi lets the market guess the price and leaves liquidation to clean up afterwards. AgentBL lets AI turn trade fraud and real-world risk into an explainable, on-chain RWA discount before investors place their orders.**
>
> **AI prices the risk, the chain enforces it.** Thank you.

---

## ⏱️ 3-Minute Version (detailed demo)

### Act 1: Pain Point (0:00-0:40)

> (Show shipping chart / world map)
>
> International trade has a harsh reality: **once the cargo is loaded, the money is locked up for 45 days.** The global trade finance gap is USD 2.5 trillion.
>
> Exporters are not short of collateral. They hold an **electronic bill of lading**, the title document for goods in transit. But traditionally the bank has to review documents, assess route risk
> and check whether insurance covers the cargo. It is all manual, and approving a single financing takes weeks.
>
> And **the off-chain world is full of fraud and risk**: documents may be forged, insurance may fall short, and war may wipe everything out.
>
> (Switch to case data)
>
> Let's take a real case: Singapore -> Shanghai, 500 tonnes of copper cathode, cargo value USD 4.5 million.

### Act 2: AI Pricing (0:40-1:20)

> At the core of AgentBL is an **AI pricing and risk-control Agent**. It does four things:
>
> **① Anti-fraud document review**: it cross-checks the eBL, commercial invoice and insurance policy for the same shipment.
> Do the quantities match? Does the invoice unit price deviate from the market price (over- or under-invoicing)? Is the insurance enough to cover the cargo value? Will the policy expire before arrival?
> **Every red flag is converted into risk basis points that directly push down the issue price.** This is something a price oracle can never do.
>
> **② Evidence-backed valuation**: the AI pulls the live LME copper price, checks the regional premium at the destination port and pulls UN Comtrade historical trade prices for cross-validation.
> When the war premium is high it **proactively applies a conservative volatility haircut**. It never inflates the valuation.
>
> **③ Risk scoring**: five dimensions (war / weather / port / insurance / price volatility), with a data source for every risk.
>
> **④ Discount pricing**: how fast the exporter wants the money + how risky the cargo is -> issue discount.
> FAST payout = issue price $0.80 (investor return +25%), BALANCED = $0.85 (return +17.9%).

### Act 3: War (1:20-2:00)

> (Show the shipment tracking screen / incident button)
>
> Now comes the crucial moment. We simulate an in-transit event: **conflict escalates in the Strait of Hormuz.**
>
> Copper prices are rising, and a price-only oracle would reach a fatal conclusion: "The collateral is worth more, so this loan is safer." **That is exactly backwards.**
>
> AgentBL's AI knows the war premium is a **double-edged sword of correlation**:
> - Importer default probability ↑
> - Insurance is voided by the "war exclusion" clause
> - Liquidation recovery rate ↓
> - **Every protection collapses at once**
>
> So the AI does the opposite: a 21% haircut on verified cargo value, the risk score maxed out at 1410 basis points, and issuance put on **PAUSE**, keeping investors clear of the blow-up.
>
> (Show the three settlements from `npm run demo:default` in the terminal)
>
> And let's be clear: **$1.00 is the target redemption, not a capital guarantee.** The same copper shipment has three outcomes: repayment earns 25%, a mild default returns the principal, and a war tail-default loses 12.8%.
> That $0.20 discount is the premium the AI collects up front for the default tail.

### Act 4: On-Chain + x402 (2:00-2:40)

> The safety loop closes on-chain. **Every pricing decision, together with the hash of the evidence behind it, is written to RiskPricingOracle on Injective Testnet.**
> Auditable, and nobody can alter it.
>
> (Show the x402 Intel Market)
>
> And **when free intelligence is not enough, the AI pays for premium data via the x402 protocol**: HTTP 402 Payment Required ->
> automatic EIP-3009 signature -> on-chain settlement -> intelligence unlocked. Every payment is recorded in PaymentOracle. **The AI pays for intelligence, and the chain keeps the record.**
>
> There is one more safety guardrail: **the LLM only writes the explanation; the final price is validated by a deterministic engine and a schema.** Even if the model misbehaves, it cannot set a bad price.
> 154 tests guard this invariant.

### Act 5: Close (2:40-3:00)

> Finally, back to the fundamental question: **why does RWA pricing require AI?**
>
> Because the money goes to the exporter the moment the offering is Funded, while the cargo is still at sea. Repricing after the fact cannot protect money that has already been committed.
> **That discount is the investor's only risk compensation, paid in advance.** And the one setting that discount is the AI, before investors place their orders.
>
> **Ordinary DeFi lets the market guess the price and leaves liquidation to clean up afterwards. AgentBL lets AI turn trade fraud and real-world risk into an explainable, on-chain RWA discount before investors place their orders.**
>
> **AI prices the risk, the chain enforces it.** Thank you, judges.

---

## 🏷️ Prepared Answers for Judges' Questions

| Question | Key Points |
|------|---------|
| "Why not just use a price oracle?" | A price oracle cannot see **off-chain risk**: forged documents, under-insurance, war exclusion clauses, inconsistent Incoterms. AI document review plus multi-dimensional risk control is something an oracle can never do |
| "Is the $1.00 redemption a capital guarantee?" | **No.** $1.00 is the target redemption price. In a tail default investors may recover only $0.698 (a 12.8% loss). That $0.20 discount is exactly the premium the AI collects up front for default risk |
| "Can AI output directly change contract state?" | Yes. A PricingQuote triggers the contract's Open/Reprice/Pause state transitions via RiskPricingOracle.updatePricing(). The LLM only generates the explanation; the final price is validated by the deterministic engine |
| "How is this different from RugRumble's x402?" | RugRumble also has x402, but AgentBL's paid x402 intelligence **feeds directly into the pricing engine** and changes the RWA issue price, so the price difference before and after payment is quantifiable. We also have an on-chain PaymentOracle recording the full payment evidence plus pricing hash |
| "How do you make sure the AI doesn't misprice?" | Three guardrails: ① the deterministic pricingEngine is the final price setter (not the LLM) ② schema guardrails validate all output ③ 154 automated tests guard the pricing invariants |
| "Why Injective?" | Injective is a DeFi-native L1 with a native order book and low gas. RWA pricing needs high-frequency oracle updates, and Injective's infra is a natural fit |

---

## 🎬 Demo Command Checklist

```bash
# One-click demo (full loop in <1 minute)
npm run demo:once

# Step-by-step demo
npm run dev              # Web Dashboard (judges can interact)
npm run demo:default     # Three settlement outcomes (repay/default/war)
npm run agent:value      # AI valuation tool-call trace
npm run qa               # Judge Q&A rehearsal
npm run smoke:x402       # x402 paid intelligence end to end

# Pre-event verification
npm run preflight        # Full check
```
