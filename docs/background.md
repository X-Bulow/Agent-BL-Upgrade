# AgentBL Agent Background Primer

> Hackathon catch-up material for teammates without a background in international trade or supply-chain finance.
> The goal is for the team to understand, within 30-60 minutes, why an electronic bill of lading can be the core asset of RWA trade finance, and why the **AI Pricing & Risk Agent** is not decoration but the core engine that actually sets the RWA discount and controls the issuance amount in this project.
> Last updated: 2026-06-06. For the current mainline see `docs/PRD.md` (v0.2 AI Dynamic Pricing RWA) and `docs/tasks.md`. This document is for project design and learning only and does not constitute legal, investment, financing or compliance advice.
>
> ⚠️ The model has been upgraded: earlier versions described the project as "permissioned pool lending + RiskReport risk control". The current mainline is **AI dynamically priced, discounted issuance of eBL-backed RWA**: the AI does not just score risk, it directly decides the RWA's issue discount, the maximum amount the exporter can raise, and whether the contract pauses issuance. This document has been aligned with the new model.

---

## Table of Contents

1. [The Project in One Sentence](#1-the-project-in-one-sentence)
2. [Why International Trade Inherently Needs Financing](#2-why-international-trade-inherently-needs-financing)
3. [The Real Pain Points of SME Exporters](#3-the-real-pain-points-of-sme-exporters)
4. [What a Bill of Lading Is, and Why It Is Central to This Project](#4-what-a-bill-of-lading-is-and-why-it-is-central-to-this-project)
5. [An eBL Is Not a PDF, but a Controllable, Transferable Electronic Title Document](#5-an-ebl-is-not-a-pdf-but-a-controllable-transferable-electronic-title-document)
6. [The Traditional Trade Finance Process and Its Problems](#6-the-traditional-trade-finance-process-and-its-problems)
7. [What AgentBL Does from a Web3 / RWA Perspective](#7-what-agentbl-does-from-a-web3--rwa-perspective)
8. [What the Token Actually Represents, and Where the Returns Come From](#8-what-the-token-actually-represents-and-where-the-returns-come-from)
9. [Where the Risk Comes From: This Is Not Ordinary DeFi Collateralised Lending](#9-where-the-risk-comes-from-this-is-not-ordinary-defi-collateralised-lending)
10. [What the AI Pricing & Risk Agent Should Do](#10-what-the-ai-pricing--risk-agent-should-do)
11. [Smart Contract State Machine and On-Chain Actions](#11-smart-contract-state-machine-and-on-chain-actions)
12. [How to Make the Hackathon Demo Convincing](#12-how-to-make-the-hackathon-demo-convincing)
13. [Compliance Messaging Boundaries](#13-compliance-messaging-boundaries)
14. [A Realistic Path to Product Rollout](#14-a-realistic-path-to-product-rollout)
15. [Questions the Judges May Ask](#15-questions-the-judges-may-ask)
16. [Glossary](#16-glossary)
17. [References](#17-references)

---

## 1. The Project in One Sentence

**AgentBL Agent is an AI dynamically priced RWA trade finance protocol built on electronic bills of lading: the exporter pledges an electronic bill of lading into a smart contract, and the system issues RWA certificates backed by the value of that cargo; the AI Pricing & Risk Agent, based on the exporter's preferred speed of payment, the cargo valuation, and transport / weather / war / port / insurance / geopolitical / market price risks, dynamically sets the RWA's discounted issue price, an explanation of the risk discount, the maximum financeable amount, and the on-chain risk-control action.**

English version:

> AgentBL turns an electronic bill of lading into a dynamically priced RWA financing pool, where AI prices trade risk before investors buy it.

A version better suited to the pitch:

> We turn electronic bills of lading into verifiable RWA collateral, and let an AI agent price the discount, the financing cap and the risk action before investors subscribe.

Breaking the sentence down:

| Keyword | Meaning |
|---|---|
| Electronic bill of lading (eBL) | An electronic trade document representing rights to seaborne cargo; the underlying collateral of the RWA |
| Discounted RWA issuance | Certificates backed by cargo value are sold to investors at an AI-set discount (e.g. 0.80 / 0.90 USD), with a target redemption of 1 USD at maturity |
| AI Pricing & Risk Agent | Turns document, cargo, transport, market, insurance and war/geopolitical information into a structured **PricingQuote** (discount, amount, action) |
| Speed-of-payment preference | The faster the exporter wants the money, the bigger the discount they must give investors; the AI prices the "speed ↔ discount" trade-off explicitly |
| Smart contract | Records the pledge, pricing, issuance, subscription, repricing, pausing, settlement, liquidation and other states |

The essence of the project is not "issuing a bill-of-lading coin", nor just "giving trade a risk score", but:

> **Letting AI price real trade risk into an explainable, on-chain, enforceable RWA discount before investors subscribe.**

Ordinary DeFi only looks at the token price to decide liquidations; AgentBL lets AI decide **at what discount the RWA should be issued**. That is AI genuinely performing a financial function, not acting as a chatbot.

---

## 2. Why International Trade Inherently Needs Financing

The biggest difference between international trade and an ordinary local transaction is:

```text
The goods, buyer, seller, funds, banks, carrier and insurer are usually not in the same place,
and delivery is not completed at the same point in time.
```

A typical export trade scenario:

1. A Chinese exporter receives an order from a European importer.
2. The exporter first buys raw materials, organises production, books shipping space, clears customs and loads the ship.
3. The cargo has left port, but the sea voyage may take 20-45 days.
4. The exporter has already spent money but has not yet received payment from the importer.
5. The importer has not yet received the goods and is unwilling to pay in full in advance.
6. Banks, letters of credit, bills of lading, insurance, factoring, export bill financing and similar mechanisms are brought in to resolve the mismatch in credit and cash flow.

So trade finance does not solve "whether the business is profitable"; it solves:

> **The profit is in future receivables, but production, procurement, logistics and wages must be paid today.**

The Asian Development Bank (ADB) Global Trade Finance Gap Survey shows that the global trade finance gap is still around USD 2.5 trillion. This shows that real trade is not short of orders or goods; what is missing is risk infrastructure that capital providers can quickly understand and take on.

### 2.1 An intuitive timeline

```text
T0 Order received
  The exporter has to prepare goods, produce, procure and book space; cash starts flowing out

T1 Shipped, bill of lading obtained
  The exporter has already performed a big part of the contract, but the money has not come back

T2 At sea
  Vessel delays, port congestion, cargo damage, insurance expiry and commodity price swings can all happen

T3 Arrival / document release / cargo collection
  The importer pays, the rights under the bill of lading transfer, and the cargo is collected

T4 Exporter gets paid
  Only now can the exporter actually replenish its cash flow
```

AgentBL targets the cash-flow gap between T1 and T4.

---

## 3. The Real Pain Points of SME Exporters

SME exporters are not completely unable to do business; they are constrained by cash flow and the credit system.

| Pain point | Plain explanation | Takeaway for the project |
|---|---|---|
| Can't take large orders | The buyer is willing to place a USD 5 million order, but the exporter can only front USD 1 million in cash | Real orders don't automatically become financing capacity |
| Slow turnover | Money only comes back after the importer pays, so orders can't be rolled over | "Rights to goods in transit" need to be monetised early |
| High bank thresholds | Banks look at company size, turnover, credit history and collateral | Even with genuine trade, small firms may be approved slowly or rejected |
| High financing costs | When banks say no, the only option is more expensive money | Transparent risk control can reduce capital providers' uncertainty premium |
| Weak resilience | Delays, FX, commodity prices, insurance and buyer default can all crush cash flow | Risk needs dynamic monitoring, not a one-time check at disbursement |

Don't frame the pain point as:

> Banks won't lend, so SME exporters can't do business at all.

A more accurate framing is:

> **SME exporters already have real trade, real goods and real bills of lading, but traditional banks cannot efficiently turn these trade documents into financeable, trackable, disposable assets.**

This is exactly where AgentBL adds value:

```text
Real trade
→ Electronic bill of lading
→ On-chain pledge certificate
→ AI valuation + discount pricing
→ Permissioned investors subscribe to the RWA at the discount
→ Dynamic repricing / pausing / risk-control actions
```

---

## 4. What a Bill of Lading Is, and Why It Is Central to This Project

A bill of lading, in English **Bill of Lading**, abbreviated **B/L**.

You can think of it as the "super document" of international ocean shipping. It usually performs three functions at once:

| Function | Plain explanation | Significance for AgentBL |
|---|---|---|
| Receipt for goods | The carrier confirms it has received or loaded the goods | Proves the goods really exist and have entered the transport process |
| Evidence of the contract of carriage | A transport arrangement exists between the carrier and the shipper | Proves who is responsible for moving the goods from where to where |
| Document of title / right to take delivery | Whoever controls a negotiable bill of lading can usually claim delivery | Can be pledged, transferred, financed and disposed of |

### 4.1 Why it is not "putting the goods on-chain"

Real copper, coffee beans or machinery can't actually go onto a blockchain.

What can go on-chain is:

> **The electronic trade documents representing the rights related to that cargo.**

So a more accurate description of this project is not:

```text
Putting the goods on-chain
```

but rather:

```text
Mapping the cargo rights and financing interests represented by the electronic bill of lading onto the chain
```

### 4.2 Bills of lading have limits too

To keep things simple for the hackathon, we often say "the bill of lading represents rights to the goods". But in real business, note that:

- not every transport document is a negotiable document of title;
- ocean bills of lading, sea waybills, non-negotiable bills of lading and straight bills of lading may have different legal effects;
- different jurisdictions may have different rules on "possession", "control", "endorsement" and "transfer" of bills of lading;
- real-world rollout needs legal documents, pledge agreements, custody arrangements, and carrier or eBL platform support.

The hackathon MVP can simplify, but the pitch should show that you know these limits:

> **We are not claiming that any PDF can become collateral; we use electronic bills of lading that comply with the law and platform rules as verifiable trade-rights documents.**

---

## 5. An eBL Is Not a PDF, but a Controllable, Transferable Electronic Title Document

An electronic bill of lading, in English **Electronic Bill of Lading**, abbreviated **eBL**.

Its value is not "scanning a paper bill of lading into a PDF", but giving trade documents these capabilities:

- Uniqueness: the same eBL cannot be copied endlessly and pledged repeatedly;
- Control: the system can determine who currently controls the eBL;
- Integrity: key fields and the issuance record cannot be arbitrarily tampered with;
- Traceability: issuance, transfer, pledge and release of pledge are all recorded;
- Interoperability: it can be combined with digital identity, smart contracts, risk-control agents and funding pools;
- Legal recognition: in jurisdictions that support electronic transferable records, the electronic record can perform the functions of the paper document.

### 5.1 The legal trend behind eBLs

Electronic bills of lading are not wishful thinking; they are an important direction in the digitisation of international trade.

| Direction | Background |
|---|---|
| DCSA | Pushing member carriers towards a target of 100% eBL adoption by 2030 |
| UNCITRAL MLETR | Provides a model-law framework for electronic transferable records, covering bills of lading, bills of exchange, promissory notes, warehouse receipts, etc. |
| Singapore ETA | The Electronic Transactions Act was amended in 2021, adopting the MLETR approach |
| UK ETDA 2023 | Allows qualifying electronic trade documents to be possessed, endorsed and transferred |
| TradeTrust and similar infrastructure | Provides technical practice for verifying, transferring and interoperating electronic trade documents across systems |

This gives AgentBL's narrative a real-world foundation:

> **Electronic bills of lading are already part of digital trade infrastructure; we go one step further and connect them to RWA financing, AI risk control and on-chain execution.**

### 5.2 What actually needs to be recorded when an eBL goes on-chain

The chain does not need to store the complete commercial documents. A more sensible approach is to store:

| On-chain field | Purpose |
|---|---|
| eBL ID | Identifies which eBL the financing corresponds to |
| document hash | Proves the document version has not been tampered with |
| issuer / carrier | Proves who issued it |
| owner / pledgee | Records control or the pledge relationship |
| financing amount | Records the financed amount |
| risk status | Records the risk status output by the AI agent |
| evidence hash | Records the hash of the evidence behind the risk judgement |

The full documents, commercial contracts, insurance policies and carrier records can be kept off-chain or in a permissioned system; the chain records only verifiable digests and status.

---

## 6. The Traditional Trade Finance Process and Its Problems

A minimal traditional process:

```text
Exporter ships the goods
→ Carrier issues the bill of lading
→ Exporter submits the bill of lading, invoice, contract, letter of credit, etc. to the bank
→ Bank examines the documents and decides whether to finance
→ Bank disburses funds to the exporter
→ Importer pays to take up the documents
→ Bank recovers the funds
→ Importer collects the goods
```

The traditional model is not without value, but it is not friendly enough to SMEs and new types of capital providers.

| Problem | Explanation |
|---|---|
| Slow process | Cross-border document transfer and manual review take time |
| High thresholds | Banks prefer large clients with strong credit histories and well-prepared paperwork |
| Information black box | Capital providers struggle to know cargo status, price changes and insurance validity in real time |
| Paper risk | Documents can be lost, forged, pledged twice, or be hard to verify |
| Weak dynamic risk control | Risk changes after disbursement can't be turned into enforceable actions in time |

AgentBL's alternative approach:

```text
Traditional: manual bank document review + internal risk control + centralised disbursement

AgentBL:
On-chain pledge of the electronic bill of lading
+ AI Pricing & Risk Agent valuation, discount pricing and dynamic monitoring
+ Permissioned investor pool subscribes to the RWA at the AI discount
+ Smart contracts automatically execute issuance, repricing, pausing, settlement and liquidation
```

---

## 7. What AgentBL Does from a Web3 / RWA Perspective

RWA = **Real World Assets**.

In plain terms:

> Representing real-world assets, cash flows or rights on-chain as tokens / certificates / state machines.

Common RWAs include:

- tokenised government bonds;
- tokenised real-estate income rights;
- gold or commodity certificates;
- receivables financing certificates;
- warehouse-receipt tokens;
- carbon credits;
- the electronic bill of lading financing shares in this project.

### 7.1 AgentBL's core mechanism

```text
Exporter obtains the electronic bill of lading
→ Pledges the eBL into a smart contract / registers it in the eBL Registry
→ AI Pricing & Risk Agent reviews the documents, values the cargo, and assesses transport/insurance/market/war risk
→ AI outputs a PricingQuote: discounted issue price, recommended issuance size, financing cap, risk action
→ Contract creates an RWA offering pool at the AI discount (e.g. 1 RWA issued at 0.85 USD, target redemption 1 USD)
→ Qualified investors subscribe to the RWA at the discount; funds are paid to the exporter
→ The agent keeps monitoring in transit; when risk changes, RiskPricingOracle reprices / pauses / freezes
→ Importer pays → contract settles → investors redeem the RWA at the target redemption price
→ If a major risk event occurs, the contract enters the paused issuance / frozen / liquidation / recovery flow
```

Note two key points:

1. **AI sets the discount; it doesn't score after the fact.** The issue price investors see (0.80 / 0.86 / 0.90...) is the result of the AI converting "speed of payment + risk" into a price.
2. **Discount buys speed.** The faster the exporter wants the money, the lower the AI's issue price (a bigger discount for investors, a higher financing cost for the exporter); to lower financing costs, accept slower payment and a higher issue price.

### 7.2 How it differs from ordinary DeFi collateralised lending

Typical ordinary DeFi logic:

```text
ETH / BTC / stablecoin as collateral
→ Price oracle updates
→ Liquidation when the collateral ratio is too low
```

AgentBL's logic:

```text
Real trade asset
→ Electronic bill of lading
→ Document authenticity, cargo valuation, transport events, insurance coverage, market price, war/geopolitical risk
→ AI Pricing & Risk Agent generates a PricingQuote (discount + amount + action)
→ Smart contract issues the RWA at the discount, and reprices / pauses / liquidates as risk changes
```

Core differences:

| Ordinary DeFi | AgentBL |
|---|---|
| Collateral is mostly on-chain assets | Collateral comes from real trade rights (eBL) |
| Price oracles feed token prices | RiskPricingOracle feeds the AI discount, risk level and contract action |
| Pricing relies on AMMs / market matching | **The issue discount is set by AI based on speed of payment and risk** |
| Liquidation mainly depends on token price | Risk actions come from delays, cargo damage, insurance lapses, war, price swings and default |
| Assets are easy to dispose of automatically | Disposing of bills of lading and cargo requires legal, carrier, insurance and recovery processes |

This is why the project needs an AI agent: it has to turn off-chain risk into an explainable issue discount before investors subscribe.

---

## 8. What the Token Actually Represents, and Where the Returns Come From

This is where judges and investors are most likely to dig in.

### 8.1 The RWA token is not a "vapour coin"

In compliant messaging, AgentBL's RWA certificate should not be described as a publicly traded speculative coin.

A safer positioning is:

> **A discounted RWA redemption certificate backed by the cargo rights under a specific electronic bill of lading.**

It represents:

| Right | Meaning |
|---|---|
| Target redemption right | After the trade proceeds come in, the holder redeems at the target redemption price (1 USD / RWA); **this is not a principal guarantee** |
| Upside from discounted subscription | Investors buy at a 0.80 / 0.90 discount and, if repayment goes smoothly, earn the spread from the discount up to 1 USD |
| Claim on the collateral | If the exporter / importer defaults, holders are paid pro rata from the proceeds of disposing of the bill of lading or cargo |
| On-chain record | Records who subscribed at what discount, which trade it corresponds to, and the current risk and issuance status |

Note: `1 RWA = 1 USD` is the **target redemption value at maturity**, not an unconditional principal guarantee. Actual redemption depends on importer payment, cargo disposal, insurance coverage and liquidation outcomes.

### 8.2 Where the returns come from

Returns do not come from "the token going up by itself", but from:

> **The spread the exporter is willing to give up by issuing the RWA at a discount, in exchange for getting cash flow early and fast.**

An example of discounted issuance (compare PRD §2):

```text
Verifiable cargo value: 1,000,000 USD
Cash the exporter wants as soon as possible: 720,000 USD
AI discounted issue price: 0.80 USD / RWA (the exporter chose FAST payment)
Issuance size: 900,000 RWA
Total target redemption at maturity: 900,000 RWA × 1 USD = 900,000 USD
```

For the exporter:

```text
Issues 900,000 RWA at a 0.80 discount and immediately receives 720,000 USD
Uses the money to buy the next batch of goods, pay suppliers and take new orders
The cost: at maturity, the proceeds must cover 900,000 USD of target redemption; the 180,000 USD difference is the financing cost
```

For the investor:

```text
Subscribes at 0.80 and bears the trade and default risk
If repayment goes smoothly, redeems at the target redemption price of 1 USD, a gross upside of about 25%
But a bigger discount often means the AI has identified higher risk (a speed premium or a risk premium)
```

Key point: **it is the same financing cost, but the old model expressed it as "interest" while the new model expresses it as an "issue discount"**, because it shows up directly in the investor's subscription price and is set dynamically by AI.

### 8.3 Why a discount plus a redemption coverage cap is needed (not a simple LTV)

You can't simply write "cargo worth 1 million, financing of 900k, 900k tokens issued, 0.8 each". Because:

```text
900,000 RWA × 0.80 = 720,000 USD
```

The exporter actually receives only 720k, not 900k. So the protocol must get three things right at the same time:

```text
token_supply       = target_cash_to_exporter / issue_price
target_redemption  = token_supply × 1 USD
target_redemption <= AI_verified_collateral_value × redemption_coverage_limit
```

A conservative valuation is still the foundation (to prevent inflated issuance):

```text
AI Verified Collateral Value = min(
  Declared invoice value,
  Quantity × market price (calibrated against historical prices for comparable trades),
  Insured amount
)  then apply a haircut for market volatility / war premium
```

Example:

```text
Declared invoice value: 1,000,000 USD
Estimated market value: 920,000 USD
Insured amount: 900,000 USD

AI Verified Collateral Value ≈ 900,000 USD (take the minimum, then haircut depending on volatility)

If redemption_coverage_limit = 0.9
Maximum target redemption exposure = 810,000 USD
→ At an issue price of 0.80, at most 810,000 RWA can be issued, and the exporter receives at most 648,000 USD
```

These constraints prevent:

- the exporter overstating the cargo value;
- under-collateralisation after commodity prices fall;
- insurance coverage below the declared cargo value;
- falling disposal value due to cargo damage, delays or the unwinding of a war premium.

This is exactly the real value of AI pricing: **under current risk, it decides the most the exporter can raise, the discount at which investors should buy, and whether the contract should pause issuance.**

### 8.4 Be careful how secondary transfers are described

A reasonable meaning of secondary transfer:

> Restricted transfer of financing shares between qualified investors, within whitelisted addresses, to improve liquidity.

You should not say:

> Bill-of-lading tokens can be traded freely worldwide, anyone can buy them, and they can be speculated on like a meme coin.

A more appropriate phrasing:

```text
Token transfer is permissioned, whitelisted, and limited to eligible investors.
```

---

## 9. Where the Risk Comes From: This Is Not Ordinary DeFi Collateralised Lending

The core risks of eBL-backed RWA are off-chain.

### 9.1 Document risk

| Risk | Example |
|---|---|
| Forged bill of lading | The eBL ID doesn't exist, or the issuer is not trustworthy |
| Inconsistent fields | Quantities on the invoice, bill of lading and insurance policy don't match |
| Double pledging | The same eBL is used to raise financing in several places |
| Unclear rights | The current controller is not the exporter, or it has already been pledged to another capital provider |

### 9.2 Cargo and transport risk

| Risk | Example |
|---|---|
| Delay | ETA slips by 5 days, affecting importer payment and the insurance period |
| Route deviation | The vessel deviates from its normal route |
| Port events | Strikes, congestion, detention, sanctions risk |
| Cargo damage | Severe weather, temperature-control failure, damaged containers |
| Insurance anomalies | Insufficient sum insured, insurance about to expire, risk not within the scope of cover |

### 9.3 Market risk

| Risk | Example |
|---|---|
| Commodity price falls | Copper falls 12% and the collateral cushion thins |
| FX swings | The exporter's cost currency and receipt currency differ |
| Interest-rate changes | The risk compensation investors demand goes up |
| Liquidity discount | When things go wrong, the bill of lading or cargo is hard to dispose of quickly |

### 9.4 Credit and legal risk

| Risk | Example |
|---|---|
| Exporter default | Fails to repay as agreed after financing |
| Importer default | Rejects the goods, delays payment or goes bankrupt |
| Carrier disputes | Disputes over cargo delivery or bill of lading transfer |
| Jurisdictional uncertainty | The eBL, pledge and token rights are uncertain under local law |
| Compliance risk | Raising money from the public, promising returns, unlicensed sale of security tokens |

So AgentBL's risk control is not "looking at one price", but:

```text
Document authenticity
+ Cargo valuation
+ Transport status
+ Insurance coverage
+ Market price
+ Counterparty credit
+ Legal and compliance boundaries
```

---

## 10. What the AI Pricing & Risk Agent Should Do

For the hackathon MVP we don't recommend building many agents. We recommend building just one core agent:

> **AI Pricing & Risk Agent: an eBL cargo valuation + risk pricing agent.**

Its goal is not to "write a paragraph of risk explanation", but to produce a **PricingQuote** that the backend, frontend and contracts can consume directly: at what discount the RWA should be issued under current risk, how much the exporter can raise at most, and whether the contract should open / reprice / pause. Internally it can be split into five capability modules: document review → valuation → cargo health → **discount pricing** → structured PricingQuote output.

### 10.1 Document Verification

Goal: determine whether the trade documents are complete, consistent and credible.

Key fields:

- Shipper / exporter;
- Consignee / importer;
- Carrier;
- Vessel / vessel name;
- Port of Loading;
- Port of Discharge;
- Cargo Description;
- Quantity;
- Issue Date;
- ETA / estimated time of arrival;
- Insurance Coverage / sum insured and period;
- Document Hash;
- eBL Registry Status.

Example output:

```json
{
  "document_status": "CONSISTENT",
  "missing_fields": [],
  "mismatch_fields": [],
  "duplicate_pledge_risk": false
}
```

### 10.2 Valuation and financing cap

Goal: prevent inflated valuation and over-issuance. This step is the foundation of RWA discount pricing.

Through tool calling, the agent pulls and compares:

- the declared invoice value (from the commercial invoice);
- quantity × real-time market price (e.g. LME copper, ICE Brent);
- historical prices for comparable trades (e.g. UN Comtrade import/export unit prices by HS code);
- the sum insured;
- the price-volatility / war-premium range (when prices are high and volatile, apply a haircut).

> This repo already implements a runnable valuation tool-calling example; see `src/agent/` and `docs/ai-valuation-tooling.md`: the AI calls three tools, "real-time copper price / historical comparable trade prices / local valuation", and produces the structure below.

Example output:

```json
{
  "market_value_usd": 6875000,
  "declared_invoice_value_usd": 6875000,
  "insured_value_usd": 7562500,
  "ai_verified_collateral_value_usd": 6600000,
  "valuation_basis": "min(invoice, qty×spot, insured) − war-premium volatility haircut",
  "max_safe_redemption_exposure_usd": 5940000
}
```

### 10.3 Cargo Health

Goal: turn transport events into an understandable health score.

```text
Cargo Health Score = 100
- deductions for transport events
- deductions for delays
- deductions for insurance anomalies
- deductions for market price volatility
- deductions for major compliance or sanctions events
```

Example rules:

| Event | Deduction |
|---|---:|
| Normal voyage | 0 |
| 3-day delay | -5 |
| Severe weather | -10 |
| Route deviation | -12 |
| Port strike | -15 |
| Commodity price falls more than 10% | -15 |
| Partial cargo damage | -30 |
| Insurance lapse | -40 |

### 10.4 Pricing & Risk Action: output the discount and the on-chain action

The agent should not only generate a natural-language report. It must convert "speed + risk" into an issue price and output a structured action that the contract can consume directly.

Discount breakdown (explainable and auditable):

```text
final_issue_price = base_issue_price − urgency_discount − risk_discount
base_issue_price  ← set by the speed-of-payment tier (FAST 0.80 / BALANCED 0.86 / LOW_COST 0.90)
urgency_discount  ← the more urgent the exporter, the bigger the discount
risk_discount     ← the higher the weather / war / port / insurance / price-volatility risk, the bigger the discount
```

Pricing actions:

| Agent output pricing_action | On-chain action |
|---|---|
| OPEN_OFFERING | Open the offering at the final price |
| OPEN_WITH_WARNING | Open, but show a risk warning |
| REPRICE_DOWN | Risk has risen; lower the issue price / reduce the amount |
| PAUSE_OFFERING | Pause subscriptions |
| FREEZE_POOL | Freeze issuance, transfers or redemptions |
| TRIGGER_LIQUIDATION | Enter the liquidation / disposal / recovery flow |

The minimal structured output is the **PricingQuote** from PRD §8.4 (excerpt):

```ts
type PricingQuote = {
  case_id: string;
  ai_verified_collateral_value_usd: number;
  max_safe_redemption_exposure_usd: number;
  recommended_token_supply: number;
  base_issue_price_usd: number;
  urgency_discount_bps: number;
  risk_discount_bps: number;
  final_issue_price_usd: number;
  expected_cash_to_exporter_usd: number;
  implied_gross_yield_bps: number;
  risk_level: 'LOW' | 'MEDIUM' | 'WARNING' | 'CRITICAL';
  pricing_action:
    | 'OPEN_OFFERING' | 'OPEN_WITH_WARNING' | 'REPRICE_DOWN'
    | 'PAUSE_OFFERING' | 'FREEZE_POOL' | 'TRIGGER_LIQUIDATION';
  risk_factors: string[];
  investor_explanation: string;
  evidence_hash: string;
};
```

> Note: the current repo's `riskEngine.js` still outputs the old `RiskReport` (`contract_action`). Upgrading it to `PricingQuote` is the AI-1 / BE-2 work in `tasks.md`; this document describes the target structure.

### 10.5 The agent's key positioning

In the pitch, don't describe the agent as:

> It can chat, summarise and write reports.

Describe it as:

> **Before investors subscribe, it prices off-chain trade risk into an explainable, on-chain RWA discount.**

This is where AI and Web3 meet: the AI is not decoration; it performs the core financial function of "pricing + amount + risk-control action".

---

## 11. Smart Contract State Machine and On-Chain Actions

AgentBL's on-chain logic can first be mocked in JS and later replaced with Solidity contracts (`RWAOfferingPool` + `RiskPricingOracle`, see PRD §9.3).

### 11.1 Happy path

```text
Created
→ Priced      (AI produces a PricingQuote, fixing the issue price and issuance size)
→ Open        (offering opens at the discount; investors can subscribe)
→ Subscribed  (subscriptions reach the target)
→ Funded      (funds are paid to the exporter)
→ InTransit   (in transit; the agent keeps monitoring)
→ Repaid      (the importer pays the exporter, and the exporter repays the pool)
→ Redeemed    (investors redeem the RWA at the target redemption price)
```

Meaning:

| State | Meaning |
|---|---|
| Created | The exporter pledges the eBL and submits the financing request and speed-of-payment preference |
| Priced | The AI Pricing Agent outputs a PricingQuote and writes it to RiskPricingOracle |
| Open | The offering opens at the final issue price; permissioned investors can subscribe |
| Subscribed | Subscriptions reach the target issuance size |
| Funded | Funds are paid to the exporter at the issue discount |
| InTransit | The cargo is in transit; the agent keeps monitoring risk |
| Repaid | The importer pays the exporter; the exporter repays the pool, and the pool receives the proceeds (no L/C, not a bank; we only hold the pledged eBL) |
| Redeemed | Investors redeem at the target redemption price |

### 11.2 Exception paths

```text
Open / InTransit → Repriced → Paused → Frozen → Liquidation / Defaulted
Created / Open   → Cancelled
```

Meaning:

| State | Trigger |
|---|---|
| Repriced | Risk rises; the AI lowers the issue price / reduces the amount (REPRICE_DOWN) |
| Paused | Risk rises; new subscriptions are paused (PAUSE_OFFERING) |
| Frozen | Issuance, transfers or redemptions are frozen (FREEZE_POOL) |
| Liquidation | Disposal of the bill of lading, cargo or insurance, or recovery, is started (TRIGGER_LIQUIDATION) |
| Defaulted | The importer refuses to pay / the exporter commits a material default |
| Cancelled | Not opened or subscriptions not reached; funds returned |

### 11.3 What the contract should record

In the MVP you can start by recording:

- eBL metadata hash;
- pricing quote hash / evidence hash;
- final issue price and target redemption value;
- recommended token supply and subscribed amount;
- risk level and pricing action;
- offering state.

The real contract does not need to be complex from the start. The most important thing at the hackathon is for the judges to see:

```text
The agent produces the discount pricing
→ Writes it to RiskPricingOracle (issue price + risk + action + evidence hash)
→ RWAOfferingPool state moves accordingly: Open / Repriced / Paused / Frozen
→ Investors can see the price, the target redemption price, the risk sources and the evidence hash
```

---

## 12. How to Make the Hackathon Demo Convincing

Recommended demo storyline (aligned with the new data in `data/uploads/`):

```text
1. The exporter (Singapore copper trader Strait Resources) uploads the eBL + commercial invoice
2. Cargo: 500 tonnes of LME Grade A copper cathodes, route Singapore → Shanghai
3. The AI Pricing & Risk Agent calls tools: real-time LME copper price + historical comparable trade prices + valuation
4. The AI produces a PricingQuote: verified collateral, recommended issuance size, issue discount
5. The exporter chooses FAST payment → the AI sets an issue price of 0.85 and opens the RWA offering
6. Investors subscribe at the 0.85 discount; funds are paid to the exporter
7. In transit: war escalates in the Strait of Hormuz, copper prices swing sharply, insurance nears expiry
8. The AI reprices: the risk discount widens, and the issue price drops from 0.85 to 0.78
9. RiskPricingOracle records the new price + evidence hash; RWAOfferingPool enters Repriced / Paused
10. The investor view shows: issue price, target redemption price, implied return, risk sources, evidence hash
```

The judges should see four things:

```text
The AI is not a chatbot
The AI called tools to pull real prices and historical trade prices
The AI turned the risk into a concrete issue discount (0.85 → 0.78)
The blockchain transparently recorded the pricing, the repricing and the evidence hash
```

### 12.1 15-second pitch version

> AgentBL turns an electronic bill of lading into an AI dynamically priced, discounted RWA offering pool: the exporter pledges the eBL, the AI sets the issue discount based on speed of payment and trade risk, and investors see the price, the target redemption price and the risk sources before they subscribe.

### 12.2 30-second pitch version

> The global trade finance gap is still huge, and SME exporters, even with real orders and goods, often can't get fast, transparently priced financing. AgentBL uses the electronic bill of lading as RWA collateral and lets the AI Pricing & Risk Agent call real-time market data and historical trade prices to value the cargo, then converts "speed of payment + war/weather/insurance/price risk" into an explainable RWA issue discount, written to the on-chain RiskPricingOracle. The faster the exporter wants the money and the higher the risk, the bigger the discount. We don't do public crowdfunding; we are AI-priced, permissioned trade finance infrastructure for qualified investors.

### 12.3 Strongest closing line

> **Ordinary DeFi lets the market guess the price; AgentBL lets AI price trade risk into the RWA discount before investors place their orders.**

---

## 13. Compliance Messaging Boundaries

The project is most easily misunderstood as:

```text
Selling a yield-bearing bill-of-lading token to the public
```

That would trigger risks around securities, funds, lending, payments, crowdfunding, illegal fundraising and virtual-asset trading.

### 13.1 Avoid saying

- open global crowdfunding;
- anyone can invest;
- guaranteed principal and returns;
- fixed annual yield;
- low risk, high return;
- bill-of-lading tokens can be freely speculated on;
- no KYC required;
- raising funds from the public in mainland China;
- using smart contracts to bypass regulation;
- real money can come in and invest right away.

### 13.2 Say instead

- a technical demo, with no real fundraising;
- for qualified investors;
- permissioned pool;
- permissioned funding pool;
- the token is a certificate of a financing share;
- restricted transfer between whitelisted addresses;
- KYC / AML / sanctions screening is a prerequisite for real-world rollout;
- partnering with licensed institutions, eBL platforms and trade finance institutions;
- pricing risk, not promising returns;
- institutional-grade RWA trade finance infrastructure in compliant jurisdictions.

### 13.3 Why smart contracts cannot eliminate regulatory risk

The law looks at economic substance, not technical form.

```text
A paper contract promising repayment of principal and interest
≈ may constitute a financing or investment product

A smart contract promising repayment of principal and interest
≈ may still constitute a financing or investment product
```

Raising funds from the general public without a licence and promising investment returns through a token may fall within the scope of illegal fundraising, securities issuance, sale of fund units or virtual-asset regulation.

The safe narrative is not "deregulation", but:

> **Turning real trade finance assets into technical infrastructure that is auditable, explainable and can be connected to compliantly.**

---

## 14. A Realistic Path to Product Rollout

At the hackathon stage we don't need to actually launch a financial business, but we do need to explain the realistic path.

### 14.1 Recommended phases

```text
Phase 0: Hackathon
Mock eBL + mock risk data + JS workflow + clear compliance boundary

Phase 1: Pilot
Small-scale pilots with eBL platforms, trade finance institutions, licensed partners and qualified investors

Phase 2: Permissioned Protocol
Connect a real eBL registry, KYC, AML, risk oracle, custody and legal documents

Phase 3: Network
Connect more carriers, ports, insurers, traders, capital providers and cross-border jurisdictions
```

### 14.2 Which locations suit the narrative better

Based on our materials and public information, a safer narrative order is:

| Region | Strengths | Risks |
|---|---|---|
| Singapore | Strong eBL legal foundation, trade finance and asset tokenisation ecosystem | Still requires licensed partners, KYC/AML and qualified-investor restrictions |
| Hong Kong | Convenient for connecting Chinese exporters with international capital; clear regulatory framework for tokenised securities | Progress on electronic trade document law reform still needs watching |
| ADGM / Abu Dhabi | Friendly frameworks for Web3, digital assets and electronic transferable records | Connecting to East Asian exporter scenarios needs design work |
| UK | The Electronic Trade Documents Act 2023 provides a strong legal foundation | The regulatory cost of launching financial products is not low |
| South Korea | Has an STO / security token path | Will most likely need to go the securities-regulation route, which is heavy early on |

Recommended positioning for the hackathon:

> **Singapore / Hong Kong / ADGM-style permissioned eBL-backed trade finance infrastructure, not an unlicensed public offering of a yield-bearing token.**

---

## 15. Questions the Judges May Ask

### Q1: Why would investors believe this RWA has value?

Because it is not a vapour coin, but a discounted redemption certificate backed by the cargo rights under a specific electronic bill of lading. Underneath are real trade, an electronic bill of lading, the cargo, insurance and repayment arrangements. Investors subscribe at a discount (e.g. 0.85) and, if repayment goes smoothly, redeem at the target redemption price of 1 USD. `1 RWA = 1 USD` is the target redemption price, **not a principal guarantee**. The AI Pricing & Risk Agent reviews document authenticity, the reasonableness of the valuation, and transport and market risk, and uses them to decide what the discount should be.

### Q2: What if the exporter doesn't repay?

The deal enters the Default / Liquidation flow. In a real rollout, funds might be recovered by transferring or disposing of the rights under the bill of lading, insurance claims, cargo disposal and legal recovery. The demo shows the state machine and the risk triggers; it does not claim to have solved every real-world judicial enforcement problem.

### Q3: Where does the data come from?

The demo stage uses mock data. A real rollout could connect to eBL platforms, carriers, ports, insurers, AIS vessel data, IoT devices, commodity price feeds, KYC/AML services and TradeTrust-type infrastructure.

### Q4: Why not use an ordinary DeFi oracle?

An ordinary price oracle can only feed token or commodity prices. It cannot judge whether the bill of lading is genuine, whether insurance covers the cargo, whether the ship is delayed, whether the goods are damaged, whether war affects the route, or whether the importer might refuse to pay, let alone set an issue discount based on all that. AgentBL's RiskPricingOracle feeds the issue price, risk level and contract action calculated by AI after combining multiple off-chain risk sources.

### Q5: Isn't this illegal fundraising?

Our MVP is a technical demo with no real fundraising. By design, the product is not open crowdfunding either, but a permissioned funding pool for qualified investors and regulated institutions; the token is only a financing-share certificate with restricted transfer between whitelisted addresses, and it does not promise guaranteed principal or returns.

### Q6: Why do you need a blockchain?

The blockchain is not there to show off, but to:

- record the eBL pledge and financing status;
- make investor shares and fund flows transparent and auditable;
- turn the agent's risk conclusions into enforceable states;
- record evidence hashes for traceability;
- support whitelisted share transfers and automatic distribution.

### Q7: Why do you need AI?

Because the key risks are off-chain, and these risks ultimately have to become a **number**: the issue discount. The AI agent extracts structured signals from documents, transport events, insurance, real-time market data, historical trade prices and war/geopolitical context, converts "speed of payment + risk" into the RWA issue price (base − urgency discount − risk discount), and explains why the contract should open, reprice, pause or liquidate.

---

## 16. Glossary

### 16.1 International trade

| Term | Quick meaning |
|---|---|
| Exporter | The party that sells and ships the goods |
| Importer | The party that buys and pays for the goods |
| Carrier | The shipping line or transport provider |
| Shipper | The party that arranges the shipment, usually the exporter or its agent |
| Consignee | The party that collects the goods at the destination port |
| Bill of Lading / B/L | Receipt for goods, evidence of the contract of carriage, and document of title for delivery |
| eBL | A bill of lading in electronic form |
| Letter of Credit / L/C | A payment instrument backed by bank credit |
| Incoterms | Rules setting out the costs, risks and insurance responsibilities of buyer and seller |

### 16.2 Trade finance

| Term | Quick meaning |
|---|---|
| Trade Finance | Financing around import and export trade |
| Supply Chain Finance | Financing around the upstream and downstream of a supply chain |
| Collateral | Security provided when borrowing |
| Pledge | Handing a title document to a capital provider as security |
| LTV | Loan-to-value ratio: financed amount / collateral value |
| Default | The borrower doesn't repay or breaches a key obligation |
| Recovery | Recouping losses after something goes wrong |
| Factoring | Raising finance by assigning receivables to a financial institution |
| Documentary Collection | A bank helps collect payment against documents |

### 16.3 Web3 / RWA

| Term | Quick meaning |
|---|---|
| RWA | Real-world assets on-chain: mapping real assets or rights to on-chain certificates |
| Tokenization | Splitting an asset or right into on-chain shares |
| Smart Contract | An on-chain program that executes rules automatically |
| Oracle | Brings off-chain data on-chain |
| DeFi | Decentralised finance: an on-chain financial system that does not rely on traditional banks |
| Liquidity Pool | A pool funded jointly by investors |
| Permissioned Pool | Only whitelisted investors can participate |
| Whitelisted Transfer | Tokens can only move between qualified addresses |
| Evidence Hash | Off-chain evidence is hashed and the hash is recorded on-chain |
| Risk Oracle | Pushes the agent's risk score and action to the contract |

---

## 17. References

### 17.1 Internal project materials

- `Materials/web3_trade_finance_consolidated/web3_trade_finance_consolidated.md`
- 2026-06-02 meeting notes in `Materials/` (file not tracked in this repo; its file name is in Chinese)
- `docs/PRD.md` (current mainline: v0.2 AI Dynamic Pricing RWA)
- `docs/tasks.md` (task breakdown)
- `data/uploads/` (realistic bill of lading + commercial invoice samples: Singapore copper / crude oil)
- `data/demo-case.json` (old RiskReport harness data, being migrated)
- `docs/ai-valuation-tooling.md` (AI valuation and historical trade price tool calling)

### 17.2 International trade and electronic bills of lading

- ADB, Global Trade Finance Gap Survey: <https://www.adb.org/publications/adb-global-trade-finance-gap-survey>
- DCSA, 100% eBL by 2030: <https://dcsa.org/100-percent-ebl>
- DCSA, Electronic Bill of Lading Standard: <https://dcsa.org/standards/bill-of-lading>
- UNCITRAL Model Law on Electronic Transferable Records: <https://uncitral.un.org/en/node/775>
- Singapore IMDA, Electronic Transactions Act: <https://www.imda.gov.sg/regulations-and-licensing-listing/electronic-transactions-act-and-regulations>
- Singapore Electronic Transactions (Amendment) Act 2021: <https://sso.agc.gov.sg/Acts-Supp/5-2021>
- UK Electronic Trade Documents Act 2023: <https://www.legislation.gov.uk/ukpga/2023/38/contents>

### 17.3 RWA, tokenisation and compliance boundaries

- MAS, Project Guardian: <https://www.mas.gov.sg/schemes-and-initiatives/project-guardian>
- MAS, Guide on Tokenisation of Capital Markets Products: <https://www.mas.gov.sg/regulation/guidelines/guide-on-tokenisation-of-cmps>
- Hong Kong SFC, Circular on intermediaries engaging in tokenised securities-related activities: <https://apps.sfc.hk/edistributionWeb/api/circular/list-content?refNo=23EC52&lang=EN>
- Chinese Government Portal (gov.cn), Regulations on Preventing and Disposing of Illegal Fundraising: <https://app.www.gov.cn/govdata/gov/202102/10/468255/article.html>

---

## Appendix: The Minimal Mental Model of This Project

```text
Electronic bill of lading = an electronic trade document representing rights to the cargo

RWA = an on-chain certificate backed by those cargo rights, issued at a discount, with a target redemption of 1 USD

Trade finance = the exporter pledges the bill of lading + issues the RWA at a discount to get cash flow early

AI Pricing & Risk Agent = converts "speed of payment + off-chain risk" into the RWA issue discount and the contract action

Smart contract = records pricing, issuance, subscription, repricing, pausing, settlement and liquidation
```

What the judges should ultimately remember:

> **AgentBL does not turn trade documents into speculative tokens; it lets AI, before investors subscribe, price the real trade risk behind an electronic bill of lading into a transparent, explainable, on-chain RWA discount.**
