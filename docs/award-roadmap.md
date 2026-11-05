# AgentBL Agent Award Roadmap and Capability Plan

This document answers one question: if AgentBL is not just preparing a repository but competing for a hackathon prize, which tasks should be added next, what capabilities should the AI get, how far should the contracts go, and how does the Harness keep everyone from drifting off course.

Current main line: **an eBL-backed RWA discounted-issuance protocol with AI dynamic pricing** (see `docs/PRD.md` v0.2). This document is aligned with that model. Earlier versions framed the project as "RiskReport risk control + pool lending"; the core now is **AI deciding the RWA issue discount**.

## 1. Most Competitive Project Positioning

Recommended main narrative:

> AgentBL turns the electronic bill of lading into an RWA discounted-issuance pool dynamically priced by AI: the AI Pricing & Risk Agent converts "exporter payout speed + cargo valuation + shipping/weather/war/insurance/market risk" into an RWA issue discount and writes it to the on-chain RiskPricingOracle, and RWAOfferingPool opens, reprices, pauses or liquidates accordingly.

Do not pitch the project as "yet another RWA financing dApp", and do not pitch it as "AI writes risk reports". What judges want to see:

1. **AI genuinely performs a financial function**: it does not just score or explain; it decides the issue price, issuance size and contract action.
2. **The discount is explainable and auditable**: `final = base − urgency_discount − risk_discount`, with evidence for every discount.
3. **The contract is not decoration**: a PricingQuote changes a real state machine (Open → Repriced → Paused).
4. **The eBL is the core collateral primitive**: a transferable document / document of title, not a vague mention.
5. **Awareness of compliance boundaries**: permissioned, qualified investors, no public offering, `1 RWA = 1 USD` is a target redemption price, not a capital guarantee.

## 2. Tasks That Must Be Added

### P0: Main Award Path

| ID | Task | Deliverable | Verification |
|---|---|---|---|
| P0-1 | Freeze the `TradeCase` / `PricingQuote` / `OfferingState` schemas | `src/core/schema.js` | `npm run check` / `npm run test` |
| P0-2 | Implement the pricing engine: base price (by payout speed) + urgency/risk discount | `src/core/pricingEngine.js` | pricing unit test |
| P0-3 | Implement the collateral coverage guardrail (redemption exposure ≤ safe coverage) | pricing invariant test | `npm run test` |
| P0-4 | Add multi-scenario pricing fixtures (fast / balanced / high-risk reprice) | `data/scenarios/*.json` | `npm run scenarios` |
| P0-5 | Wire up `/api/pricing/quote` and `/api/offering/simulate` | `src/app/server.js` | `npm run smoke` |
| P0-6 | Implement the two Solidity contracts: `RWAOfferingPool` / `RiskPricingOracle` | contracts | `hardhat test` |
| P0-7 | Write PricingQuote `quote_hash` / `evidence_hash` to RiskPricingOracle | contract event + ABI | `hardhat test` |
| P0-8 | Frontend shows "AI discount pricing → on-chain repricing" (Investor RWA Offering page) | timeline + event | manual demo |

### P1: AI Agent Capabilities

| ID | Task | Description | Verification |
|---|---|---|---|
| AI-A | Valuation tool calling (live market data + historical comparable trade prices + local valuation) | Example already in `src/agent/`, see `docs/ai-valuation-tooling.md` | `npm run agent:value` |
| AI-B | Document consistency checker | Field consistency across eBL, commercial invoice, insurance and financing request | fixture test |
| AI-C | Pricing explanation generator | The LLM only generates investor-readable explanations and does not decide the discount figures | schema test |
| AI-D | Pricing policy guardrail | LLM output must conform to the PricingQuote schema; on failure fall back to the deterministic engine | provider fallback test |
| AI-E | RAG evidence retriever | Retrieve pricing evidence from team docs, rules, contract ABIs and macro-risk mocks | retrieval eval |
| AI-F | Judge Q&A assistant | Answer questions on compliance, eBL, the pricing model and the contract state machine | demo rehearsal |

### P2: MCP / Skill

Build a lightweight MCP server, but not just for the sake of "using MCP". The MCP tools should serve the main pricing path:

| Tool | Input | Output | Purpose |
|---|---|---|---|
| `get_trade_case` | `case_id` | TradeCase JSON | Lets the Agent fetch a standard case |
| `verify_document_bundle` | TradeCase | consistency findings | eBL / invoice / insurance consistency |
| `value_cargo` | TradeCase | market valuation + historical comparable trade prices | Valuation foundation (tool calling example already exists) |
| `generate_pricing_quote` | TradeCase + payout_speed | PricingQuote | Unified pricing result |
| `simulate_offering` | PricingQuote | offering state result | Show issuance / repricing / pausing |
| `push_pricing_to_oracle` | PricingQuote | tx hash / mock receipt | Connect to RiskPricingOracle |
| `retrieve_trade_policy` | query | cited snippets | RAG evidence retrieval |

Build only 2 Skills:

1. `agentbl-pricing-analyst`: a fixed output flow of document review → valuation → discount pricing → investor explanation.
2. `agentbl-demo-operator`: runs scenarios, contract transactions and Q&A according to the script during the demo.

### P3: RAG

The value of RAG is not letting the Agent dig through material at random, but letting it cite team rules and industry background when judges ask follow-up questions.

The knowledge base should contain only:

1. `docs/background.md`
2. `docs/PRD.md`
3. `docs/award-roadmap.md`
4. `docs/ai-valuation-tooling.md`
5. Contract ABI / NatSpec
6. Pricing rule notes (base price / urgency / risk discount / coverage limit)
7. Condensed background notes on eBL / MLETR / DCSA / ICC DSI

The RAG evaluation should be small but rigorous:

| Query | Expected |
|---|---|
| Why can an eBL serve as RWA collateral? | Can explain the transferable document / document of title logic |
| Why is the issue price 0.85 and not 0.95? | Can break it down into base / urgency / risk discount |
| Why can AI output trigger contract repricing? | Can point to the PricingQuote schema and RiskPricingOracle |
| How do war / soon-to-expire insurance affect the price? | Can map them to risk_discount and pricing_action |

## 3. The Minimal Two-Contract Set

Focus on "AI discount → on-chain issuance"; do not start with a complex NFT marketplace or AMM.

### 3.1 RiskPricingOracle

Purpose: turn the AI's PricingQuote into an auditable on-chain event.

Minimal function:

```solidity
function updatePricing(
    uint256 poolId,
    uint256 issuePriceE6,        // final issue price, 6-decimal precision (0.85 = 850000)
    uint8   riskLevel,           // 0=LOW 1=MEDIUM 2=WARNING 3=CRITICAL
    uint8   pricingAction,       // 0=OPEN 1=OPEN_WITH_WARNING 2=REPRICE_DOWN 3=PAUSE 4=FREEZE 5=LIQUIDATION
    bytes32 evidenceHash
) external;
```

Must emit:

```solidity
event PricingUpdated(uint256 indexed poolId, uint256 issuePriceE6, uint8 riskLevel, uint8 pricingAction, bytes32 evidenceHash);
```

### 3.2 RWAOfferingPool

Purpose: get the discounted-issuance state machine working end to end.

Minimal states:

```solidity
Created -> Priced -> Open -> Subscribed -> Funded -> InTransit -> Repaid/Redeemed
                      └-> Repriced -> Paused -> Frozen -> Liquidation/Defaulted
```

Minimal functions:

```solidity
function createOffering(uint256 eblId, uint256 tokenSupply, uint256 issuePriceE6, uint256 targetRedemptionE6) external returns (uint256 poolId);
function subscribe(uint256 poolId, uint256 rwaAmount) external;
function reprice(uint256 poolId, uint256 newIssuePriceE6) external;   // triggered by oracle / governance
function pauseOffering(uint256 poolId) external;
function settle(uint256 poolId) external;                            // settle after the importer pays
```

(Optional) `EBLRegistry`: `mintEBL` / `pledge` / `releasePledge` / `holderOf`; `RWAToken`: represents investor subscription shares. These two are bonus points and do not block the main demo.

## 4. Testnet Deployment Recommendations

Do not chase a complex multi-chain setup from the start. Priorities:

1. Local Hardhat: keep contract tests stable.
2. Injective Testnet: deploy `RiskPricingOracle` + `RWAOfferingPool`.
3. The frontend only needs to show the contract address, transaction hash and `PricingUpdated` event (issue price changed from 0.85 to 0.78).

The directory layout can borrow from the common Hardhat + Next.js structure:

```text
packages/hardhat/contracts
packages/hardhat/deploy
packages/hardhat/test
packages/nextjs/contracts
```

But do not copy crowdfunding logic for the business side. AgentBL's core is "eBL title document + AI discounted issuance + RiskPricingOracle", not donations / crowdfunding.

## 5. New Harness Rules

Every new feature must answer:

1. Which scenario does it change?
2. Which schema does it output (RiskReport during the transition / PricingQuote as the target)?
3. Does it change the `issue price` or `pricing_action`?
4. Does it need to write to RiskPricingOracle?
5. What is its failure fallback (deterministic engine / mock provider)?

Current Harness commands:

```bash
npm run check
npm run test
npm run smoke
npm run scenarios
npm run demo
npm run agent:value
```

Recommended PR verification order:

```bash
npm run check
npm run test
npm run smoke
npm run scenarios
```

## 6. Final Demo Structure

3-minute version:

1. 30 seconds: the exporter (a Singapore copper trader) holds an eBL but needs fast money, and pricing is slow and opaque.
2. 40 seconds: the AI calls tools to pull the live LME copper price + historical comparable trade prices, and produces a valuation and PricingQuote (issue price 0.85).
3. 40 seconds: the contract opens at the discount, RiskPricingOracle emits `PricingUpdated`, and investors subscribe.
4. 40 seconds: war escalates in Hormuz + copper prices swing sharply → the AI widens risk_discount, pushes the issue price down to 0.78, and the state moves to Repriced / Paused.
5. 30 seconds: explain the compliance boundary (target redemption, not a capital guarantee) and that real market data / AIS / insurance data can be plugged in later.
6. 10 seconds: close with "AgentBL lets AI price trade risk into an RWA discount before investors buy it."

## 7. Final Trade-offs

If there is only time for three things, the priority order is:

1. PricingQuote schema + pricing engine + stable scenario harness (base / urgency / risk discount + coverage guardrail).
2. Minimal RiskPricingOracle + RWAOfferingPool contracts that can be tested and deployed, with `PricingUpdated` demonstrable.
3. Frontend showing how the AI discount triggers on-chain repricing (0.85 → 0.78).

AI valuation tool calling, MCP, Skill and RAG are bonus items, but they must serve this main path and must not become new unstable entry points.
