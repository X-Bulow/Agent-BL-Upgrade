# AgentBL 5-Minute Investor Pitch Deck Outline

> Version: 2026-07-23
>
> Purpose: 5-minute live pitch / hackathon final / quick go-or-no-go call by angel investors.
>
> Core principle: the deck says only one thing: **before investors subscribe, AgentBL prices the off-chain trade risk behind an electronic bill of lading into an explainable, auditable and enforceable RWA issue discount.**

---

## 0. Key Takeaways for the Presenter

### 0.1 Three sentences investors should remember

1. **Pain point**: Once goods are loaded on board, the exporter waits 30–45 days for cash; real trade has collateral, but lacks risk pricing that is fast and transparent enough.
2. **Product**: The exporter pledges an eBL; AgentBL's AI underwriting agent reads the documents, valuation, shipping and world risk, and before subscription outputs the issue price, financing cap and action; Injective contracts handle execution.
3. **Differentiation**: Ordinary DeFi lets the market guess the price after the fact; AgentBL lets AI price the risk up front, and pins evidence hashes, payment proofs and state transitions on-chain.

### 0.2 Two transaction loops that must never be confused

```text
Loop A: RWA trade finance
eBL / invoice / insurance policy → AI pricing → investors subscribe to RWA → in-transit monitoring → settlement / liquidation

Loop B: x402 paid intelligence
Request report → HTTP 402 → EIP-3009 USDC payment → PaymentOracle binds report hash → report unlocked
```

- The x402 buyer is buying a **risk / valuation / anti-fraud report**, not the RWA; the price is a micro-amount of USDC.
- The RWA buyer takes on **trade risk that has already been priced**; the subscription amount is financing capital.
- A paid report can only add verifiable provenance/evidence; **paying must never change the risk score or the issue price**.

### 0.3 Evidence boundaries for this version of the deck

- Implemented and demoable: deterministic pricing engine, document parsing/consistency checks, risk intelligence and repricing, x402 402→sign→settle→unlock, MCP server, Injective testnet contracts and state machine.
- Demo data boundaries: some market, logistics and world-risk data are offline fixtures / mock fallbacks; the LLM can be configured as Azure OpenAI, and Tencent, DeepSeek, Qwen and a deterministic fallback are also supported.
- Not yet production-ready: real production ENI integration, real logistics/insurance data, KYC/AML and accredited-investor gating, jurisdiction and recourse partnerships.
- Wording rules: use "verified on testnet", "integration-ready" and "production roadmap" for distinct things; never present mocks, adapters or design goals as production partnerships or real money.

---

## 1. Overall Pacing

| Slide | Time | Goal | Takeaway left in the audience's mind |
|---|---:|---|---|
| 1 | 0:00–0:15 | Remember one sentence | AI prices the risk, the chain executes |
| 2 | 0:15–0:45 | Establish the pain point | The 45-day cash-flow gap is a quantifiable problem |
| 3 | 0:45–1:10 | Make the product understandable | How one eBL becomes a financeable RWA |
| 4 | 1:10–1:55 | Show the core AI | Risk is not a text report but a price / cap / action |
| 5 | 1:55–2:45 | Deliver the climax | The same asset can win or lose; the discount is the price of tail risk |
| 6 | 2:45–3:20 | Prove the on-chain loop | AI decisions, payments and evidence can be verified and enforced |
| 7 | 3:20–4:00 | Explain revenue and growth | Reports monetise first, financing volume then scales revenue |
| 8 | 4:00–4:35 | Explain market and moat | Start with permissioned institutional pilots, then expand into a risk-intelligence network |
| 9 | 4:35–4:55 | Give milestones and use of funds | Investors know what validation their money buys |
| 10 | 4:55–5:00 | Close and CTA | Not putting documents on-chain, but pricing risk |

> Principle: demo only one storyline live (Clean copper, Singapore → Shanghai); do not switch between multiple cargoes, Mystery Voyage or complex pages within 5 minutes.

---

## 2. Slide-by-Slide Spec

### Slide 1 | Cover: AI prices the risk, the chain executes

**Time: 0:00–0:15 | 15 seconds**

#### On screen

```text
AgentBL
AI-priced eBL-backed trade finance

AI prices the risk. The chain enforces settlement.
```

Bottom-right corner shows only three tags: `eBL-backed RWA` · `Injective` · `x402 paid intelligence`.

Visual: a shipping route from Singapore to Shanghai; at the end of the route, `$0.80 issue price` and `1.00 target redemption` appear together. Do not use "guaranteed return" or "sure win" visuals.

#### Voiceover

> In international trade, the goods are already on the ship, yet the exporter still waits more than a month for cash. AgentBL uses the electronic bill of lading as collateral, lets AI price the trade risk before investors subscribe, and then has contracts on Injective execute the whole lifecycle.

#### Investor takeaway for this slide

This is **underwriting and settlement infrastructure**, not a chatbot and not a public fundraising page.

#### Operation / design requirements

- The logo, product name and one-line claim take the first glance.
- No team intro, no tech-stack wall, no market size; the first 15 seconds only establish positioning.

---

### Slide 2 | Problem: goods at sea, cash flow locked up

**Time: 0:15–0:45 | 30 seconds**

#### On screen

Left side: a timeline:

```text
Order → Loading / eBL issued → 30–45 days of transit and collection → Arrival / payment
                         ▲
                 Cash-flow gap
```

Right side: only three sets of numbers:

```text
2.5T USD     Global trade finance gap (ADB figure; cite source in the final deck)
30–45 days   Typical in-transit wait for payment
SME exporters   Have real goods, yet often cannot get fast financing
```

Bottom line: `It is not that there are no goods or no money; the risk simply cannot be priced quickly and transparently.`

#### Voiceover

> Take a shipment of copper exported from Singapore to Shanghai. After the goods leave port, the exporter still has to pay for procurement, labour and the next order, but the payment only comes back after arrival. Banks' manual due diligence is slow and their fixed thresholds are high; investors cannot read bills of lading, insurance, routes or importer risk. So the collateral is at sea, but capital cannot flow.

#### Investor takeaway for this slide

AgentBL solves a **financial-infrastructure problem where cash flow and information asymmetry compound each other**, not simply "turning assets into tokens".

#### Evidence / sources

- Background and figure definitions: [`docs/background.md`](./background.md), [`README.md`](../README.md).
- The final deck must state the source and year next to each figure; do not mix `$1.7T` and `$2.5T` across slides.

---

### Slide 3 | Product: one eBL, four steps to a financeable deal

**Time: 0:45–1:10 | 25 seconds**

#### On screen

Four horizontal steps, each kept to no more than 6 words:

```text
1  Upload & verify       eBL / invoice / insurance
          ↓
2  AI underwrite         value + consistency + world risk
          ↓
3  Price & open           issue price / cap / action
          ↓
4  Fund & monitor         subscribe → reprice → settle
```

Bottom-right corner: a deal card:

```text
Cargo: 500 MT copper cathode
Route: Singapore → Shanghai
AI-verified collateral: USD 6.53M (example)
FAST issue price: USD 0.80 / target USD 1.00
```

#### Voiceover

> The exporter uploads the electronic bill of lading, commercial invoice and insurance policy. AgentBL first parses the fields and runs cross-document consistency checks, then calls the valuation, risk and macro-intelligence modules to output a structured PricingQuote: collateral value, financeable cap, issue price, risk level and next action. What investors see is a permissioned trade-finance deal with evidence, a discount and a state machine.

#### Investor takeaway for this slide

The product's value lies in turning "complex off-chain trade documents" into "quotes that investors can compare and contracts can enforce".

#### Demo steps

- Open the Dashboard's `Pricing & Mint` view.
- Select `Clean copper · Singapore → Shanghai`.
- Show only the upload, AI valuation and pricing cards; do not show all navigation on this slide.

---

### Slide 4 | Core capability: the AI does not write reports, it takes underwriting actions

**Time: 1:10–1:55 | 45 seconds**

#### On screen

At the centre, a "pricing waterfall" that subtracts down from `target redemption = 1.00`:

```text
1.00 target redemption
  − payout-speed / urgency discount
  − verified trade-risk discount
  − collateral / price guardrails
  = final issue price
```

Beside it, only three kinds of inputs:

```text
Documents     quantity / value / insurance / duplicate pledge
Market        spot / comparable trades / volatility
World risk    war / port / weather / route / sanctions
```

Far right: the AI output:

```text
price      supply      risk level      action
$0.800     4,125,000   MEDIUM          OPEN_OFFERING
```

Bottom, in small print: `Schema-validated · evidence hash · deterministic fallback`.

#### Voiceover

> The key is not whether the AI can write a nice report, but that it must make a financial decision. It turns the exporter's payout-speed preference, verifiable trade margin, document risk, commodity volatility and route risk into an issue discount, and at the same time decides the issuance size and action: open, warn, reprice, pause or move to liquidation. Model output is validated against schema, bounds and deterministic rules; when the AI is unavailable, the system does not wave things through, it uses a reproducible fallback.

#### Investor takeaway for this slide

AgentBL's AI acts directly on **financing price, financing cap and pool state**, so the AI is the underwriting layer, not UI decoration.

#### Demo steps

- First show the three quote tiers `FAST / BALANCED / LOW_COST`.
- Live, only explain the difference between FAST and BALANCED; avoid explaining every rule.
- In the voiceover, do not say "AI replaces banks in seconds"; say "automates part of standardised underwriting work while keeping permissioning and human governance boundaries".

---

### Slide 5 | Climax: the same deal profits in normal times and loses in the tail

**Time: 1:55–2:45 | 50 seconds**

#### On screen

Three columns of P&L cards; the headings must be large:

| Scenario | Investor outcome | Explanation |
|---|---:|---|
| Repaid | `0.800 → 1.000`, `+25.0%` | Importer pays, redeemed at target |
| Mild default | `0.800 → 1.000`, still recoverable | Goods intact, collateral covers the loss |
| Tail default | `0.800 → 0.698`, `−12.8%` | War premium reverses, insurance dispute, forced sale |

Bottom, emphasised with a red border:

```text
1.00 is a target, not principal protection.
The discount is the AI's up-front price for tail risk.
```

#### Voiceover

> This is AgentBL's most important product logic. At the same 0.80 issue price, investors make 25% under normal settlement; in a mild default, the intact goods may still cover principal; but in a war tail scenario, the insurance is disputed because of the war-exclusion clause, the copper price falls back and the goods are sold under pressure, so only 0.698 is recovered and investors lose 12.8%. So 1.00 is a target redemption, not a guarantee; the AI's job is to fold this kind of tail risk into the price before subscription, not to write an explanation afterwards.

#### Investor takeaway for this slide

This slide answers the two hardest questions:

1. Why would investors buy? Because there is clear collateral, a clear price and a risk buffer.
2. Why is AI necessary? Because without dynamic risk pricing the discount is mismatched: safe deals are overcharged and risky deals cannot compensate for losses.

#### Demo steps

- Run `npm run demo:default`; keep the camera only on the three Investor P&L sections.
- Do not call "25%" an annualised return; it is the single-deal gross upside / target outcome of this example.
- Make clear these are "demo/model results"; do not imply past performance or future returns.

#### Compliance on-screen text

`Hackathon prototype · permissioned investors · no public fundraising · target redemption is not guaranteed`.

---

### Slide 6 | On-chain loop: AI decisions, payments and evidence are all verifiable

**Time: 2:45–3:20 | 35 seconds**

#### On screen

A simplified architecture diagram, at most 4 layers:

```text
Evidence layer       eBL hash · quote hash · paid report hash
        ↓
AI / x402 layer      Pricing Agent · HTTP 402 · EIP-3009 USDC
        ↓
Injective layer      RiskPricingOracle · RWAOfferingPool · RWAToken
        ↓
Lifecycle            Created → Priced → Open → Funded → InTransit
                              → Repriced / Paused → Settled
```

Right side: a clickable testnet evidence bar:

```text
Injective EVM testnet · Chain ID 1439
PaymentAttested → PricingUpdated → Offering state
```

#### Voiceover

> On-chain, the eBL's uniqueness and pledge relationship, the quote and evidence hashes, investor shares, in-transit repricing, pausing and settlement are all recorded. x402 is a separate intelligence business loop: the requester first receives a 402, then signs USDC with EIP-3009, PaymentOracle binds the payment transaction to the report hash, and the report is unlocked only after verification. Payment does not buy a better score; it only buys access and verifiable provenance.

#### Investor takeaway for this slide

The blockchain's role is **proof, enforcement and audit**, not magically eliminating real-world trade risk.

#### Evidence that can be shown

- `docs/evidence/x402-live-smoke.json`: 0.001 USDC testnet payment and `PaymentAttested`.
- `docs/evidence/wave-b-gate.json`: `PaymentAttested → PricingUpdated → RWA offering` trace.
- `docs/evidence/injective-mcp-smoke.json`: official Injective MCP tool calls and testnet transactions.
- Contract tests: `npm --prefix hardhat test` currently `32 passing`.

#### Wording boundaries

- Say "testnet transactions are verifiable"; do not say "mainnet already carries real financing".
- Say "5 core RWA contracts + PaymentOracle component"; do not casually write "only 5 contracts" on different slides or mix up deployment versions.

---

### Slide 7 | Business model: sell intelligence first, then charge on financing volume

**Time: 3:20–4:00 | 40 seconds**

#### On screen

Left side: two revenue curves:

```text
Now: Intelligence API
Risk / valuation / fraud report via x402
Price hypothesis: 0.001–0.002 USDC per machine-call

Scale: Financing protocol
Permissioned RWA issuance fee: 0.1–0.3% (current model assumption)
Enterprise API / monitoring: contract-based pricing
```

Right side: a buyer map:

```text
Exporters    faster liquidity
Banks        faster due diligence
Insurers     route / cargo risk
Investors    priced, auditable opportunities
AI agents    machine-callable evidence
```

Bottom line: `One risk report can be sold many times; every financed shipment creates a higher-value protocol event.`

#### Voiceover

> We do not bet the business model on a single RWA issuance. The first layer is x402 paid intelligence: banks, insurers, investors and other agents buy risk, valuation and anti-fraud reports per call, and machines can call it without registering an account. The second layer is a financing protocol fee, charged on the issuance size of permissioned pools. The third layer is institutional APIs and continuous risk monitoring. This way report revenue validates demand first, and protocol revenue scales once financing volume grows.

#### Investor takeaway for this slide

The product has a lighter "data/intelligence entry point" and then expands into higher-ticket institutional underwriting and financing infrastructure, reducing the commercial friction of launching RWA pools directly.

#### Key figure definitions

- `$0.001–$0.002` is the machine-call price of the current x402 test service, not the final enterprise price.
- `0.1–0.3%` is a model assumption in the current docs, not a signed fee rate.
- Do not promise `90–97% gross margin` unless real LLM, data, compliance, on-chain and sales costs have been included in the calculation.

---

### Slide 8 | Market and moat: start with permissioned pilots, build a risk-intelligence network

**Time: 4:00–4:35 | 35 seconds**

#### On screen

Top half: market wedge

```text
Beachhead
Singapore / Hong Kong / ADGM style corridors
High-value commodity trade · eBL-ready · institution-led
```

Bottom half: four layers of moat, without a pile of technical terms:

```text
1  Data moat       document + route + outcome history
2  Decision moat   pricing rules + evaluated agent + evidence graph
3  Execution moat  Injective state machine + payment/report binding
4  Distribution    banks / insurers / logistics / other agents via MCP & x402
```

Right side: a 3-stage roadmap:

```text
Pilot → Permissioned network → Cross-corridor intelligence standard
```

#### Voiceover

> We will not start with open, public-facing token fundraising; we enter through permissioned institutional pilots in compliant jurisdictions, first serving one trade corridor with high value, clear document structure and high eBL adoption. Every document check, risk decision, shipping outcome and settlement outcome accumulates into better risk intelligence next time. The long-term value is not any single pool, but becoming the trade-risk pricing layer that both institutions and AI agents can call.

#### Investor takeaway for this slide

The real moat is the "**data-outcome feedback loop + auditable decisions + institutional distribution**", not a standalone token contract or any particular LLM.

#### What not to say

- Do not say "replace all banks" or "bypass regulation".
- Do not present ENI, Lixun, TradeLens, Maersk, etc. as signed production partners unless a contract/LOI/API evidence can be shown on the spot.
- Do not state "world's first" as an unverified fact; "we turned ... into a machine-callable product" is enough.

---

### Slide 9 | Roadmap and funding ask: investors are buying the next set of validations

**Time: 4:35–4:55 | 20 seconds**

#### On screen

Left side: roadmap:

```text
Now (Hackathon)
✅ Pricing engine + eBL demo + x402 + MCP
✅ Injective testnet lifecycle & evidence

Next 3 months
□ Real ENI / eBL pilot adaptation
□ Logistics, insurance and commodity data integration
□ KYC/AML + accredited-investor gate

Next 6–12 months
□ 2–3 institutional co-underwriting pilots
□ Regulated permissioned pools
□ Outcome data fed back to form a risk-scoring network
```

Right side: funding card; replace the square brackets on the day:

```text
Raising: [US$___] pre-seed / strategic round
Runway: [__] months
Use of funds:
40% data + compliance + eBL pilot
35% product + agent reliability
25% institutional distribution
Milestones:
[__] pilot shipments · [__] paying data buyers · [__] signed partners
```

#### Voiceover

> This round is not for packaging a demo into a public wealth-management product; it is for hitting three verifiable milestones: real eBL and data-source pilots, institutional compliance and permissioned pools, and settlement outcome data that proves the value of risk prediction. Fill in the raise amount, runway and milestone counts based on team costs and partnerships already under discussion; do not make up numbers on the spot.

#### Investor takeaway for this slide

This is an early-stage investment that "trades capital for regulatory, data and institutional-distribution validation", not paying for liquidity mining.

---

### Slide 10 | Closing: price the risk first, then the money is worth executing

**Time: 4:55–5:00 | 5 seconds**

#### On screen

```text
Ordinary DeFi: the market guesses the price after the fact
AgentBL: AI prices the risk before subscription, Injective executes on-chain

AgentBL
AI prices the risk. The chain enforces settlement.
```

Below: a QR code to Demo / GitHub / Testnet evidence (only one main link, so the audience is not stuck choosing what to scan).

#### Voiceover

> AgentBL does not turn trade documents into speculative tokens; it lets AI, before investors place orders, set real trade risk as a transparent, explainable, on-chain RWA discount. Thank you.

---

## 3. Live Demo Choreography (one-to-one with the deck)

### 3.1 Prepare only one main scenario

```text
Case: CASE-EBL-2026-CU-SG-SHA
Cargo: Copper Cathode, 500 MT
Route: Singapore → Shanghai (Yangshan)
```

Main scenario demo order:

1. Go to Mint / Valuation: show the eBL, invoice, insurance policy and valuation.
2. Show the Pricing Console: FAST `0.80`, BALANCED about `0.848`, LOW_COST about `0.889`.
3. Run the three outcomes: `npm run demo:default`, stop on `+25% / break-even-like recovery / -12.8%`.
4. Go to Voyage / in-transit event: simulate war risk, show the risk score, reprice / pause and evidence hash.
5. Go to Intel Market: show the 402 challenge; if a reliable wallet and network are available, complete a live x402 payment; otherwise use a clearly labelled Demo Mode.
6. Show one pre-prepared testnet transaction in the Injective explorer; do not search multiple addresses on the spot.

### 3.2 Live voiceover number card

| Voiceover number | Meaning | Evidence / source | Definition |
|---:|---|---|---|
| `500 MT` | Example cargo quantity | `data/cases/copper-sg-shanghai.case.json` | Demo fixture |
| `USD 6.531M` | Pricing engine example AI-verified collateral | `npm run price` output | Example, not an audited valuation |
| `0.800` | FAST issue price | `npm run price` / `npm run demo:default` | Example quote |
| `0.848` | BALANCED indicative issue price | `npm run price` | Example quote |
| `1.000` | target redemption | `src/core/pricingEngine.js` / scenarios | Target, not guaranteed |
| `+25.0%` | Single-deal gross upside on normal settlement | `npm run demo:default` | Not annualised, not a promise |
| `0.698 / -12.8%` | Tail liquidation recovery / P&L | `npm run demo:default` | Stress-scenario example |
| `0.001 USDC` | live x402 smoke payment | `docs/evidence/x402-live-smoke.json` | Testnet, self-paid test |
| `1439` | Injective EVM testnet chain ID | `public/chain-config.json` | Testnet |

### 3.3 Fallback plan

```text
Network / wallet unavailable → play the local screen recording directly or run npm run demo:default
LLM unavailable              → explain the deterministic fallback; do not fake "real-time AI"
Live x402 unavailable        → show HTTP 402 + the test evidence JSON, clearly label Demo / Live
Page lag                     → switch to the three pre-captured images: quote / tail loss / explorer
```

Do not claim a transaction succeeded on the spot because of a network failure; a Demo receipt must not be presented as an explorer tx.

---

## 4. Investor Q&A: 15-Second Answer Templates

### Q1: Is this a principal-protected product?

> No. `1.00` is a target redemption, not a guarantee; investors bear importer, cargo, insurance and disposal risk. Our core value is precisely that the AI folds these risks into the issue discount before subscription and records the evidence and actions on-chain. The MVP targets permissioned pools and does no public fundraising.

### Q2: Why not just use a commodity price oracle?

> A price oracle can only tell you what copper costs; it cannot tell you whether a bill of lading has been pledged twice, whether insurance covers the cargo, whether the route is affected by war, or whether the importer will pay. AgentBL combines documents, market, shipping and world risk into an issue price, a financing cap and pause/reprice actions.

### Q3: Who is responsible if the AI gets it wrong?

> The production architecture does not hand responsibility to a black-box model. Output must pass schema, numeric bounds, collateral caps, a compliance gate, source freshness and idempotent execution constraints; high-risk actions can require human/institutional approval. The testnet demo shows automated execution capability; it does not mean real financial liability and legal recourse are in place.

### Q4: Are x402 and the RWA the same money?

> No. x402 is a report access fee on the order of a fraction of a cent; the RWA is investors' subscription capital for already-priced trade-finance shares. The former validates machine commercialisation of AI intelligence; the latter validates the funding loop of trade finance.

### Q5: Do you have real customers and real cargo now?

> The current repository is a reproducible hackathon prototype using anonymised/synthetic cases and testnet funds; technical validation of the protocol and payment flow is complete. Real production needs joint pilots with eBL platforms, logistics, insurance, KYC/AML, custody and licensed institutions, which is exactly the validation the next funding stage is meant to achieve.

### Q6: Why Injective?

> We need a single EVM-compatible network to host the RWA state machine, USDC/x402 payment proofs, the risk oracle and agent-callable interfaces; the Injective testnet, EVM, the official x402 path and the MCP ecosystem let this loop be verified in practice. It is not about swapping an ordinary web page onto another chain.

### Q7: Why are there two versions of your market figure?

> Public reports use different statistical definitions; the product currently standardises on ADB's financing gap of about `$2.5T` as the problem size. The final pitch keeps only one figure and footnotes the source and year. `$1.7T` is used only when the corresponding original source and year are available.

---

## 5. Fact Check and Pre-Demo Checklist

### 5.1 Implementation evidence that can currently be cited

| Capability | Current evidence |
|---|---|
| AI pricing and three payout-speed tiers | `src/core/pricingEngine.js`, `scripts/price.mjs` |
| Document parsing and cross-document consistency | `src/agent/documentParser.js`, `src/agent/documentConsistency.js`, `tests/document*.test.js` |
| World risk and in-transit repricing | `src/agent/worldRiskAgent.js`, `src/core/worldRiskPricing.js`, `public/voyage.js` |
| eBL upload and hash / adapter | `src/app/eniAdapter.js`, `POST /api/ebl/upload` |
| x402 402→settle→unlock | `src/x402/server.js`, `src/x402/client.js`, `src/x402/settlement.js` |
| Paid report hash / PaymentOracle | `src/x402/paidReport.js`, `src/x402/reportEvidence.js`, `hardhat/contracts/PaymentOracle.sol` |
| MCP | `src/mcp/mcpServer.js`, `src/mcp/standalone-server.js`, `docs/evidence/injective-mcp-smoke.json` |
| RWA lifecycle | `hardhat/contracts/RWAOfferingPool.sol`, `hardhat/contracts/RiskPricingOracle.sol`, `hardhat/contracts/EBLRegistry.sol`, `hardhat/contracts/RWAToken.sol` |
| Agent activity and decision log | `src/agent/autonomousAgent.js`, `src/agent/orchestrator.js`, `src/agent/decisionLogger.js`, `/api/agent/activity` |
| Evaluation / security | `src/agent/evaluation/`, `src/agent/security/`, `src/agent/tracing/` |

### 5.2 P0 items that must be done before the pitch

1. **Fix the x402 premium-valuation timeout**: the latest `npm test` run was `372 tests / 371 pass / 1 fail`, failing on the 30-second timeout in `tests/x402Endpoints.test.js`. Do not write "full test suite green" in the deck until repeated reruns pass.
2. **Lock the demo mode**: the current local `.env` is a Live configuration; the official demo must explicitly choose Demo or Live and show the status on the page. Demo must not fake transaction hashes.
3. **Reconcile the deployment evidence version**: `README.md`, `public/chain-config.json` and `docs/evidence/` contain contract addresses/deployment records from different times; the final deck only shows one set of addresses and txs verified by the latest smoke run.
4. **Unify the market figure**: the whole deck uses only one financing-gap definition; `$2.5T` is recommended, with the ADB source and year attached.
5. **Unify the AI provider wording**: the code supports Azure OpenAI, but the current local run may select Tencent/DeepSeek/Qwen; only state "this demo uses Azure" as fact when it really runs in an Azure environment and a trace can be shown. Otherwise say "an Azure-compatible provider is integrated".
6. **Remove unproven partnership wording**: describe ENI, Lixun, logistics and insurance partnerships as "adapter / scenario / pilot target" unless there is a demonstrable API, LOI or contract.
7. **Confirm the team slide information**: the repository materials have no stable team bios that investors can verify. This version deliberately invents nothing; please add names, roles, industry/technical credentials and public contact details.
8. **Complete the funding ask**: settle the amount, instrument (SAFE/equity/strategic partnership), runway, use of funds and 3 quantifiable milestones; do not close with "investment welcome".
9. **Prepare compliance footnotes**: `permissioned / KYC-AML / accredited investors / not a guarantee / hackathon prototype` must appear at least on Slides 5 and 9.
10. **Do a full run-through**: product page → three outcomes → in-transit risk → evidence page, in no more than 4 minutes total, leaving 1 minute for the investment story and Q&A.

### 5.3 Recommended acceptance commands

```bash
npm run check
npm run smoke
npm --prefix hardhat test
npm test
npm run preflight
```

Record the date, mode (Demo/Live), pass count and fail count; the final deck's "Traction / Evidence" slide cites only this record.

---

## 6. Design and Voiceover Guidelines

### 6.1 Visual rules

- Primary colours: dark ink + Injective blue/purple + risk red; normal, warning and liquidation states must be distinguishable at a glance.
- Keep only one headline number per slide; do not turn 9 tools, 5 contracts and 20 metrics into one icon wall.
- Every amount has a unit, and every return has an "example / target / stress scenario" label.
- Label charts directly with `not guaranteed`; do not rely on verbal caveats.
- Show only one main piece of evidence as an explorer link; put the rest on the QR landing page or in the appendix.

### 6.2 Voiceover rules

- Open directly with "goods at sea, cash flow locked up"; do not start with the team or tech stack.
- Describe a real action first, then the term: first say "insufficient insurance coverage triggers a pause", then say RiskPricingOracle.
- Every time "AI" appears, pair it with a verb: parse, verify, value, price, reprice, pause, settle.
- Do not use high-risk or unprovable claims such as "risk-free", "principal-protected", "sure win", "replaces regulation" or "world's first".
- Repeat the same core claim at the end; avoid introducing new feature points.

### 6.3 Order in which judges/investors should see evidence

```text
An understandable problem
→ An operable product
→ An explainable price
→ A stress scenario that can fail
→ Verifiable on-chain evidence
→ An executable commercialisation path
```

---

## 7. One-Page Script (read aloud if you blank on stage)

> AgentBL solves the cash-flow gap in trade finance: after goods are loaded, the exporter waits 30–45 days to get paid. We let the exporter pledge an electronic bill of lading, and the AI reads the bill of lading, invoice, insurance, commodity prices, shipping and world risk, and before investors subscribe outputs the collateral value, financing cap, issue discount and on-chain action. Take 500 tonnes of copper from Singapore to Shanghai: the FAST quote is 0.80 with a target redemption of 1.00; under normal settlement investors may make 25%, but in a war tail liquidation they may recover only 0.698 and lose 12.8%. This is exactly why 1.00 is not a guarantee, and the discount is the AI's price for tail risk. RWA contracts on Injective record the eBL pledge, quote, repricing, pausing and settlement; x402 lets banks, insurers and other agents buy risk reports with micro-amounts of USDC, and PaymentOracle binds the report hash to the payment. We enter through permissioned institutional pilots, with revenue from the intelligence API, protocol fees and institutional monitoring. AgentBL does not turn trade documents into speculative tokens; it makes sure risk is priced first, so the money is worth executing.

