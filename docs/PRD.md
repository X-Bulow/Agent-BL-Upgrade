# AgentBL Agent PRD

Version: v0.2 AI Dynamic Pricing RWA  
Status: Preparation / Mock Harness / Testnet contracts pending integration  
Goal: Within 48 hours, deliver a stable, explainable, demo-ready **AI-priced, eBL-backed RWA trade finance protocol**.

## 1. One-Line Project Description

**AgentBL Agent is an AI dynamically priced RWA trade finance protocol built on electronic bills of lading: the exporter pledges the eBL that represents title to the goods into a contract, and the system issues RWA tokens backed by the value of that cargo. The AI Pricing & Risk Agent dynamically sets the RWA discounted issue price, risk warnings and on-chain risk-control actions based on how fast the exporter wants the funds, cargo valuation, transport risk, weather, war, ports, insurance, the international situation and market prices.**

Shorter pitch:

> AgentBL turns an electronic bill of lading into a dynamically priced RWA financing pool, where AI prices trade risk before investors buy it.

## 2. Core Business Model

### 2.1 Basic Scenario

```text
Real, verifiable cargo value: 1,000,000 USD
Cash the exporter wants up front: about 720,000 - 900,000 USD
Collateral: electronic bill of lading (eBL)
RWA target redemption value at maturity: 1 RWA = 1 USD target redemption value
Investor subscription price: dynamically priced by AI from risk and payout speed, e.g. 0.80 - 0.95 USD
```

Note: `1 RWA = 1 USD` in this PRD is the **target redemption value at maturity**, not an unconditional principal guarantee. Actual redemption depends on importer payment, cargo disposal, insurance coverage and the contract settlement outcome. The demo does not raise real funds and is not offered to public investors.

### 2.2 Why Issue at a Discount

The RWA target redemption value at maturity is fixed at **1.00 USD (target redemption value)**. The faster the exporter wants the money, the lower the issue price at which it must sell the RWA to investors, i.e. the larger the discount it gives investors. The table below is an **example under the reference case (copper SG→Shanghai, see §2.4)**, not a fixed price — the real issue price is computed dynamically by the AI pricing model in §2.4:

| Exporter goal | Example issue price | Investor potential return | Explanation |
|---|---:|---:|---|
| Very fast payout (FAST) | ≈ 0.80 USD / RWA | Up to ≈ 25% gross upside to 1 USD target | Exporter gives up more profit in exchange for speed |
| Balanced (BALANCED) | ≈ 0.85 USD / RWA | Up to ≈ 18% gross upside to 1 USD target | Compromise between speed and financing cost |
| Normal payout (LOW_COST) | ≈ 0.89 USD / RWA | Up to ≈ 12.5% gross upside to 1 USD target | Smaller discount, lower financing cost |
| Elevated risk | AI pushes the price lower or pauses the offering | Return looks higher, but so is the risk | AI explains the risk discount |

> Key principle: the issue price is a **range** of 0.80 ~ 0.90, approaching but never equal to the 1.00 target redemption value. 0.80 is not a hard-coded "fast price"; it means "given the profit and risk of this case, FAST works out to roughly 0.80".

### 2.3 Important Pricing Rules

It cannot simply be stated as "cargo worth 1M, financing 900k, issue 900k tokens, sell each at 0.8", because:

```text
900,000 RWA * 0.80 = 720,000 USD
```

This means the exporter actually receives 720k, not 900k.

The protocol must therefore compute all of the following:

```text
token_supply = target_cash_to_exporter / issue_price
target_redemption_exposure = token_supply * 1 USD
target_redemption_exposure <= AI_verified_collateral_value * redemption_coverage_limit
```

Examples:

| Option | Token supply | Issue price | Cash to exporter | Total target redemption at maturity | Reasonable? |
|---|---:|---:|---:|---:|---|
| Fast-payout discount | 900,000 RWA | 0.80 | 720,000 USD | 900,000 USD | Reasonable, discount traded for speed |
| Slow-payout discount | 900,000 RWA | 0.90 | 810,000 USD | 900,000 USD | Reasonable, somewhat lower financing cost |
| Actually receive 900,000 | 1,000,000 RWA | 0.90 | 900,000 USD | 1,000,000 USD | Requires AI to confirm sufficient collateral coverage |
| Actually receive 900,000 | 1,125,000 RWA | 0.80 | 900,000 USD | 1,125,000 USD | Usually too high for 1M of cargo; should be rejected or reduced |

This is where AI pricing truly adds value: it does not just compute a risk score, it decides **under current risk, how much the exporter can borrow at most, at what discount investors should buy, and whether the contract should pause the offering**.

### 2.4 The Core of AI Pricing: Using Exporter Profit to Set the Discount (a Fair Share)

The issue price cannot be pulled out of thin air, nor can it look only at risk. The core innovation of this protocol is: **the discount (what investors earn) is essentially the exporter's financing cost, and that cost comes out of the exporter's "trade profit".** We express the issue price as "what share of its profit the exporter gives up" — that is the "fair share".

**Step 1: Compute the exporter's verifiable profit P**

```text
gross_profit P = invoice_value - cost_of_goods      # invoice value - cost of goods
```

Example: in the copper case the exporter bought at ~USD 11,000/MT before the Strait of Hormuz war premium (COGS 5,500,000), and the CIF Shanghai invoice price is now USD 13,750/MT (cargo value 6,875,000), so **P = 1,375,000 (20% gross margin)**. The war premium is this cargo's embedded profit.

**Step 2: Payout speed determines "what share of profit to give up" (base share)**

| Payout speed | Profit share given up (base share) | Meaning |
|---|---:|---|
| Very fast FAST | 50% | Sacrifice half the profit for the fastest cash |
| Balanced BALANCED | 33% | Compromise between speed and cost |
| Normal LOW_COST | 20% | Give up only a small share of profit; cheapest financing |

**Step 3: Risk add-on (risk share)**. War, price volatility, port, insurance, documentation and other risks make investors demand more compensation, so an extra slice is added on top of the base share (roughly every 350bps of risk = 10% more profit given up, capped at +30%).

**Step 4: Derive the issue price from the "profit share given up"**

```text
share          = base_share(speed) + risk_share          # fair share
financing_cost = share × P
issue_price    = cash / (cash + financing_cost)          # = cash / (cash + share × P)
```

**Step 5: Two guardrails (considered together)**

```text
Collateral coverage guardrail (AI-5): redemption_exposure ≤ AI_verified_collateral × coverage_limit
                   → equivalent to a price floor issue_price ≥ cash / max_safe_redemption (can only raise the price)
Profit guardrail                    : once share > 85%, financing eats almost all the profit → AI pauses the offering (PAUSE_OFFERING)
```

**Copper reference case, actual run (cash = 3,300,000, P = 1,375,000, risk MEDIUM 350bps → risk share 10%):**

| Speed | Profit share given up | Issue price | Cash to exporter | Financing cost | Share of profit | Investor potential return | Action |
|---|---:|---:|---:|---:|---:|---:|---|
| FAST | 60% | **0.80** | 3,300,000 | 825,000 | 60% | 25.0% | OPEN |
| BALANCED | 43% | **0.85** | 3,300,000 | 591,250 | 43% | 17.9% | OPEN |
| LOW_COST | 30% | **0.89** | 3,300,000 | 412,500 | 30% | 12.5% | OPEN |

In one sentence: **"very fast payout" gives up about 60% of profit (25% investor upside), while "normal payout" gives up only about 30% of profit (12.5% investor upside).** Rising risk pushes the issue price further down, and insufficient collateral coverage raises the price floor or pauses the offering. 1.00 is the target redemption value, not a principal guarantee.

> Implementation: see `src/core/pricingEngine.js` (`priceRwaOffering` / `quoteFromCase` / `compareSpeeds`); the Python reference specification is in `scripts/pricing_model.py`; commands `npm run price` / `npm run demo`.

## 3. Target Users

| User | Need |
|---|---|
| SME exporters | Pledge an eBL and choose a financing option of "faster payout / lower financing cost" |
| Qualified investors / institutional funders | Buy eBL-backed RWA at a discount and see the AI risk pricing, risk sources and target repayment path |
| Trade finance platforms | Use an AI pricing oracle to turn off-chain trade risk into executable RWA pricing and risk-control signals |
| Hackathon judges | See AI actually deciding the RWA price, rather than only providing chat explanations |

## 4. User Pain Points

### Pain Point 1: Exporters need cash-flow speed, but traditional financing is priced slowly

Exporters have real cargo and bills of lading, but bank approval is slow. Different exporters have different preferences on payout speed: some are willing to accept a bigger discount for speed, others are willing to wait longer to reduce financing cost.

### Pain Point 2: Investors do not know whether the discount is fair

An RWA selling at 0.80 looks like a higher return, but it may mean that war, weather, insurance, price, route or documentation risk is high. Investors need to know where the discount comes from.

### Pain Point 3: Traditional DeFi pricing models cannot see real trade risk

Ordinary DeFi only looks at token price and cannot analyse:

- whether the eBL matches the cargo;
- whether the cargo value is inflated;
- whether insurance covers the transport period;
- whether weather, war or port congestion affects delivery;
- whether the international situation affects cargo disposal;
- whether the discount is enough to compensate for the risk.

### Pain Point 4: If AI only explains, it is not enough to be the core innovation

The AI in this project must carry core financial functions: **dynamic pricing, risk-discount explanation, issuance-size constraints, and on-chain risk-action recommendations**.

## 5. Demo Scenario

### 5.1 Basic Financing Scenario

```text
Exporter: Shanghai Metals Export Co.
Importer: Hamburg Industrial GmbH
Cargo: Copper Cathodes
Verifiable cargo value: 1,000,000 USD demo case
Electronic bill of lading: EBL-2026-0001
Financing need: wants to receive 720,000 - 900,000 USD as soon as possible
RWA target redemption value at maturity: 1 USD / RWA
Investors: permissioned investors
```

### 5.2 Exporter Chooses Payout Speed

The exporter chooses on the page (the issue price is computed by the AI pricing model in §2.4; below are the results for the copper reference case):

```text
Fast payout    : AI computes issue price ≈ 0.80, gives up about 60% of profit, higher financing cost, fastest payout
Balanced payout: AI computes issue price ≈ 0.85, gives up about 43% of profit, compromise between speed and financing cost
Low-cost payout: AI computes issue price ≈ 0.89, gives up about 30% of profit, lower financing cost, but subscription may be slower
```

### 5.3 AI Real-Time Risk Factors

The AI Pricing & Risk Agent continuously analyses:

```text
1. Cargo market price changes
2. Weather and natural disasters
3. War / sanctions / geopolitical risk
4. Port congestion / strikes / route deviation
5. Insurance expiry and insurance coverage gaps
6. eBL / invoice / insurance document consistency
7. Importer credit and payment risk mock
8. Historical similar trade cases mock
```

### 5.4 AI Output

AI output is not just natural language but structured pricing:

```text
AI Verified Collateral Value
Max Safe Redemption Exposure
Recommended Token Supply
Base Issue Price
Urgency Discount
Risk Discount
Final Issue Price
Implied Gross Yield
Risk Level
Contract Action
Evidence Hash
Investor-facing Explanation
```

### 5.5 On-Chain Actions

```text
Exporter pledges eBL
→ AI generates pricing quote
→ RWA offering opens at AI issue price
→ Investors subscribe
→ AI monitors risk events
→ RiskPricingOracle updates price / risk action
→ Pool continues, pauses, reprices, freezes, or liquidates
```

## 6. MVP Feature List

### 6.1 Must-Have Features

| ID | Feature | Verification |
|---|---|---|
| M1 | Seed eBL-backed RWA financing case | `npm run check` |
| M2 | AI Pricing Quote schema | `npm run test` |
| M3 | Generate base issue price from payout speed | `npm run scenarios` |
| M4 | Generate risk discount from cargo, transport, war, weather and insurance risk | `npm run scenarios` |
| M5 | Investor page shows RWA discount, target redemption value and risk warnings | `npm run dev` manual verification |
| M6 | Exporter page shows financing amounts under different payout speeds | `npm run dev` manual verification |
| M7 | Mock API: risk, pricing, workflow, scenario | `npm run smoke` |
| M8 | Evidence hash / pricing quote hash can be put on-chain | `npm run test` |

### 6.2 Bonus Features

| ID | Feature | Description |
|---|---|
| O1 | LLM generates investor-readable risk explanations | Structured output must be validated by a schema guardrail |
| O2 | AI Evidence Graph | Shows why the price was pushed from 0.90 down to 0.80 |
| O3 | RAG risk intelligence | Retrieve evidence from team docs, policies, and shipping/geopolitical risk mock data |
| O4 | RiskPricingOracle contract | Write the AI quote hash, price and risk action on-chain |
| O5 | RWAOffering contract | Supports issuance, subscription, pause, repricing and settlement |
| O6 | AI Red Team scenario generator | Automatically generate fraud/extreme-risk scenarios to test pricing |

## 7. Explicitly Out of Scope

The MVP explicitly does not do:

1. Real public fundraising;
2. Public sales to retail investors;
3. An open secondary market;
4. AMM;
5. Unconditional principal or return guarantees;
6. Real KYC / AML;
7. Real cross-border payments;
8. Real production integration of war, weather, AIS or port APIs;
9. Real high-accuracy OCR document review;
10. Real insurance claims;
11. Complex legal arbitration;
12. Mainnet deployment.

Compliance wording boundaries:

```text
1 RWA = 1 USD target redemption value, not guaranteed repayment.
Investor returns come from discounted subscription and trade repayment; no risk-free return is promised.
The demo uses permissioned mock investors and does not raise real funds.
```

## 8. Data Model

### 8.1 TradeCase

```ts
type TradeCase = {
  case_id: string;
  bill_of_lading: BillOfLading;
  insurance: Insurance;
  financing: FinancingRequest;
  trade_economics?: TradeEconomics;
  market: MarketFeed;
  shipment_events: ShipmentEvent[];
  macro_risk_events?: MacroRiskEvent[];
};
```

### 8.2 FinancingRequest

```ts
type FinancingRequest = {
  requested_cash_usd: number;
  payout_speed: 'FAST' | 'BALANCED' | 'LOW_COST';
  target_redemption_value_usd: 1;
  redemption_coverage_limit: number;   // default 0.9, collateral coverage guardrail (AI-5)
  requested_token_supply?: number;
  max_ltv: number;
  currency: 'USDC' | 'USD';
};
```

### 8.2.1 TradeEconomics (exporter profit, input to AI pricing, see §2.4)

```ts
type TradeEconomics = {
  cost_of_goods_usd?: number;          // cost of goods (COGS)
  cost_basis_usd_per_mt?: number;      // or per-unit purchase price (× quantity = COGS)
  cost_basis_usd_per_bbl?: number;
  expected_gross_profit_usd?: number;  // = invoice - COGS (the engine recomputes it from USD values)
  gross_margin_pct?: number;           // fallback gross margin when COGS is missing
  note?: string;
};
```

> The engine always **recomputes** profit and gross margin from `invoice - cost_of_goods`; stored fields are for display only, to avoid mispricing caused by hand-entered wrong values. When the whole `trade_economics` is missing, a 12% gross margin is used as the fallback.

### 8.3 MacroRiskEvent

```ts
type MacroRiskEvent = {
  date: string;
  type:
    | 'war_risk'
    | 'sanction_risk'
    | 'port_congestion'
    | 'severe_weather'
    | 'commodity_volatility'
    | 'fx_volatility'
    | 'buyer_country_risk';
  region: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
};
```

### 8.4 PricingQuote

```ts
type PricingQuote = {
  case_id: string;
  bl_id: string;
  payout_speed: 'FAST' | 'BALANCED' | 'LOW_COST';
  target_redemption_value_usd: 1;

  // collateral (from AI valuation)
  ai_verified_collateral_value_usd: number;
  redemption_coverage_limit: number;
  max_safe_redemption_exposure_usd: number;

  // exporter economics (drives the discount — see §2.4)
  requested_cash_usd: number;
  exporter_cost_of_goods_usd: number;
  exporter_gross_profit_usd: number;
  exporter_gross_margin_pct: number;

  // price decomposition: base - urgency - risk = indicative; floors -> final
  base_issue_price_usd: number;          // patient-money (LOW_COST) anchor
  urgency_discount_bps: number;          // cost of speed
  risk_discount_bps: number;             // cost of risk
  indicative_issue_price_usd: number;    // base - urgency - risk (pre-floor)
  final_issue_price_usd: number;         // after collateral floor / clamp
  binding_constraint: 'EXPORTER_PROFIT' | 'COLLATERAL' | 'PRICE_CLAMP';

  // results
  recommended_token_supply: number;
  target_redemption_exposure_usd: number;
  expected_cash_to_exporter_usd: number;
  financing_cost_usd: number;
  exporter_profit_share_bps: number;     // financing_cost / gross_profit (fair share)
  exporter_net_profit_usd: number;
  implied_gross_yield_bps: number;

  // risk + action + explanation
  risk_level: 'LOW' | 'MEDIUM' | 'WARNING' | 'CRITICAL';
  risk_score_bps: number;                // raw trade risk score (independent of speed)
  pricing_action:
    | 'OPEN_OFFERING'
    | 'OPEN_WITH_WARNING'
    | 'REPRICE_DOWN'
    | 'PAUSE_OFFERING'
    | 'FREEZE_POOL'
    | 'TRIGGER_LIQUIDATION';
  risk_factors: string[];
  investor_explanation: string;
  exporter_explanation: string;
  evidence_hash: string;
};
```

> Schema validator: `assertPricingQuote(quote, caseData?)` in `src/core/pricingSchema.js`, checked by `npm run test` (`tests/pricingEngine.test.js`). It enforces three invariants: `redemption_exposure ≤ max_safe` (collateral guardrail AI-5), `base - urgency - risk = indicative` (the discount decomposition is self-consistent), and `final ≥ indicative` (the floor can only raise the price).

### 8.5 RWAOfferingState

```ts
type RWAOfferingState =
  | 'Created'
  | 'Priced'
  | 'Open'
  | 'Subscribed'
  | 'Funded'
  | 'InTransit'
  | 'Repriced'
  | 'Paused'
  | 'Frozen'
  | 'Repaid'
  | 'Redeemed'
  | 'Liquidation'
  | 'Defaulted'
  | 'Cancelled';
```

## 9. API List

### 9.1 Current / Near-Term Mock API

| Method | Path | Purpose | Verification |
|---|---|---|---|
| GET | `/api/health` | Harness health check | smoke |
| GET | `/api/demo-data` | Returns the seed case | smoke |
| POST | `/api/risk/analyze` | Generates a RiskReport | test / smoke |
| POST | `/api/pricing/quote` | Generates an AI PricingQuote | pricing test |
| POST | `/api/offering/simulate` | Simulates RWA issuance, subscription, repricing and settlement | smoke |
| GET | `/api/scenarios` | Returns the multi-scenario regression summary | smoke |

### 9.2 Agent API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/agent/extract-documents` | Extract eBL, invoice and insurance fields |
| POST | `/api/agent/verify-documents` | Document consistency check |
| POST | `/api/agent/price-rwa` | Price the RWA from speed, cargo and macro risk |
| POST | `/api/agent/generate-investor-brief` | Generate investor risk warnings |
| POST | `/api/agent/generate-evidence-graph` | Generate the evidence graph and hash |

### 9.3 Contract Interfaces

The frozen interfaces, events, permissions and state machine definitions for WEB3-1 to WEB3-4 are in `docs/contracts.md`. This section keeps only the main-flow summary; subsequent JS contract mocks and the Solidity implementation must follow `docs/contracts.md`.

| Contract | Function | Purpose |
|---|---|---|
| EBLRegistry | `mintEBL(metadataHash, holder)` | Register the electronic bill of lading token |
| EBLRegistry | `pledge(eblId, pool)` | Pledge the eBL to the financing pool |
| EBLRegistry | `releasePledge(eblId)` | Release the pledge after settlement or cancellation |
| RWAToken | `mint(poolId, investor, amount)` | Mint RWA tokens to subscribing investors |
| RWAOfferingPool | `createOffering(eblId, tokenSupply, issuePrice, targetRedemptionValue)` | Create the RWA offering pool |
| RWAOfferingPool | `subscribe(poolId, amount)` | Investor subscription |
| RWAOfferingPool | `applyPricingAction(poolId, newIssuePrice, action, evidenceHash, quoteHash)` | Reprice, pause, freeze or liquidate according to the AI pricing action |
| RWAOfferingPool | `pauseOffering(poolId)` | Pause the offering when risk rises |
| RWAOfferingPool | `settle(poolId)` | Settle after the importer pays |
| RiskPricingOracle | `updatePricing(poolId, issuePrice, riskLevel, action, evidenceHash, quoteHash)` | Put AI pricing and risk signals on-chain and emit `PricingUpdated` |

## 10. Page List

### Page 1: Exporter Financing Quote

Purpose: the exporter enters the cargo, eBL and desired payout speed, and sees the financing option proposed by the AI.

Fields:

- eBL ID;
- verified cargo value;
- requested cash;
- payout speed selector;
- recommended token supply;
- issue price;
- expected cash to exporter;
- financing cost;
- AI explanation;
- create offering button.

### Page 2: Investor RWA Offering

Purpose: investors see each RWA's issue price, target redemption value at maturity and the AI risk analysis.

Fields:

- issue price;
- target redemption value;
- implied gross yield;
- risk level;
- token supply;
- subscribed amount;
- AI risk factors;
- weather / war / market / insurance alerts;
- evidence hash;
- subscribe button.

### Page 3: AI Pricing & Risk Console

Purpose: show how the AI turns off-chain risk into a price discount.

Fields:

- base issue price;
- urgency discount;
- risk discount;
- final issue price;
- collateral coverage;
- macro risk events;
- evidence graph;
- pricing action.

### Page 4: Smart Contract Timeline

Purpose: show the RWA's on-chain state from issuance and subscription through risk repricing to settlement.

States:

- Created;
- Priced;
- Open;
- Subscribed;
- Funded;
- InTransit;
- Repriced;
- Paused;
- Frozen;
- Repaid;
- Redeemed;
- Liquidation.

## 11. Acceptance Criteria

### 11.1 Technical Acceptance

1. `npm run check` passes;
2. `npm run test` passes;
3. `npm run smoke` passes;
4. `npm run scenarios` covers fast / balanced / high-risk repricing;
5. the pricing quote schema is stable;
6. after changing risk events, the AI issue price changes;
7. after changing payout speed, the base issue price changes;
8. when risk rises, the offering state moves to `Repriced` / `Paused` / `Frozen`;
9. the frontend can display investor price, return and risk warnings;
10. the contract mock or testnet contracts can receive the pricing evidence hash.

### 11.2 Product Acceptance

1. Judges can understand why the exporter is willing to accept a discount;
2. Judges can understand why investors are willing to subscribe;
3. Judges can understand how the AI decides the RWA price;
4. The investor page does not only show "high returns" but also the sources of risk;
5. It is explicit that `target redemption value` is not a principal guarantee;
6. The demo does not depend on real API keys;
7. Every new feature must be verifiable by the Harness.

## 12. 48-Hour Development Plan

### Hours 0-6: Re-lock the Model

| Time | Task | Owner |
|---|---|---|
| H0-H1 | Confirm the RWA discounted issuance model and compliance wording | PM + Web3 |
| H1-H2 | Freeze the PricingQuote schema | AI + Backend |
| H2-H4 | Add fast / balanced / high-risk pricing scenarios | QA + Backend |
| H4-H6 | Update the frontend page information architecture | Frontend + PM |

### Hours 6-18: Core Pricing Pipeline

| Time | Task | Owner |
|---|---|---|
| H6-H10 | Implement AI pricing mock / deterministic fallback | AI |
| H6-H12 | Implement `/api/pricing/quote` and `/api/offering/simulate` | Backend |
| H10-H14 | Implement the Investor RWA Offering page | Frontend |
| H10-H16 | Design the RWAOfferingPool / RiskPricingOracle contracts | Web3 |
| H16-H18 | Connect quote -> offering -> workflow end to end | Integrator |

### Hours 18-30: Demo-Ready MVP

| Time | Task | Owner |
|---|---|---|
| H18-H22 | Add war, weather, port and insurance mock risk events | AI + Backend |
| H18-H24 | Finish the Exporter Quote and Investor Offering pages | Frontend |
| H22-H26 | Contract mock or minimal Solidity tests | Web3 |
| H26-H30 | Smoke / scenarios / demo script | QA + PM |

### Hours 30-42: Polish

| Time | Task | Owner |
|---|---|---|
| H30-H34 | AI pricing explanation and evidence graph visualisation | AI + Frontend |
| H34-H38 | Pitch and compliance Q&A | PM |
| H38-H42 | 3 full rehearsals | All |

### Hours 42-48: Freeze and Submit

| Time | Task | Owner |
|---|---|---|
| H42-H44 | Fix demo bugs only | All |
| H44-H46 | Record a backup video | PM + Frontend |
| H46-H47 | Final verification matrix | QA |
| H47-H48 | Submit the repo, demo link and contract addresses | Lead |

## 13. Biggest Risks and Fallback Plans

### Risk 1: Challenged as a principal-guaranteed yield product

Fallback plan:

- All copy uses `target redemption value`;
- the investor page shows `not guaranteed`;
- only permissioned mock investors;
- no real fundraising;
- no open secondary market.

### Risk 2: AI pricing looks arbitrary

Fallback plan:

- Split pricing into base price, urgency discount and risk discount;
- every discount must have evidence;
- the final price is validated by a deterministic policy;
- the LLM is only responsible for explanations and risk summaries.

### Risk 3: Contracts not ready in time

Fallback plan:

- Build a JS contract mock first;
- minimal Solidity only does `createOffering`, `subscribe`, `updatePricing`;
- testnet deployment is a bonus item and does not block the main demo.

### Risk 4: Real war/weather/port data cannot be integrated

Fallback plan:

- Use a mock macro risk feed;
- the PRD makes clear that AIS, weather, news, port and sanction feeds can be connected in future;
- the demo emphasises the interface and structure of the AI risk intelligence.

### Risk 5: Frontend information overload

Fallback plan:

- The Exporter page only shows payout speed and financing amount;
- the Investor page only shows price, return and risk;
- only the AI Console page shows the details.
