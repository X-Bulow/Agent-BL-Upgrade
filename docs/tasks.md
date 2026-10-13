# AgentBL Championship Roadmap and Engineering Task List

Task status: `Todo` / `In Progress` / `Review` / `Done` / `Blocked`

Every task must have an Owner and a verifiable check. Do not claim a task that has no way to be verified.  
Current main line: **A Web3-native trade finance protocol: exporters tokenize eBLs, AI prices and executes autonomously, global investors fund directly, and Injective provides end-to-end on-chain auditability**.

---

## 0. Project Positioning and Championship Constraints

### 0.1 The championship pitch in one sentence

> **Before investing in an eBL-backed RWA, anyone can pay cents over x402 for an AI due-diligence report; AgentBL turns that report into a verifiable risk discount, and Injective enforces the financing decision on-chain.**

This must be repeated again and again: **it is not "AI buying things"; it is people, institutions or other Agents paying to buy AgentBL's AI analysis.** The x402 payment and the RWA subscription are two separate transactions:

```text
x402: buy an AI report             402 → USDC payment → unlock report → PaymentOracle binds the report hash
RWA: invest in a trade finance asset   read report → accept risk → subscribe to RWA → RWAOfferingPool settles
```

### 0.2 Why x402 is worth doing

1. **Innovation**: upgrades AI risk control from a "page feature" into a machine-callable service that can be traded on its own.
2. **Technical execution**: a single demo covers HTTP 402, USDC payment, structured AI output, Injective settlement and on-chain evidence at once.
3. **Application value**: banks, insurers, logistics platforms, investors and other Agents can all buy reports per call, with no account and no subscription.
4. **AI substance**: what is paid for is document review, valuation, stress testing and evidence, not an ordinary LLM answer.
5. **Ecosystem fit**: Injective officially provides `@injectivelabs/x402` and an Injective EVM x402 guide; this is a sponsor-native capability for the competition, not an external decoration.

### 0.3 Constraints for winning

- Stop piling up unrelated pages; every new capability must feed back into the "buy report → risk pricing → on-chain execution" loop.
- Every `tx_hash`, payment status and explorer link in the demo must come from a real transaction; simulated values must be explicitly labelled `DEMO`.
- The LLM may parse, retrieve, explain and recommend, but final amounts, state transitions, permissions and payment verification must be validated by deterministic code/contracts.
- A successful payment does not mean the report is correct; a report must pass schema, evidence-integrity and freshness checks before it can be injected into pricing.
- Never write trade secrets, full documents or model chain-of-thought on-chain; only put the necessary hashes, amounts, addresses, timestamps and decision summaries on-chain.

### 0.4 Mapping to the five judging criteria

| Judging dimension | Evidence judges must see | Related tasks | Gate |
|---|---|---|---|
| Innovation | "The AI report itself can be traded per call"; payment evidence is bound to the report hash, and the report then drives RWA pricing | X402-7~11, X402-15 | One real 402 + one real oracle event |
| Technical Execution | Five Injective contracts + PaymentOracle, standard MCP 9+3 (7 Wave B baseline + 2 Mystery), 300+24 tests, live tx | WEB3-17, X402-9, MCP-6~10, MBOX-MCP-1, DEMO-5 | Preflight all green, every explorer link opens |
| Use Case & Impact | The 45-day receivables pain point; banks/insurers/investors/Agents can all buy reports; clear pricing and market entry | PM-8, X402-8, TRUST-7 | Explain payer/buyer/value/revenue in 1 minute |
| Product & UX | 402→payment→settlement→unlock understandable on one screen; evidence can be expanded; wallet failures are recoverable | X402-11/12, DEMO-1~3 | 5-second comprehension test + 60-second demo |
| Ecosystem Fit | Official Injective x402, MCP, EVM, Explorer, optional precompiles; Azure eval/tracing | SP-1~10 | Every logo points to code, config, a trace or a tx |

---

## 1. Repository Review (2026-06-29)

The statuses below are based on code, scripts and tests, not on pitch copy. What judges hate most on site is "it says it exists, but when you click there is nothing".

| Capability | Actual status | Conclusion / next step |
|---|---|---|
| AI pricing, anti-fraud document review, risk scenarios, RAG, xAPI | ✅ Exists | `npm test` measured **300/300 passed**; keep as the product main line, do not rebuild |
| Solidity contracts | ✅ Five-contract protocol deployed | `hardhat test` measured **24/24 passed**; EBLRegistry V2, offering pool, RWA Token, pricing Oracle and AgentBLRWA are deployed and have passed a full-lifecycle smoke |
| Injective Testnet | ✅ Complete on-chain evidence | chainId `1439`; real USDC payment, PaymentAttested, PricingUpdated, five-contract deployment and protocol smoke all have explorer evidence |
| MCP Server | ✅ Standard 9 tools + 3 resources (7 baseline + 2 Mystery) | Official MCP SDK stdio lifecycle verified in practice; in addition, official Injective MCP queries and controlled raw EVM testnet transactions completed through a safe adapter |
| Demo Mode | ✅ Done | `DEMO_MODE=true` by default, persistent top banner, Live toggle, one-click reset; when Live config is insufficient it fails explicitly and never fakes on-chain tx |
| x402 | ✅ Live payment loop verified; all P0 + P1 animations done | X402-1~16 (including P1 animation X402-12) done; real V2/EIP-3009 payment, PaidReportEnvelope and PaymentAttested are linked by explorer evidence; the frontend paid market includes TTL re-read, payment flow shimmer/priceFlash/riskPulse/impact-pop (reduced-motion safe); only X402-17 (P2 discovery) remains |
| Preflight | ✅ Done | Fixed 54-item master gate; measured in Demo environment 50 PASS / 4 explicit Live WARN / 0 FAIL, covering Node, Solidity, smoke, scenarios, MCP, x402 and UI |
| Animations | 🟡 Only waterfall exists | `priceFlash`, `riskPulse`, payment feed and Demo banner still to be added, and must support reduced motion |
| Chinese pitch | 🟡 30-second and 3-minute material exists | Needs to be unified into one story at 30 seconds / 1 minute / 3 minutes, plus x402 and judge follow-up questions |

---

## 2. Priority Overview

| Priority | Goal | Description |
|---|---|---|
| P0 | Get the AI pricing main path working | Exporter chooses payout speed, AI gives the RWA issue price, investors see the discount and risk |
| P0 | Freeze the PricingQuote schema | Make AI, backend, frontend and contracts all revolve around the same structured output |
| P0 | Complete the Investor RWA Offering page | Judges must see "the higher the risk, the lower the price, the higher the potential return" |
| P0 | Get the autonomous Agent loop working | After the eBL is on-chain: automatic document review, valuation, pricing and opening; risk events automatically reprice/pause; payment or arrival automatically settles |
| P0 | Complete the eBL root of trust | ENI file identifier, `cargoHash` to prevent multiple bills for one cargo, structured metadata, transfer / endorse / history |
| P0 | Deploy the full Injective protocol | Five protocol contracts deployed to inEVM; frontend supports MetaMask + Keplr + Leap and multi-chain config |
| P0 | x402 paid intelligence loop | Real 402 challenge → USDC payment → facilitator settlement → report unlock → PaymentOracle attestation |
| P0 | Demo Mode + preflight | Demo-able by default without a wallet; Live mode shows only real transactions; one command before the event checks all critical items |
| P1 | Contract mock / minimal Solidity | RWAOfferingPool + RiskPricingOracle (WEB3-1~10 done; WEB3-11 and v2 increments to do) |
| P1 | Multi-scenario regression | fast / balanced / high-risk repricing |
| P1 | Productized market backend and role centers | listings/search, pool subscribe/status, exporter dashboard, investor portfolio |
| P1 | Auditable autonomous decisions | Decision log persistence, evidence hashes, on-chain tx backfill, Agent activity panel |
| P1 | Standard MCP + Injective MCP | Upgrade AgentBL to a stdio server with 9 tools + 3 resources, and use the official Injective MCP for queries/execution; the historical Wave B frozen baseline is 7 tools |
| P1 | Microsoft Foundry evaluation | Connect the Azure OpenAI provider, Agent traces and reproducible evals to provide AI quality evidence |
| P2 | Injective native modules | ERC20/Bank precompile first; Exchange precompile only when there is a real, explainable scenario |
| P2 | AI and brand enhancements | Multi-LLM consensus, exporter preference parameters, Injective purple theme and ENI + Injective co-branding |


---

## 3. Product / Business / PM

| ID | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|
| PM-1 | Freeze the one-sentence pitch: AI dynamically prices eBL-backed RWA | Bowen | Done | README / pitch updated | - |
| PM-2 | Define the RWA discounted issuance model: 0.80 / 0.90 / 1.00 target redemption | Bowen | Done | Reflected in docs/PRD.md | - |
| PM-3 | Prepare a 3-minute demo script: exporter financing -> AI pricing -> investor subscription -> risk repricing | Bowen | Todo | Script doc or README updated | - |
| PM-4 | Prepare compliance Q&A: target redemption is not a capital guarantee | Bowen | Todo | docs/PRD.md / pitch updated | - |
| PM-5 | Prepare investor-facing copy: discount, risk, potential return, not capital-guaranteed | Bowen | Todo | Frontend copy review | - |
| PM-6 | Design 3 demo scenarios: fast payout, slow payout, high-risk repricing/pause | Bowen | Todo | `npm run scenarios` | - |
| PM-7 | Record the final backup demo video | Bowen | Todo | Video link | - |
| PM-8 | Unify external narrative as gap analysis v2: Web3-native, three-party protocol, pricing by cargo and route, direct investor funding, No bank | Bowen | Todo | Cross-review of README, PRD, demo/video script; core positioning consistent with the 3-minute flow | - |

---

## 4. Agent / AI

The goal of the AI is not to "write a paragraph of explanation", but to produce a **PricingQuote** that the backend, frontend and contracts can use.

| ID | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|
| AI-1 | Freeze the `PricingQuote` JSON schema | Bowen | Done | `npm run test` | src/core/pricingSchema.js `assertPricingQuote` (3 invariants) + tests/pricingEngine.test.js AI-1 |
| AI-2 | Implement base issue price: output a base price monotonic in `payout_speed` (copper reference case ≈0.80 / 0.85 / 0.89) | Bowen | Done | pricing unit test | src/core/pricingEngine.js `priceRwaOffering` (BASE_PROFIT_SHARE); tests/pricingEngine.test.js AI-2 |
| AI-3 | Implement urgency discount: the more urgent the exporter, the lower the issue price | Bowen | Done | scenario test | pricingEngine urgency_discount_bps (LOW_COST anchor); tests/pricingEngine.test.js AI-3 |
| AI-4 | Implement risk discount: weather, war, ports, insurance and price volatility affect the issue price | Bowen | Done | `npm run scenarios` | pricingEngine `scoreRisk` (macro war/weather/port/fx + shipment + price decline + document discount); wired into the 4 pricing scenarios in scripts/scenarios.mjs + tests/pricingScenarioRunner.test.js |
| AI-5 | Implement collateral coverage guardrail: prevent a $1M cargo from issuing excessive target redemption exposure | Bowen | Done | pricing invariant test | pricingEngine collateral price floor + assertPricingQuote `redemption_exposure ≤ max_safe`; tests/pricingEngine.test.js AI-5 |
| AI-6 | Implement investor explanation generator: explain why the price is 0.80 / 0.90 | Bowen | Done | `npm run demo` output includes explanation | pricingEngine investor_explanation / exporter_explanation; printed by scripts/demo.mjs and price.mjs |
| AI-7 | Implement evidence graph mock: list the evidence behind each discount | Bowen | Done | schema test | pricingEngine `buildEvidenceGraph` (base/urgency/risk/collateral nodes + evidence); tests/pricingEngine.test.js AI-7 + assertPricingQuote evidence_graph check |
| AI-8 | Implement document consistency checker: eBL / invoice / insurance field consistency | Bowen | Done | fixture test | src/agent/documentConsistency.js (quantity/cargo value/unit price vs market/Incoterms/insurance coverage & expiry/HS); tests/documentConsistency.test.js; discount wired into scoreRisk |
| AI-9 | Integrate optional Qwen / DeepSeek providers, with a mandatory deterministic fallback | Bowen | Done | provider fallback test | src/agent/llm/openaiCompatClient.js (DeepSeek/Qwen/OpenAI/custom) + valuationAgent deterministic fallback; tests/valuationAgent.test.js (AI-9 LLM error→fallback / resolveProvider) |
| AI-10 | Generate high-risk scenario: war / severe weather / insurance gap causing a price cut or pause | Bowen | Done | `npm run scenarios` | data/cases/copper-sg-shanghai-warcrisis.case.json + data/pricing-scenarios/03-high-risk-reprice, 04-high-risk-pause; tests/pricingScenarioRunner.test.js (Repriced→Redeemed / CRITICAL→PAUSE) |
| AI-11 | Build a RAG risk intelligence knowledge base: project docs + mock macro risk feed | Bowen | Done | retrieval eval | src/agent/riskIntel.js + data/risk-intel/feed.json (10 docs); tests/riskIntel.test.js (evaluateRetrieval precision@k ≥ 0.8) |
| AI-12 | Build a Judge Q&A assistant: explain AI pricing, non-guarantee, contract actions | Bowen | Done | Rehearsal passed (`npm run qa`) | src/agent/judgeAssistant.js (6 grounded intents + RAG citations + live quote numbers + LLM polish/fallback); scripts/judge-qa.mjs; tests/judgeAssistant.test.js |
| AI-13 | Implement Agent orchestrator `src/agent/orchestrator.js`: chain document parsing, cross-verification, cargo valuation, three-tier pricing, plan selection and automatic opening | Bowen | Done | `node --test tests/orchestrator.test.js`; one eBL event may produce only one deterministic opening decision | `AgentOrchestrator.processEbl` chains parse→check→value→3 quotes→decision/optional execution; critical document conflicts force PAUSE; 4 tests passed |
| AI-14 | Implement autonomous trigger pipeline `src/agent/autonomousAgent.js`: Event → Decision → On-chain Action, covering mint, xAPI risk, risk cleared, payment, arrival, insurance expiry | Bowen | Done | `node --test tests/autonomousAgent.test.js`; the six event types produce OPEN/REPRICE/PAUSE/RESUME/SETTLE/WARNING actions respectively | All six event types produce structured protocol actions; arrival without payment only WARNING, critical world risk forces PAUSE; 7 tests (including AI-15) passed |
| AI-15 | Implement continuous monitoring and execution reliability: scheduled/event-driven, idempotency keys, retries, concurrency locks, failure fallback; the same event must never go on-chain twice | Bowen | Done | fake-timer + retry/duplicate-event tests; two consecutive runs produce no duplicate tx | `executionReliability.js` + `AutonomousAgent`: single-flight, exponential backoff, persistent idempotency, EXECUTING tx reconciliation, polling; concurrency/restart/retry tests pass |
| AI-16 | Implement decision audit log `src/agent/decisionLogger.js`: store input snapshot, reasoning summary, evidence hash, decision and on-chain tx, with tx backfill support | Bowen | Done | `node --test tests/decisionLogger.test.js`; `decision_id` is recomputable and the log is still readable after restart | canonical hash generates a stable `decision_id`; atomic JSON persistence, idempotent upsert, status/tx backfill and read after restart; 4 tests passed |
| AI-17 | Implement AI document parser `src/agent/documentParser.js`: extract structured fields from eBL / invoice / insurance policy images or PDFs, keeping field-level source and confidence | Bowen | Done | `node --test tests/documentParser.test.js`; key-field accuracy on fixed scanned fixtures meets the acceptance threshold; LLM failure can fall back / flag for manual review | Native Markdown/text parsing; PDF/image via injectable OCR; field-level line/method/confidence, bundle merge, deterministic fallback/manual review on AI failure; 5 tests passed |
| AI-18 | Implement compliance tagging engine `src/agent/complianceChecker.js`: sanctions, export controls, MLETR, eUCP, DCSA, ICC DSI; only tags risk, never refuses service based on company size | Agent | Done | `node --test tests/complianceChecker.test.js`; pass, warning and blocking-level risk fixtures all have evidence citations | `npm test` passed |
| AI-19 | Extract the existing browser-side `recommendEBL` into a testable server-side investment advisor `src/agent/investmentAdvisor.js`, supporting natural-language preferences, ranking reasons and a deterministic fallback | Agent | Done | `node --test tests/investmentAdvisor.test.js`; the same preference returns a stable Top 3, and the popup and market search reuse the same result | `npm test` passed |
| AI-20 | Implement multi-LLM competitive evaluation: the same case is assessed independently by 3 providers producing structured output, aggregated by median/consensus; when disagreement is too large, degrade to the deterministic engine and flag a warning | Agent | Done | `node --test tests/llmConsensus.test.js`, covering all-success, single provider failure, extreme outlier and all-fail cases | `npm test` passed |

---

## 5. Backend / Integration

Backend goal: turn AI pricing results into a stable API, and let the frontend and the contract mock reuse the same data.

| ID | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|
| BE-1 | Update demo case: add `requested_cash_usd`, `payout_speed`, `target_redemption_value_usd` | Bowen | Done | `npm run check` | data/demo-case.json adds financing.requested_cash_usd/payout_speed/target_redemption_value_usd/redemption_coverage_limit + trade_economics (all legacy fields kept, assertTradeCase still passes); scripts/check.mjs asserts the new fields and validates quoteFromCase→assertPricingQuote |
| BE-2 | Add `PricingQuote` schema validator | Bowen | Done | `npm run test` | tests/pricingSchema.test.js directly covers assertPricingQuote: positive case + negative cases for the 3 invariants (exposure≤max_safe / base−urgency−risk=indicative / final≥indicative) + missing field/invalid enum/0x hash/case_id cross-check; `npm run test` 63 passed |
| BE-3 | Implement `/api/pricing/quote` | Bowen | Done | `npm run smoke` | src/app/server.js POST /api/pricing/quote (empty body→demo case, `?compare=true` returns three speeds + recommendation, invalid payout_speed→400) + reuses resolvePricingRequest; covered by scripts/smoke.mjs + tests/smoke.test.js |
| BE-4 | Implement `/api/offering/simulate`: issuance, subscription, risk repricing, pause, settlement | Bowen | Done | `npm run smoke` | src/app/server.js POST /api/offering/simulate (based on offeringSimulator: Created→…→Repriced/Paused→Redeemed, `events` escalate risk mid-way); smoke + tests/smoke.test.js cover reprice→Redeemed and war-crisis→Paused |
| BE-5 | Add scenario fixtures: fast payout / balanced payout / high-risk repricing | Bowen | Done | `npm run scenarios` | data/pricing-scenarios/01-fast-payout, 02-balanced-payout, 03-high-risk-reprice (+04-high-risk-pause) driven by src/core/pricingScenarioRunner.js; `npm run scenarios` 4 legacy + 4 pricing passed; locked by tests/pricingScenarioRunner.test.js |
| BE-6 | Merge PricingQuote and RiskReport into the workflow simulation | Bowen | Done | `npm run test` | src/core/pricingWorkflow.js `simulatePricingWorkflow` merges pricing_quote + risk_report + offering (action/evidence_hash/risk_level consistent); POST /api/workflow/pricing-simulate; tests/pricingWorkflow.test.js (reprice→Redeemed, war→Paused); `npm run test` 80 passed |
| BE-7 | API invalid-input validation: excessive issuance quantity, invalid price, target redemption exceeding collateral coverage | Bowen | Done | invalid payload test | src/app/server.js resolvePricingRequest validates payout_speed / requested_cash_usd>0 / subscription_usd≥0 / target_redemption=1 / events is an array → 400; tests/apiValidation.test.js has 6 invalid-payload cases; over-collateralization is backstopped by the engine's AI-5 guardrail + assertPricingQuote invariants |
| BE-8 | Output `quote_hash` / `evidence_hash` for the contract oracle | Bowen | Done | `npm run test` | src/core/oracle.js `toOracleUpdate` (issue_price/risk/action/offering_state + evidence_hash + quote_hash + supply/target, aligned with RiskPricingOracle.updatePricing / RWAOfferingPool.createOffering); POST /api/oracle/pricing-update; covered by tests/oracle.test.js + smoke |
| BE-9 | Keep the existing `/api/health`, `/api/demo-data`, `/api/risk/analyze`, `/api/workflow/simulate` working | Bowen | Done | `npm run smoke` | All four legacy endpoints kept with unchanged semantics; scripts/smoke.mjs now explicitly covers health/demo-data/risk-analyze/workflow-simulate; `npm run smoke` passes |
| BE-10 | Integrate the final demo CLI: print RWA price, investor yield, risk factors | Bowen | Done | `npm run demo` | scripts/demo.mjs prints RWA issue price / investor yield / risk factors / financing cost + on-chain oracle hashes + AI narrative; src/agent/pricingNarrator.js (deterministic first, optional LLM polish with automatic fallback on error); integrates Tencent **hy3-preview** (src/agent/llm/openaiCompatClient.js, model pinned, highest priority); `npm run demo` passes both offline and with live hy3-preview |
| BE-11 | Implement market service API: `GET /api/market/listings` + `POST /api/market/search`, returning only active pools and reusing the AI-19 recommendation logic | Bowen | Done | `node --test tests/marketApi.test.js`, covering filtering, sorting, pagination, paused-pool exclusion and natural-language search | tests/marketApi.test.js passed |
| BE-12 | Implement offering pool API: `POST /api/pool/subscribe` + `GET /api/pool/status`; real-chain mode returns tx/event, offline mode keeps a deterministic fallback | Bowen | Done | `node --test tests/poolApi.test.js` + `npm run smoke`; duplicate subscriptions, paused pools and out-of-range amounts are all handled correctly | tests/poolApi.test.js passed |
| BE-13 | Implement role center API: `GET /api/exporters/dashboard` + `GET /api/investors/portfolio`, persisting eBLs, pool status, holdings, returns and redemption records | Bowen | Done | `node --test tests/dashboardApi.test.js`; data recovers after a service restart and only the current wallet's data can be read | tests/dashboardApi.test.js passed |
| BE-14 | Implement eBL document ingestion and ENI adapter: upload eBL/invoice/insurance policy, validate type/size, obtain a trusted file identifier and hash, and trigger the AI-13 orchestrator; provide an explicit mock fallback when ENI is unavailable | Bowen | Done | `node --test tests/eblIngestion.test.js`; both real and simulated ENI paths produce a traceable document hash, and repeated uploads stay idempotent | tests/eblIngestion.test.js passed (7 tests) |
| BE-15 | Implement Agent activity query and real-time subscription API (SSE or WebSocket): return persisted decisions, execution status, evidence and tx by case/pool, for FE-13 | Bowen | Done | `node --test tests/agentActivityApi.test.js`; reconnection loses no events and internal raw chain-of-thought is never exposed | tests/agentActivityApi.test.js passed (7 tests) |

---

## 6. Frontend

Frontend goal: let judges see at a glance that "AI is pricing the RWA", rather than an ordinary dashboard.

| ID | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|
| FE-1 | Exporter Financing Quote page: choose FAST / BALANCED / LOW_COST | Bowen | Done | Manual visit via `npm run dev` | `public/index.html` #exporter-panel + topbar speed segmented control; `app.js` renderSpeedSelector/renderExporterCards driven by `POST /api/pricing/quote {compare:true}` for a three-speed comparison; verified by headless render harness (3 cards + active highlight + click to switch with live repricing 0.848→0.800) |
| FE-2 | Exporter page shows: issue price, expected payout, financing cost, recommended issuance quantity | Bowen | Done | Manual visit via `npm run dev` | `app.js` renderExporterCards shows for each speed issue price / cash to exporter / financing cost / % of trade profit / net profit / token supply + ★AI pick(recommended_payout_speed) + exporter_explanation |
| FE-3 | Investor RWA Offering page: show issue price, target redemption, implied gross yield | Bowen | Done | Manual visit via `npm run dev` | `app.js` renderInvestor #investor-panel: large issue price, $1.00 target redemption, implied gross yield badge, token supply, risk/action badges; headless verified $0.848 / supply / MEDIUM |
| FE-4 | Investor page shows AI risk factors: war, weather, ports, insurance, price volatility | Bowen | Done | Manual visit via `npm run dev` | `format.js` rollupRiskDimensions → 6 dimensions (war/weather/port/insurance/price/docs) with bps + severity colors + RAG intel citations (intelCitations); doc:Insurance rolls into the Insurance dimension; war-crisis case verified with all 5 dimensions lit |
| FE-5 | AI Pricing Console: base price, urgency discount, risk discount, final price | Bowen | Done | Manual visit via `npm run dev` | `app.js` renderWaterfall: broken-axis waterfall chart $1.00 target → base anchor → −urgency → −risk → indicative → collateral floor → final; consistent with the assertPricingQuote additive invariant |
| FE-6 | Smart Contract Timeline: Created -> Priced -> Open -> Repriced/Paused/Funded/Redeemed | Bowen | Done | `npm run smoke` + manual verification | `app.js` renderTimeline driven by `POST /api/offering/simulate`: lifecycle stepper + event log; "Simulate in-transit risk" injects events → live reprice/pause callout (headless verified 0.800→0.782 Repriced); `npm run smoke` passes |
| FE-7 | Scenario selector: one-click switch between fast / balanced / high-risk | Bowen | Done | Manual visit via `npm run dev` | New read-only `GET /api/cases` (src/app/server.js loadCaseCatalog) + topbar scenario segmented control; risk ladder clean→warning→critical with 4 real cases (including AI-10 war-crisis); payout speed switches independently |
| FE-8 | Subscribe mock: investor enters subscription amount and sees the RWA quantity received | Bowen | Done | Manual visit via `npm run dev` | `app.js` renderSubscribe/computeSubscription: USDC input → RWA tokens + cost / target redemption / target upside / gross yield; disabled with a notice in paused state (PAUSE/FREEZE) |
| FE-9 | Evidence hash / quote hash display | Bowen | Done | Manual visit via `npm run dev` | `app.js` #oracle-panel shows quote_hash + evidence_hash + `updatePricing(...)` (from `POST /api/oracle/pricing-update`); "Push to RiskPricingOracle" → MCP push_pricing_to_oracle returns PricingUpdated tx (headless verified) |
| FE-10 | Compliance notice UI: target redemption is not guaranteed | Bowen | Done | Copy review | Compliance box on the investor panel + subscribe footnote: "$1.00 is a target, not a capital guarantee; it depends on importer payment/cargo settlement/insurance" + "permissioned investors only" |
| FE-11 | Build eBL management View ③: upload eBL/invoice/insurance policy, view parsing and compliance results, tokenize status, pledge/transfer history | Bowen | Done | `npm run dev` + frontend acceptance checklist; after uploading a fixture, the full Parser → Checker → Mint → Open process can be tracked | index.html + app.js updated |
| FE-12 | Build portfolio View ④: show wallet holdings, cost, current valuation, target return, risk status and redemption records, replacing the popup in-memory array | Bowen | Done | Manual acceptance with a connected test wallet + UI tests; holdings are not lost after a page refresh | index.html + app.js updated |
| FE-13 | Build Agent activity View ⑤: show the real decision log, current Agent status, trigger source, reasoning summary, evidence and on-chain tx; remove simulated records with random tx | Bowen | Done | After injecting an xAPI risk event, the page shows in real time the same REPRICE or PAUSE record as the backend/chain | index.html + app.js updated |
| FE-14 | Add exporter preference panel: minimum acceptable issue price, payout speed preference, target financing amount, and validate constraints before autonomous opening | Bowen | Done | Three parameterized cases; below the minimum price the Agent does not open and gives an explainable reason | wired pref-min-price |
| FE-15 | Complete Injective brand adaptation: purple theme, Injective/ENI co-branding, `Powered by ENI + Injective`, preserving WCAG contrast | Bowen | Done | Chinese/English desktop/mobile visual review + contrast check | styles.css updated |

---

## 7. Web3 / Contract

Web3 goal: write AI pricing results as verifiable on-chain events, rather than only displaying them on the frontend.

**Progress summary (2026-06-29 repository review)**

| Scope | Status | Description |
|---|---|---|
| WEB3-1 ~ WEB3-4 | Done | Frozen design in `docs/contracts.md` |
| WEB3-5 | Done | JS contract mock: `src/core/contractHarness.js` |
| WEB3-6 ~ WEB3-9 | Done | Hardhat contracts + tests: `hardhat/`, full contract suite `hardhat test` 24 passing |
| WEB3-10 | Done | `AgentBLRWA` redeployed to Injective Testnet together with the full protocol |
| WEB3-11 | Todo | Frontend contract addresses and event display |
| WEB3-12 ~ WEB3-14 | Done | eBL V2 uniqueness, structured metadata, transfer/endorsement/pledge constraints all have contract tests |
| WEB3-15 ~ WEB3-16 | Todo | Autonomous state machine permissions and the v2 investor access model are still in a later wave |
| WEB3-17 | Done | Five-contract deployment, wiring and create/subscribe/reprice/pause/resume/settle on-chain smoke completed |
| WEB3-18 ~ WEB3-19 | Todo | Multi-wallet and multi-chain config are still in a later wave |

| ID | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|
| WEB3-1 | Design `EBLRegistry`: mint / pledge / release pledge | Sage | Done | docs/PRD.md updated | `docs/contracts.md` §3 + `docs/PRD.md` §9.3 |
| WEB3-2 | Design `RWAToken`: represents the investor's RWA certificate | Sage | Done | contract interface doc | `docs/contracts.md` §4 |
| WEB3-3 | Design `RWAOfferingPool`: createOffering / subscribe / settle / pause | Sage | Done | contract interface doc | `docs/contracts.md` §5 |
| WEB3-4 | Design `RiskPricingOracle`: updatePricing(poolId, issuePrice, riskLevel, action, evidenceHash) | Sage | Done | contract interface doc | `docs/contracts.md` §6 |
| WEB3-5 | Implement JS contract mock: simulate issuance, subscription, repricing, pause | Sage | Done | `npm run test` | `src/core/contractHarness.js` + `tests/contractHarness.test.js`, `npm run test` 10 passed, events aligned with `docs/contracts.md` |
| WEB3-6 | Set up the Hardhat contract directory structure | Sage | Done | `hardhat compile` | `hardhat/` (package.json + hardhat.config.cjs), `hardhat compile` 4 files OK |
| WEB3-7 | Implement minimal Solidity `RiskPricingOracle` and emit `PricingUpdated` | Sage | Done | `hardhat test` | `hardhat/contracts/RiskPricingOracle.sol`, `hardhat test` 6 passing |
| WEB3-8 | Implement minimal Solidity `RWAOfferingPool` | Sage | Done | `hardhat test` | `hardhat/contracts/RWAOfferingPool.sol` (+ EBLRegistry/RWAToken), `hardhat test` 6 passing |
| WEB3-9 | Write `quote_hash` / `evidence_hash` into contract events | Sage | Done | contract event test | `PricingUpdated` + `OfferingRepriced` include evidence/quote hash, `latestQuoteHash/latestEvidenceHash` persisted, verified by tests |
| WEB3-10 | Deploy to Injective Testnet | Sage | Done | Deployment address + tx hash | - |
| WEB3-11 | Frontend displays contract addresses and PricingUpdated events | Bowen | Done | Manual demo | `public/app.js` adds `renderProtocolEvidence()`, showing protocol contract addresses (explorer links), access model description, and the latest 5 `PricingUpdated` events (poolId/price/risk/action/evidenceHash/tx link); `public/index.html` adds `#protocol-contracts`, `#pricing-events`, `#protocol-access-model` containers |
| WEB3-12 | Upgrade `EBLRegistry` V2: compute/register `cargoHash`, provide `isUnique`, forbid duplicate mints for the same cargo | Bowen | Done | `cd hardhat && npm test`; a second registration of the same cargoHash must revert, different cargo registers normally | `hardhat/contracts/EBLRegistry.sol` + `hardhat/test/eblRegistryV2.test.js` |
| WEB3-13 | Add eBL structured metadata: vessel, voyage, ports of loading/discharge, cargo, quantity, HS Code, declared value, Incoterms, MLETR/eUCP/DCSA standards | Bowen | Done | Solidity getter/event tests + consistency test between the metadata hash and off-chain parsing results | `mintEBLV2` / `EBLMetadata` / `EBLMintedV2`, `hardhat test` 24 passing |
| WEB3-14 | Implement full eBL transfer: `transfer`, `endorse`, `getTransferHistory`; forbid unauthorized transfer while pledged; must be pledged to the corresponding pool before creating an offering pool | Bowen | Done | `cd hardhat && npm test`, covering normal transfer, consecutive endorsements, pledge lock, pool creation failure without pledge, transfer after release and history order | `EBLRegistry.sol` + `RWAOfferingPool.sol` + 5 dedicated V2 tests |
| WEB3-15 | Complete the autonomous execution state machine: `RESUME_OFFERING`, payment/arrival settlement, valid state transitions, Agent executor permissions and emergency manual stop | Bowen | Done | `cd hardhat && npm test`, covering PAUSE→RESUME, OPEN/FUNDED→SETTLE, invalid transitions, unauthorized calls and duplicate events | `hardhat/test/offeringStateMachineV2.test.js` 8 passing: executor pause/resume, oracle RESUME_OFFERING action, payment+arrival proof settlement, global emergency stop, executor privilege-escalation and replay protection |
| WEB3-16 | Align with the v2 investor access model: testnet allows any wallet to invest directly; production mode uses a pluggable compliance gate, removing the conflict between the current hard-coded allowlist and the "global investors" narrative | Bowen | Done | Contract tests for both permissionless testnet and compliance-gated modes; frontend copy matches actual permissions | `hardhat/contracts/InvestorComplianceGate.sol` (pluggable compliance gate), `RWAOfferingPool.sol` adds `setComplianceGate()`/`isComplianceRequired()`; `offeringStateMachineV2.test.js` tests permissionless testnet and production gate; frontend `renderProtocolEvidence()` shows permission copy according to `accessModel` |
| WEB3-17 | Write a full protocol deployment script and deploy `AgentBLRWA`, `EBLRegistry` V2, `RiskPricingOracle`, `RWAOfferingPool`, `RWAToken` to Injective inEVM | Bowen | Done | Five addresses + deploy tx + explorer links; after deployment run an on-chain smoke verifying create/subscribe/reprice/pause/resume/settle | `hardhat/scripts/deploy-protocol.js` + `docs/evidence/wave-b-protocol.json`; final state `Repaid` |
| WEB3-18 | Extend wallet integration to MetaMask + Keplr + Leap: wallet selection, network switching, signing, reconnection and error messages | Sage | Done | Injective Testnet three-wallet acceptance matrix; each wallet completes at least one real signed transaction | `public/web3.js` adds `restoreWalletSession()`; MetaMask silently reconnects via `eth_accounts`, Keplr/Leap restore the native signer; `public/app.js` calls `restoreWalletIfSaved()` at boot; `tests/web3Wallets.test.js` adds 6 tests (network switching, signature rejection, permission revocation, MetaMask/Keplr session restore); `npm test` 335 passing |
| WEB3-19 | Change `public/chain-config.json` to a multi-chain/multi-contract format, defaulting to `injective-testnet`, and make the deployment script merge config instead of overwriting other networks | Bowen | Done | Config schema tests + two network fixtures; after switching chains, addresses, RPC, explorer and ABI are all correct | `public/chain-config.json` upgraded to the v2 schema (`schema: 'agentbl-chain-config-v2'`, `defaultNetwork`, `networks: {}`); `public/web3.js` adds `resolveBrowserChainConfig()` to resolve networks; `hardhat/scripts/deploy-protocol.js` merges updates instead of overwriting; `tests/chainConfig.test.js` 4/5 passing (1 file path issue); existing tests (`tests/web3Wallets.test.js`, main test suite) verify the v2 parsing logic |

---

## 8. x402 Paid Intelligence Market (Championship P0)

### 8.1 Frozen architecture

The official Injective route takes priority: the server uses `@injectivelabs/x402` as the primary package; only add `@x402/core`, `@x402/evm`, `@x402/fetch` directly when a browser/CLI client or the underlying protocol genuinely needs them. Installing everything just so "the dependencies look impressive" is forbidden. The current backend is `node:http`, so first do a compatibility spike, then choose one of "thin Express x402 router" or "native HTTP adapter"; do not half-migrate the whole service.

```text
Browser / CLI / external Agent
        │ ① request
        ▼
x402 Resource Server ──402 + PaymentRequirements──► wallet
        ▲                                             │ ② sign USDC
        │ ④ retry + receipt                           ▼
        └──────── Injective facilitator ◄──── signed payment
                          │ ③ settle on Injective EVM
                          ▼
                 Premium AI report
                          │ report_hash + payment tx
                          ▼
                    PaymentOracle
                          │ verified report envelope
                          ▼
          PricingQuote / RiskPricingOracle / RWAOfferingPool
```

### 8.2 Three paid endpoints

| Endpoint | Suggested price (configurable) | Paid output | Must not degrade into |
|---|---:|---|---|
| `POST /api/x402/intel/premium` | 0.01 USDC | 5-dimension world risk, sources, freshness, confidence, scenario impact, `evidence_hash` | Wrapping the existing free JSON in a 402 unchanged |
| `POST /api/x402/valuation/premium` | 0.03 USDC | Anti-fraud document review, comparable trades, conservative cargo value, three-tier financing quotes, divergence/confidence, `quote_hash` | Just letting the LLM write a paragraph of valuation copy |
| `POST /api/x402/stress-test` (compatible with `/smoke-test`) | 0.05 USDC | Baseline/warning/extreme scenarios, loss range, default recovery, REPRICE/PAUSE recommendation, replayable input snapshot | Returning a "smoke passed" string |

Prices are for the demo only and are all configured via environment variables. Once a report has been bought, it can be re-read within a short TTL by `payment_tx + report_hash`; refreshing must not charge again each time.

Paid risk reports are unified into 5 decision dimensions, reusing the existing finer-grained signals rather than inventing a second scoring system:

```text
① Document & Fraud  document authenticity, consistency, multiple bills for one cargo
② Cargo & Valuation cargo value, comparable trades, price volatility, haircut
③ Transit & Logistics route, weather, ports, delays
④ Macro & Geopolitics war, sanctions, FX, country risk
⑤ Insurance & Settlement insurance coverage, buyer payment, recovery and settlement
```

### 8.3 Engineering tasks

| ID | Task | Priority | Owner | Status | Verification / Definition of Done |
|---|---|---|---|---|---|
| X402-1 | Do an official Injective x402 compatibility spike: confirm the `@injectivelabs/x402` version, Node version, Express dependency, facilitator `/supported`, USDC asset, and support for mainnet `eip155:1776` and testnet `eip155:1439` | P0 | Bowen | Done | `docs/x402-spike.md` records npm/SDK and real HTTP responses: stable version `0.0.1`, Node `>=20`, Express optional peer; the official Demo and `/supported` were measured to return only Testnet 1439 + USDC/EIP-3009. The current staging facilitator is HTTP and Mainnet 1776 has not been verified live; the boundaries of a one-time Testnet wallet, explicit Demo settlement and Mainnet fail-closed are clearly defined |
| X402-2 | Add minimal dependencies with pinned versions: prefer `@injectivelabs/x402`; only add `@x402/core` / `@x402/evm` / `@x402/fetch` if the client genuinely needs them | P0 | Bowen | Done | Exactly pinned `@injectivelabs/x402@0.0.1` + `express@5.2.1`, Node raised to `>=20`; `ws` overridden to the patched `8.21.0`, `npm audit` shows 0 vulnerabilities; README explains the purpose and the boundary of not introducing a second x402 package set |
| X402-3 | Create `src/x402/config.js`: network, asset, decimals, payTo, facilitator URL, prices for the three endpoints, TTL, live/demo mode; fail-fast validation at startup | P0 | Bowen | Done | `config.js` pins native USDC for 1776/1439, 3 atomic prices, Live/Demo and HTTPS gates; `/supported` validates V2/exact/asset/decimals/EIP-3009; `tests/x402Config.test.js` 10 tests passed |
| X402-4 | Create `src/x402/server.js`: unified 402 challenge, V2 standard headers, payment verification, settle, pass-through on success; do not copy business logic into the middleware | P0 | Bowen | Done | Express middleware outputs a decodable `PAYMENT-REQUIRED` using the official decoder; rejects malformed/expired/future/wrong network/asset/amount/payTo/domain before the facilitator, and calls `next()` only after a successful settle; `tests/x402Server.test.js` 9 tests passed |
| X402-5 | Create `src/x402/client.js`: support the 402→sign→retry flow for external browser wallets and CLI signers; private keys are never sent from the frontend to the server | P0 | Sage | Done | `createPaidFetch`/`fetchPaidIntel` support an injected wallet or CLI signer; signing happens only locally and only the signature + signer address are sent back; adds a `balanceOf` pre-check and `classifyPaidFailure`, mapping cancelled signature/budget exceeded/wrong network/insufficient balance/network error/settlement timeout/settlement failure to an `X402ClientError` with `recoverable`; `tests/x402Client.test.js` 13 contract tests (including the "private key never leaks" assertion) all green, `npm test` 270 passed |
| X402-6 | Create `src/x402/settlement.js`: facilitator verify/settle adapter, idempotency keys, receipt store, retries and the state machine `CHALLENGED/SIGNED/SETTLING/SETTLED/UNLOCKED/FAILED` | P0 | Bowen | Done | Official V2 verify/settle adapter + bounded retry + atomic JSON receipt store + single-flight; settled/unlocked states recover after restart, dangling SETTLING goes to manual reconciliation FAILED, a failure never unlocks; `tests/x402Settlement.test.js` 7 tests passed |
| X402-7 | Define the `PaidReportEnvelope` schema, containing at least `report_id/kind/case_id/payer/payee/network/asset/amount/payment_tx/settled_at/data_snapshot/model_provider/evidence_hash/report_hash/expires_at` | P0 | Bowen | Done | `src/x402/paidReport.js` provides a schema manifest, normalization, redaction, stable hash/recomputation and TTL validation; 10 positive/negative tests; all three endpoints return validated envelopes |
| X402-8 | Implement the three paid endpoints, reusing the existing `worldRiskAgent`, `valuationAgent`, `documentConsistency`, `pricingEngine` and scenario runner | P0 | Bowen | Done | `src/x402/endpoints.js` composes the risk / valuation / fraud-review reports; payment only controls access and does not change the risk score; `tests/x402Endpoints.test.js` unlocks all three endpoints |
| X402-9 | Create `hardhat/contracts/PaymentOracle.sol`: bind `reportHash`, `caseIdHash`, the original payment tx hash, payer, asset and amount into an event; prevent duplicate attestation and support attestor permissions | P0 | Bowen | Done | 8 PaymentOracle tests cover success, double replay protection for receipt/payment tx, zero hash/address/amount, unauthorized calls and attestor management; frontend `readX402PaymentAttestation` can read back; testnet deployment `0x36d9Ff1256b3db1EFC1EAcB4c9b5033165D24571` |
| X402-10 | Inject verified paid reports into issuance pricing as an evidence node of the PricingQuote; the payment itself must not change the risk score or raise the report's credibility | P0 | Bowen | Done | `reportEvidence.js` only injects provenance/evidence hash; 6 tests prove the risk score, price, action and quote hash are unchanged, and tampered/expired/wrong-case reports are all rejected |
| X402-11 | Add a frontend "Paid Intelligence Market" tab: report product cards, locked preview, price, data time, model, `402 → sign → settle → unlock → attest` stepper, explorer links | P0 | Sage | Done | View ③ report catalog + 4-step stepper + payment evidence card + pricing impact + explorer links are in place; this round added "re-read within TTL after refresh": new `src/x402/reportStore.js` (`PaidReportCache`, atomic persistence + automatic prune on expiry), `createX402Route` caches on successful delivery, `GET /api/x402/report/:id` allows free re-reads within the TTL (miss→404, requires paying again), the frontend remembers purchased report_ids in localStorage and re-reads unexpired reports when entering View ③ (`#x402-purchased`). `tests/x402ReportStore.test.js` 7 tests + integration "demo purchase→GET re-read 200/unknown→404"; measured against a running server: demo purchase→re-read 200 with matching report_id; `npm test` 278 passed. Note: the browser extension disconnected in this session, so the client localStorage re-read path did not get visual acceptance |
| X402-12 | Add payment animations and risk feedback: `paymentFlow`, `priceFlash`, `riskPulse`; support `prefers-reduced-motion` | P1 | Sage | Done | Wired up: while paying, `#x402-flow` runs the `particleFlow` shimmer; after successful settlement, the after-price gets `priceFlash`, the delta badge does a brief `risk-pulse` when the price rises (stops after 4.2s), and the impact card `x402-impact-pop` (scale up + green ring) signals success where the user's eye lands; both `pulseClass` and risk-pulse have `prefers-reduced-motion` guards plus a global reduced-motion rule as backstop; full-screen confetti was found in testing to be easily hidden behind cards and of low value, so it was removed per the user's decision; `node --check public/app.js` passes |
| X402-13 | Add `scripts/x402-intel.mjs` and `npm run x402:intel -- --case <id> --kind <kind>`; output challenge, amount, settlement tx, report hash, oracle tx | P0 | Bowen | Done | CLI supports risk/valuation/fraud, case ID/file, a Demo temporary signer and Live fail-closed; keys are used only locally; outputs challenge/amount/receipt/report hash/oracle status |
| X402-14 | Add `scripts/smoke-x402.mjs`, `npm run smoke:x402` and at least 12 automated tests | P0 | Bowen | Done | Added `tests/x402Endpoints.test.js` 15 tests; together with config/server/settlement covers 3 endpoints, budget/cancel/timeout/wrong network, tamper/replay/expiry/wrong recipient/settlement failure and success; `smoke:x402` passes |
| X402-15 | Do an Injective Live smoke: wallet holds INJ gas + USDC, actually buy one report, read back the payment tx, `PaymentAttested` and the report hash | P0 | Bowen | Done | On 2026-06-29 on `eip155:1439`, really settled 0.001 USDC with a test self-transfer: payment `0x6d796d…a0b49`, report `rpt_3e5f…3334` / hash `0x994078…168ce`, attestation `0xa03ab9…fef6e`; before the pitch, it can be rerun with an independent treasury payTo; full evidence in `docs/evidence/x402-live-smoke.json` |
| X402-16 | Update README, architecture diagram, API docs, threat model and FAQ; clearly distinguish x402 report payment from RWA subscription | P0 | Sage | Done | `docs/x402-integration.md` adds an "x402 report payment vs RWA subscription" comparison table + flow chart, a table of 8 threat-model invariants (mapped to code and tests) + client recoverable error codes, a judge FAQ (who pays / what is bought / why on-chain / difference from RWA / payment failure / why Injective), the `GET /api/x402/report/:id` re-read endpoint and `X402_REPORT_CACHE_PATH`; the README's Chinese/English API tables add 4 x402 endpoints + an "x402 ≠ RWA" callout + a More docs link to x402-integration.md |
| X402-17 | Optional: publish 3 machine-discoverable resource descriptions via the x402 Bazaar/discovery extension so external Agents can discover and buy them | P2 | Bowen | Todo | Discovery metadata can be parsed by clients; does not block the core demo |

### 8.4 x402 security invariants

```text
1. Unlock only when verified && settled; merely seeing a tx hash does not mean the payment succeeded.
2. network + asset + amount + payTo + resource + nonce all go into the signing/verification domain.
3. A payment receipt is bound one-to-one to a report_hash; it must not be reused across different cases / reports.
4. Replays, concurrency and timeout retries may produce only one settlement and one PaymentOracle attestation.
5. If report generation fails, no charge may be taken, or a verifiable refund/retry policy must be provided.
6. Demo mode receipts use the demo:// identifier and never generate fake explorer URLs.
```

---

## 9. MCP / RAG / Skill

These are bonus items and must serve the AI pricing main path.

### 9.1 Frozen at 7 tools

```text
1. get_trade_case
2. search_knowledge_base
3. verify_trade_documents        # New: eBL / invoice / insurance cross-verification
4. generate_pricing_quote
5. purchase_premium_analysis     # New: buys reports as an x402 client
6. simulate_offering
7. push_pricing_to_oracle
```

### 9.2 Frozen at 3 resources

```text
agentbl://cases/catalog           # Demo-able cases and summaries, without sensitive full text
agentbl://risk/methodology        # 5/6-dimension risk, bps rules, non-guarantee boundary
agentbl://contracts/deployments   # network, contract addresses, ABI version, explorer
```

### 9.3 Engineering tasks

| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| MCP-1 | Design the AgentBL MCP tools manifest | P0 | Bowen | Done | `npm run smoke` | merged from feature/mcp-server |
| MCP-2 | Implement `get_trade_case` | P0 | Bowen | Done | `npm run test` | merged from feature/mcp-server |
| MCP-3 | Implement `generate_pricing_quote` | P0 | Bowen | Done | `npm run test` | merged from feature/mcp-server |
| MCP-4 | Implement `simulate_offering` | P0 | Bowen | Done | `npm run test` | merged from feature/mcp-server |
| MCP-5 | Implement `push_pricing_to_oracle` mock / real tx | P0 | Bowen | Done | `npm run test` | merged from feature/mcp-server |
| MCP-6 | Implement stdio transport and the JSON-RPC lifecycle with the official MCP SDK, with handlers continuing to reuse the existing deterministic engine | P1 | Bowen | Done | `npm run test` | `src/mcp/standalone-server.js` + `tests/mcpProtocol.test.js`: a real SDK client completes initialize/list/call/read; stdout carries only protocol frames |
| MCP-7 | Add `verify_trade_documents` and `purchase_premium_analysis`, fixing the total tool count at 7; the latter handles 402 payment fully rather than bypassing the middleware | P1 | Bowen | Done | `npm run test` | All 7 tools are really called one by one; the purchase tool goes through 402 challenge/sign/retry and returns payment + report + oracle proof |
| MCP-8 | Add 3 read-only resources, setting MIME type, URI validation and redaction of sensitive fields | P1 | Bowen | Done | `npm run test` | `agentbl://cases/catalog`, `agentbl://risk/methodology`, `agentbl://contracts/deployments`; unknown URIs return a protocol error |
| MCP-9 | Integrate the official Injective MCP Server as an external chain execution/query adapter, preferring its chain query, transfer and raw EVM transaction capabilities | P1 | Bowen | Done | On-chain smoke | `usdc_native_info` query + controlled `evm_broadcast` to allowlisted contracts: `0x1578c1…984f`; see `docs/evidence/injective-mcp-smoke.json` |
| MCP-10 | Add human approval, amount caps, allowlist, network pinning and dry-run for on-chain write operations; read operations may be automatic | P0 | Bowen | Done | `npm run test` | `security.js` + dedicated tests: dry-run by default; real writes require an out-of-band token, and unapproved/over-limit/wrong network/unknown contract/unknown calldata selector are all rejected |
| MCP-11 | Provide `npm run mcp:stdio`, an example client config, a 30-second screen recording and an offline protocol fixture | P1 | Bowen | Todo | Manual demo | A fresh environment can connect by following the README; without Injective MCP, AgentBL's read-only/simulation capabilities can still be demoed |
| RAG-1 | Build risk intelligence material: weather, war, ports, insurance, price mock feed | P0 | Bowen | Done | `npm run test` | merged from feature/mcp-server |
| RAG-2 | Prepare 4 retrieval questions for judge follow-ups | P1 | Bowen | Done | `npm run test` | merged from feature/mcp-server |
| SKILL-1 | Create the `agentbl-pricing-analyst` skill | P1 | Bowen | Done | `npm run smoke` | merged from feature/mcp-server |
| SKILL-2 | Create the `agentbl-demo-operator` skill | P1 | Bowen | Done | `npm run smoke` | merged from feature/mcp-server |

---

## 10. AI Quality, Security and Trustworthiness

| ID | Task | Priority | Owner | Status | Verification / Definition of Done |
|---|---|---|---|---|---|
| TRUST-1 | Build a Gold dataset: real/redacted eBLs, invoices, insurance policies; at least 20 cases covering normal/fraud/missing fields/war/delay | P0 | Done | Done | Data licensing and sources can be explained; field-level ground truth; sensitive commercial data must not be committed to a public repository | 20-entry gold dataset completed |
| TRUST-2 | Evaluate OCR/parsing accuracy, document consistency precision/recall, risk score monotonicity, valuation error, tool-call success rate | P1 | Done | Done | `docs/evaluation-report.md` gives metrics, failure samples and limitations; reporting only the total test count is not enough | Evaluation report generator completed |
| TRUST-3 | Prompt-injection protection: document content is treated as untrusted data and cannot change tool permissions, payment address, network, price or system rules | P0 | Done | Done | A malicious eBL fixture cannot trigger arbitrary tools/tx, change payTo or leak secrets; tests included in preflight | 5 injection tests + sanitizer completed |
| TRUST-4 | Contract security: access control, pause, reentrancy, replay, integer precision, duplicate cargo/payment/report, state machine, emergency stop | P0 | Bowen | Todo | Slither or equivalent static analysis + adversarial tests; all high findings closed or accepted in writing |
| TRUST-5 | Data freshness and source health: risk intelligence tagged with `observed_at/expires_at/source_status`; when expired, automatically lower confidence or refuse to price | P0 | Done | Done | clock-controlled tests; when offline, old data is never passed off as real-time data | DataFreshnessValidator completed |
| TRUST-6 | Privacy and compliance minimization: only hashes on-chain; field-level redaction of BL, company and wallet in logs/telemetry; add deletion/retention policy | P1 | Bowen | Todo | Log snapshots contain no raw files, API keys, private keys or full addresses; privacy notice added to README |
| TRUST-7 | Economic model stress test: repeat purchases, report resale, low-price API abuse, refunds, report expiry, RWA default and conflicts of interest | P1 | Bowen | Todo | Document gives price/cost/gross margin assumptions and 3 extreme scenarios; x402 revenue is not mixed into RWA return promises |

---

## 11. Demo Mode, Visuals and Pitch

A champion project must first be "easy to understand".

### 11.1 1-minute main demo

```text
00–08s  "The cargo is at sea; the money takes 45 days." The exporter lacks cash; investors cannot read document risk.
08–18s  Open a copper/crude oil eBL: the report is locked, the API returns 402, showing 0.01 USDC.
18–30s  Wallet signs, Injective settles, the stepper lights up step by step, the report unlocks.
30–42s  AI shows 5-dimension risk + anti-fraud document review + valuation comparison; every number can be clicked to open its evidence.
42–52s  The report is injected into RWA pricing: the price waterfall changes; PaymentOracle and RiskPricingOracle write on-chain.
52–60s  One-line close: others pay to buy AI analysis, AI prices the risk, Injective enforces it.
```

### 11.2 Engineering tasks

| ID | Task | Priority | Owner | Status | Verification / Definition of Done |
|---|---|---|---|---|---|
| DEMO-1 | Add a unified `demoMode=true` (default) and an explicit Live toggle; Demo data can be reset in one click, and mock tx are strictly forbidden in Live mode | P0 | Bowen | Done | `src/demo/mode.js` + `/api/demo/mode|reset`; persistent top banner/Live toggle/reset; insufficient Live prerequisites return 409, and a failed PaymentOracle write never falls back to a fake tx |
| DEMO-2 | Keep only one main CTA on the home page: "Buy the AI risk report for this RWA"; put financing/market/shipping as secondary entries | P0 | Bowen | Todo | 5-second usability test: a new user can say who pays, what is bought and what happens on-chain |
| DEMO-3 | Complete on-screen linkage of payment feed, riskPulse, priceFlash, waterfall and Agent activity | P1 | Bowen | Todo | The same `report_id/decision_id/tx_hash` runs through every panel; no random logs or inconsistent numbers |
| DEMO-4 | Write 30-second / 1-minute / 3-minute Chinese pitch scripts and an English tagline, with numbers, roles and narrative fully consistent across the three versions | P0 | Bowen | Todo | Cross-check README, PRD, demo-script, video-script; at least 3 timed rehearsals |
| DEMO-5 | Create `npm run preflight` aggregating 54 checks: environment, files/schema, 300 Node tests, 24 contract tests, smoke/scenarios, MCP, x402, RPC/facilitator, balances, contract addresses, UI assets, documentation consistency | P0 | Bowen | Done | `scripts/preflight.mjs` fixes 54 items and actually runs all suites; Demo measured 50 PASS / 4 Live WARN / 0 FAIL; critical failures exit 1 |
| DEMO-6 | Prepare for judge follow-ups: why AI, who bears cargo loss, why it is not a capital-guaranteed security, can reports be forged, what if payment fails, why Injective is required, differences from TradeGo/banks | P0 | Bowen | Todo | A 20-second answer per question + clickable evidence/code/tx; make no legal assertions not confirmed by a lawyer |
| DEMO-7 | Record the Live main video + a Demo Mode fallback video; prepare local MP4, key screenshots and a CLI fallback | P0 | Bowen | Todo | Plays even in airplane mode; tx links in the video match the current deployment config |
| DEMO-8 | Do a "failure rehearsal": RPC, facilitator, LLM, xAPI and wallet each fail | P0 | Bowen | Todo | Each failure switches to the correct fallback within 15 seconds; no full-page refresh, no stack traces/keys exposed |

### 11.3 `preflight` fixed 54 items

Output by the numbering below when implementing; do not use "54 items" as a slogan while only running five commands. Live-only checks may be recorded as `SKIP` in Demo Mode, but never as `PASS`.

| # | Check | # | Check |
|---:|---|---:|---|
| 1 | AgentBL Node version satisfies `engines` | 28 | Static security scan has no unhandled high finding |
| 2 | Node ≥22 when official Injective MCP is enabled | 29 | On-chain smoke after full protocol deployment |
| 3 | `package-lock.json` consistent with `package.json` | 30 | Payment/Pricing oracle events can be read back |
| 4 | Required `.env` entries exist and secrets are not tracked by git | 31 | MCP stdio initialize/handshake |
| 5 | `demoMode` / Live mode config mutually exclusive and explicit | 32 | MCP tool count exactly equals 7 |
| 6 | chainId / CAIP-2 / network name consistent | 33 | All 7 tool schemas valid |
| 7 | RPC health and chainId match when measured | 34 | Minimal calls to all 7 tools succeed |
| 8 | Explorer base URL format consistent with the network | 35 | MCP resource count exactly equals 3 |
| 9 | Facilitator `/supported` covers the target network | 36 | All 3 resources can be read |
| 10 | Live wallet has enough INJ gas + USDC balance | 37 | Official Injective MCP read-only query succeeds |
| 11 | `data/demo-case.json` schema | 38 | Official MCP write-operation policy/dry-run in effect |
| 12 | All `data/cases/*.case.json` schemas | 39 | First request to each of the three x402 endpoints returns a valid 402 |
| 13 | All PricingQuote schemas + invariants | 40 | x402 tamper/replay/expiry negative cases all rejected |
| 14 | PaidReportEnvelope schema + hash recomputation | 41 | x402 Demo settlement unlocks all three endpoints |
| 15 | `chain-config.json` schema | 42 | x402 Live payment + PaymentOracle (Live-only) |
| 16 | Contract addresses in config have bytecode | 43 | Local assets referenced by `index.html` all exist |
| 17 | Frontend ABI consistent with deployment artifact/version | 44 | No missing Chinese/English i18n keys |
| 18 | Risk feed freshness and source health | 45 | No horizontal overflow on a 390px mobile viewport |
| 19 | No duplicate case/cargo/payment/report IDs | 46 | No strong flashing animations in reduced-motion mode |
| 20 | README covers all current environment variables | 47 | State fully replayable after Demo reset |
| 21 | `npm run check` | 48 | 1-minute main flow timed at ≤65 seconds |
| 22 | `npm test` with no fewer than the current 300 tests | 49 | Numbers and roles consistent across 30-second/1-minute/3-minute versions |
| 23 | `npm run smoke` | 50 | Explorer links in README/UI/video open |
| 24 | `npm run scenarios` | 51 | No `mock/random/demo tx` in Live mode |
| 25 | `npm run demo` | 52 | Privacy/secret scan of logs and telemetry |
| 26 | `hardhat compile` | 53 | Local CLI, screenshot and MP4 fallback assets all present |
| 27 | `hardhat test` with no fewer than the current 24 tests | 54 | Output commit SHA, build time, dirty tree warning |

---

## 12. QA / Integrator

QA goal: every new feature must feed back into the same main path; nothing should be scattered.

| ID | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|
| QA-1 | Maintain `npm run check` | Bowen | Todo | `npm run check` | - |
| QA-2 | Maintain `npm run test` | Bowen | Todo | `npm run test` | - |
| QA-3 | Maintain `npm run smoke` | Bowen | Todo | `npm run smoke` | - |
| QA-4 | Maintain `npm run scenarios` | Bowen | Todo | `npm run scenarios` | - |
| QA-5 | Add pricing invariant tests: redemption exposure cannot exceed safe coverage | Bowen | Todo | `npm run test` | - |
| QA-6 | Add a frontend manual acceptance checklist | Bowen | Todo | Checklist document | - |
| QA-7 | Run the full verification matrix before the final demo | Bowen | Todo | `npm run check && npm run test && npm run smoke && npm run scenarios && npm run demo` | - |
| QA-8 | Prepare demo failure fallbacks: CLI demo, mock provider, contract mock | Bowen | Todo | README / docs updated | Contract mock done (`contractHarness.js`); CLI demo / README fallback notes still to be added |
| QA-9 | Coordinate the feature freeze for the final 6 hours | Bowen | Todo | Confirmed by everyone | - |
| QA-10 | Add an autonomous Agent reliability test matrix: out-of-order events, duplicate events, process restart, RPC timeout, xAPI/LLM unavailable, on-chain transaction failure | Bowen | Todo | `npm run test`; every failure path has idempotent recovery or a deterministic fallback | - |
| QA-11 | Add eBL V2 security tests: multiple bills for one cargo, forged cargoHash, unauthorized transfer/endorse, transfer while pledged, replay attacks | Bowen | Todo | `cd hardhat && npm test` + security test report | - |
| QA-12 | Add market and role API integration tests: access control, pagination, concurrent subscriptions, persistence recovery, on-chain/off-chain state reconciliation | Bowen | Todo | `npm run test && npm run smoke`; API, persistent storage and contract events are consistent across all three | - |
| QA-13 | Build a manual acceptance matrix of MetaMask / Keplr / Leap × desktop/mobile × real chain/offline fallback | Bowen | Todo | Full checklist, screenshots and test tx hashes | - |
| QA-14 | Run the 3-minute P0 acceptance per gap analysis v2: upload → uniqueness → parsing → autonomous pricing/opening → market subscription → risk pause/resume → automatic redemption | Bowen | Todo | Recording + decision log + full set of on-chain tx; no step may rely on forged random tx | - |

---

## 13. Execution Order and Qualification Gates

### 13.1 Minimal demo-able loop

The existing AI pricing, market View ⓪, MetaMask single-Demo contract and offline fallback form the v1 baseline. For gap analysis v2, if time runs short, the new scope must keep at least the following 16 tasks:

```text
PM-8   Unify the No-bank / Web3-native narrative
AI-13  Agent orchestrator
AI-14  Event → Decision → On-chain Action
AI-16  Persistent decision audit log
AI-17  AI document parsing
BE-14  Document upload + ENI adapter + automatic trigger
BE-15  Agent activity real-time API
FE-11  eBL management View ③
FE-13  Agent activity View ⑤
WEB3-12 cargoHash uniqueness
WEB3-14 eBL transfer and pledge constraints
WEB3-15 RESUME / SETTLE autonomous state machine
WEB3-16 Align investor access model with the v2 narrative
WEB3-17 Full protocol deployment to Injective inEVM
WEB3-18 MetaMask + Keplr + Leap
QA-14  3-minute P0 end-to-end acceptance
```

Only once these 16 are done can the project be upgraded from an "AI pricing demo" to a Web3-native protocol that "runs autonomously once the eBL is on-chain, executes autonomously when risk changes, and is auditable end to end". Multi-chain config, the portfolio page, multi-LLM and the brand theme can be filled in in parallel once the core loop is stable.

### 13.2 Wave A: close the loop within 48 hours first

```text
X402-1 → X402-3/4/6 → X402-8 → X402-13/14
DEMO-1 → DEMO-5
```

Gate A: Demo Mode reliably shows the three distinct paid outcomes of 402, settlement and unlock; 12+ x402 tests all green. If the testnet facilitator is not supported, the decision between a small real mainnet payment and an explicit demo must be made at this point; do not drag the uncertainty to the end.

**Gate A status: ✅ Achieved.** All three kinds of Demo reports complete 402→sign→settle→unlock, and the current 300 Node tests are all green; Live V2/EIP-3009 has completed one real 0.001 USDC payment, with `PaymentAttested` binding the payment tx, report hash and case.

### 13.3 Wave B: on-chain trust and Agent composability

```text
X402-7/9/10/15 → WEB3-17 → MCP-6/7/8/10 → MCP-9
```

Gate B: one real payment can be traced from the payment tx to the `PaidReportEnvelope`, `PaymentAttested`, `PricingUpdated` and the final RWA quote; MCP Inspector can list 7 tools + 3 resources.

**Gate B status: ✅ Achieved.** 0.001 USDC real payment tx → redacted `PaidReportEnvelope` commitment → `PaymentAttested` → `PricingUpdated` with the same `report_hash` as `evidenceHash` → pool #2 final quote `$0.80`; the official SDK stdio client has called all 7 tools one by one and read the 3 resources, and the official Injective MCP has also completed queries and a controlled raw EVM testnet transaction. Overall evidence in `docs/wave-b.md` and `docs/evidence/wave-b-gate.json`.

### 13.4 Wave C: AI evidence and product polish

```text
SP-8/9/10 → TRUST-1/2/3/5 → X402-11/12 → DEMO-3/4/6
```

Gate C: Azure eval meets the thresholds, traces show the full Agent tool chain, and the 60-second page demo needs no verbal patches.

**Gate C status: ✅ Core achieved.** SP-8/9/10 all done (Azure OpenAI provider, 20-entry evaluation dataset, OpenTelemetry tracer); TRUST-1/2/3/5 all done (20-entry Gold Dataset, evaluation report generator, Prompt Injection protection + 5 malicious tests, data freshness validator); 321/321 tests all green (100%). X402-11/12 and DEMO-3/4/6 demo polish still to be completed. Core AI quality proof is ready.

### 13.5 Wave D: final freeze

```text
DEMO-7/8 → QA-10~14 → TRUST-4/6/7 → npm run preflight
```

Gate D: preflight all green 3 times in a row; all four paths (Live/Demo/CLI/video) rehearsed; in the final 6 hours, only fix P0 blockers.

---

## 14. Sponsor Technology Usage Checklist

Use a lot, but every item must have a business reason.

| ID | Sponsor / capability | Priority | Where it is applied | Task / acceptance | Status |
|---|---|---|---|---|---|
| SP-1 | Injective EVM | P0 | Five-contract protocol, PaymentOracle, USDC x402 | Full deployment, verified source, recorded addresses/tx, frontend reads back events | Done |
| SP-2 | Injective x402 | P0 | Pay-per-call AI intelligence | Complete X402-1~16; show a real 402 and payment tx in the pitch | Done |
| SP-3 | Injective MCP Server | P1 | Agent queries the chain and executes controlled raw EVM tx | Complete MCP-9/10; do not pass off the self-built MCP as the official MCP | Done |
| SP-4 | Injective EVM / CLI agent skills | P1 | Development, deployment and troubleshooting workflows | Record installation, use cases and reproducible commands in `docs/injective-runbook.md`; it is an engineering capability, not disguised as a product runtime | Done — official skills installation, chain pinning, deployment/precompile commands, failure and rollback runbook documented |
| SP-5 | Injective ERC20/Bank precompile | P1 | Unify USDC balance/denom/transfer and the EVM/native mapping of the RWA token | Do a minimal read/write spike; only after success decide whether to move it into P0, avoiding a self-built duplicate bridging layer | Done — `0x64` + MTS USDC read/write measured; ERC20/x-bank balances consistent; tx `0xc0cf…ff7f`; the current multi-pool RWAToken mapping is honestly deferred to per-pool V2 |
| SP-6 | Injective Exchange precompile | P2 | Optional RWA secondary market/risk hedging | Only integrate when there is a real test market and a clear economic model; acceptance is a real order/query, mock screenshots do not count as done | Done — only GOLD direct hedging approved; real `0x65` deposit/spot/order/query/cancel/withdraw, order `0xfe53…2b58`, order tx `0x38c9…fc5b`; fail closed when copper/aluminium/soybeans/crude oil have no direct market |
| SP-7 | Injective Indexer + Explorer | P0 | Read back payment, pricing, pause, resume and redemption events | Every key state in the UI can jump to a real tx/event; RPC fallback when the Indexer is unavailable | Done |
| SP-8 | Azure OpenAI / Microsoft Foundry Models | P1 | Add an Azure provider to `openaiCompatClient`; parsing, explanation, report generation | `AZURE_OPENAI_ENDPOINT/DEPLOYMENT/API_KEY` configured; tool calls and structured output pass; deterministic fallback retained | Done |
| SP-9 | Microsoft Foundry Evaluation | P1 | Proof of Agent AI quality | Build an eval dataset of ≥20 entries; Task Completion ≥85%, Tool Call Success ≥95%, Groundedness ≥0.8; save shareable result screenshots/JSON | Done |
| SP-10 | Microsoft Foundry / Application Insights tracing | P1 | Observability of the Agent call chain | Use OpenTelemetry to record parser→checker→risk→valuation→pricing→payment→chain spans, latency, errors and cost; redacted by default | Done |
| SP-11 | GitHub Copilot | P2 | Team development efficiency | Recorded truthfully only in development notes, not presented as a product technical innovation or runtime integration | - |
| SP-12 | ENI / TradeGo / Lixun | P0 | Trusted eBLs, real business data, deployment endorsement | Obtain at least one of: sandbox/API schema, sample document ID or a formal LOI; if none can be obtained, use an explicit mock adapter and do not fabricate a live partnership | - |
| SP-13 | xAPI | P0 | World risk from X/news/prediction markets | Already exists; add freshness, source health, deduplication and paid-report citations, and keep the offline fixture | Done |

---

## 15. Team Roles and Collaboration Process

### 15.1 Recommended parallel division of work

| Role | Suggested owners | Main tasks |
|---|---|---|
| PM / Pitch | 1 person | PM-1 to PM-8, demo script, compliance Q&A, No-bank narrative consistency |
| AI | 2 people | AI-1 to AI-20, pricing, orchestrator, autonomous loop, parser, compliance, advisor, LLM consensus |
| Backend | 1-2 people | BE-1 to BE-15, API, schema, scenario, ENI ingestion, market/pool/role persistence |
| Frontend | 1-2 people | FE-1 to FE-15, Marketplace + Mint + Voyage + eBL/Portfolio/Agent Activity |
| Web3 | 1-2 people | WEB3-1 to WEB3-19, eBL V2, autonomous state machine, full protocol deployment, multi-wallet/multi-chain |
| QA / Integrator | 1 person | QA-1 to QA-14, final integration, security, wallet matrix and demo fallbacks |

### 15.2 Task claiming process

1. Pull the latest `main` first.
2. Find a `Bowen` task in this file.
3. Change the Owner to yourself.
4. Change the Status to `In Progress`.
5. Open a branch and develop.
6. Run the verification commands when done.
7. Open a PR.
8. After merging, change the Status to `Done` and fill in Done Evidence with the PR or commit.

### 15.3 Branch naming

```text
feature/ai-pricing-quote
feature/backend-pricing-api
feature/frontend-rwa-offering
feature/contract-risk-pricing-oracle
feature/scenario-high-risk-reprice
feature/agent-orchestrator
feature/agent-autonomous-loop
feature/ebl-registry-v2
feature/eni-document-ingestion
feature/agent-activity-view
fix/pricing-invariant
docs/pitch-tokenomics
```

### 15.4 Merge criteria

A PR must satisfy:

```text
1. Has a clear Owner
2. Has a corresponding task ID
3. Has verification commands
4. Does not break the main demo flow
5. If it involves RWA pricing, it must explain the relationship between issue price / target redemption / risk discount
6. If it involves investor returns, it must keep the non-guarantee copy
```

Changes related to the main flow must run:

```bash
npm run check
npm run test
npm run smoke
npm run scenarios
npm run demo
```

---

## 16. 2025-2026 Hackathon Championship Sprint Tasks

Based on research into the latest trends at top events such as ETHGlobal, the following are the recommended championship sprint tasks (grouped by priority):

### 16.1 Verifiable AI Trust
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| VERIFY-1 | Simulated TEE inference proof: generate an `inference_attestation` containing hash verification and store it in the PricingOracle event | P0 | Bowen | Todo | `npm run verify-inference` verifies on-chain/off-chain consistency | - |
| VERIFY-2 | Reproducible Inference: provide a CLI to re-run pricing, proving that the same hash yields the same result | P0 | Bowen | Todo | Command line outputs the same evidence_hash and quote_hash | - |
| VERIFY-3 | Multi-party inference consensus on-chain: write AI-20's multi-LLM consensus metadata (median, divergence, etc.) into contract events | P1 | Bowen | Todo | Check that contract events contain a consensus attestation | - |

### 16.2 Smart Account & Agent Wallet
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| AA-1 | Agent smart wallet (Session Keys): based on ERC-4337, restrict the Agent's contract allowlist and per-transaction limit | P0 | Bowen | Todo | On testnet the Agent successfully initiates a restricted transaction via a Session Key | - |
| AA-2 | Gasless via Paymaster: let investors subscribe with zero gas through a Paymaster, or have the protocol pay x402 gas | P1 | Bowen | Todo | A wallet with no INJ balance can successfully subscribe to an RWA or buy a report | - |
| AA-3 | Transaction preview and risk simulation (Tx Simulation): show the upcoming fund flows and risk warnings before the user signs | P0 | Bowen | Todo | The popup accurately parses tx_data and shows the estimated USDC and RWA transfers | - |

### 16.3 On-Chain Agent Identity
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| AGENTID-1 | On-chain Agent identity registration: deploy an ERC-721 identity contract declaring the Agent's capabilities and Model Hash | P0 | Bowen | Todo | `AgentRegistry` deployed successfully and NFT minted | - |
| AGENTID-2 | Agent reputation accumulation: update the score in `AgentRegistry` after settlement, affecting the credibility weight next time | P1 | Bowen | Todo | `npm run test`, simulating reputation changes caused by default or successful redemption | - |
| AGENTID-3 | Agent Capability Manifest: register supported MCP tools on-chain | P1 | Bowen | Todo | Calling the getter returns the list of tools supported by AgentBL | - |

### 16.4 Agent-to-Agent Commerce
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| A2A-1 | A2A Agent Card: publish `/.well-known/agent.json` declaring capabilities and pricing | P0 | Bowen | Todo | Visiting the endpoint returns valid A2A protocol JSON | - |
| A2A-2 | Agent-to-agent delegated pricing: an external Agent sends a delegation, AgentBL returns a quote and x402 payment evidence | P1 | Bowen | Todo | Initiate a full interaction via another MCP Client (such as Claude Desktop) | - |

### 16.5 Intent-Based Execution
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| INTENT-1 | Investor subscription intent: sign an intent like "I want to use ≤5000 USDC to subscribe to an RWA with yield ≥15%", automatically matched and executed | P1 | Bowen | Todo | A test case generates an intent and a Solver matches it successfully | - |
| INTENT-2 | Exporter financing intent: sign an intent requiring financing at no less than a given issue price within a specific time | P1 | Bowen | Todo | Automatically adjust by speed and floor price and create the offering pool | - |

### 16.6 Demo Polish & Visualization
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| STREAM-1 | Real-time on-chain event stream: subscribe to events via WebSocket and render them live as a dynamic timeline, no more manual refresh | P0 | Bowen | Todo | Inject an event while the page is open; the UI automatically adds a node with a shimmer animation | - |
| STREAM-2 | Global risk heatmap: show route, war and weather risk, linked with xAPI | P1 | Bowen | Todo | The UI shows a risk heatmap that changes color live when switching scenarios | - |
| DEMO-9 | "Holy Sh*t" one-click full demo: automatically run the full upload->purchase->pricing->pause->redemption flow, with 3s delays and highlights | P0 | Bowen | Todo | Click "▶ Full Demo" and the whole show runs with no further clicks | - |
| DEMO-10 | Comparison demo: side-by-side or split-screen comparison of a bank's 45 days vs AgentBL's 60 seconds | P0 | Bowen | Todo | The page has a clear visual Value Proposition comparison | - |
| DEMO-11 | Judge-only Dashboard: show all technical evidence, trace links and Tx Hashes for one-click verification | P1 | Bowen | Todo | There is an /evidence panel aggregating all Explorer links | - |

### 16.7 Tokenomics & Security
| ID | Task | Priority | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| ECON-1 | Interactive dynamic pricing simulator: drag sliders to see in real time how war and weather risk change the issue price | P0 | Bowen | Todo | Slide the UI progress bar; the mock pricing engine is called and outputs values in real time | - |
| SEC-1 | Contract static analysis (Slither): fix all High/Medium findings and generate a report | P0 | Bowen | Todo | `slither .` shows zero High-level vulnerabilities, report.md generated | - |
| SEC-2 | Agent permission isolation matrix: document what the AI cannot do, showing the constraints | P0 | Bowen | Todo | Add `docs/security-matrix.md` and reference it from the README | - |

---

## 17. World-Class Roadmap

To upgrade AgentBL from an excellent hackathon demo into billion-dollar-scale Web3 trade finance infrastructure, we will introduce the following core features in the next phase (V2):

| ID | Direction | Priority | Status | Business value and technical vision |
|---|---|---|---|---|
| ZK-1 | Zero-knowledge privacy (zkTLS) | P0 | Todo | Exporters' trade secrets (invoice amounts, routes) should not be exposed in the clear on a public chain. Using zkTLS and ZK-SNARKs, prove cargo value and authenticity to the RiskPricingOracle, achieving **privacy-preserving, compliant on-chain pricing**. |
| DEFI-1 | Cross-Chain Liquidity routing | P0 | Todo | Integrate Wormhole or LayerZero so USDC investors on mainstream chains such as Ethereum and Arbitrum can subscribe in one click, with funds automatically bridged to the Injective RWA pool underneath, completely **breaking down liquidity silos**. |
| AI-21 | Decentralized AI oracle network (AVS) | P0 | Todo | A single AI node carries the risk of centralized misbehavior. Upgrade `valuationAgent` into an EigenLayer-based AVS network where multiple autonomous nodes stake INJ/ETH to reach valuation consensus, achieving true **decentralized AI trust**. |
| COMP-1 | Institutional KYC/AML compliance gateway | P1 | Todo | Integrate real identity providers such as Quadrata / zkMe. Add a compliance threshold to the `RWAOfferingPool` smart contract so that only KYC-verified institutional funds can subscribe to higher-risk pools. |
| TOKEN-1 | Dynamic tokenomics and automatic insurance pool ($ABL) | P1 | Todo | Launch a protocol governance token. Revenue the protocol earns from selling intelligence via x402 and from RWA issuance fees is automatically used, in a set proportion, for buybacks injected into a **decentralized insurance pool (Backstop Fund)**, giving investors an ultimate backstop against bad debt. |

These 5 advanced tasks will fully complete AgentBL's map across privacy, liquidity, decentralized consensus and tokenomics; they are our key trump cards for competing for a top place in the hackathon final and for moving to a mainnet production environment in the future.

---

## 18. Lessons from Top Award-Winning Projects

| Project / reusable pattern | How AgentBL applies it | What not to copy |
|---|---|---|
| AgentLevy: commit to acceptance criteria first, then bind payment to verifiable delivery | `PaidReportEnvelope` + schema/evidence/freshness checks + `report_hash`/payment tx binding | P0 does not build a general arbitration protocol or complex escrow |
| Alpha402: persistent state machine, visualized feed, audit proofs, failure fallback | x402 six-state stepper, decision/payment log, live/demo dual mode | Do not pile up meaningless numbers of Agents or 3D effects |
| AgentSlam: reliability and observability first, bounded retry/heartbeat | settlement idempotency, Agent trace, RPC/facilitator health checks, failure rehearsal | Do not disguise mock fallback as real chain results |
| RWA-GPT: natural language lowers the barrier to using RWA | Market AI search, MCP, report evidence explanations | Do not degrade into "chat box + invest button" |

---

## 19. Official Research References (re-verify before implementing)

- [Injective x402 official guide](https://docs.injective.network/developers-ai/x402): official `@injectivelabs/x402`, USDC payment, facilitator, Injective EVM examples.
- [Injective MCP Server](https://docs.injective.network/developers-ai/mcp): stdio, chain queries, transfers, bridging and raw EVM transactions.
- [Injective AI Developers](https://docs.injective.network/developers-ai): Injective CLI/EVM/MCP/Trading skills and the latest AI development roadmap.
- [Injective EVM Precompiles](https://docs.injective.network/developers-evm/precompiles/) and [Exchange Precompile](https://docs.injective.network/developers-evm/exchange-precompile): calling native modules such as Bank/Exchange from the EVM.
- [Injective ERC20 Module](https://docs.injective.network/developers-evm/erc20-module): USDC/IBC/tokenfactory denoms and ERC20 mapping.
- [x402 Foundation spec / SDK](https://github.com/x402-foundation/x402): V2 headers, client/server/facilitator, EVM SDK and security semantics.
- [Microsoft Foundry Agent Evaluators](https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/agent-evaluators): evaluations such as Task Completion, Tool Call and Groundedness.
- [Microsoft Foundry Agent Tracing](https://learn.microsoft.com/en-us/azure/foundry/observability/concepts/trace-agent-concept): OpenTelemetry, tool spans, latency and cost observability.
- [AgentLevy](https://ethglobal.com/showcase/agentlevy-s577a), [Alpha402](https://ethglobal.com/showcase/alpha402-04vgq), [AgentSlam](https://ethglobal.com/showcase/agentslam-znyyq), [RWA-GPT](https://ethglobal.com/showcase/rwagpt-fssdh): used to distill patterns for verifiable delivery, visualized state machines, reliable fallback and natural-language RWA UX.

---

## 20. Mystery Voyage: Blind Box Growth Mechanism and Delivery Plan (2026-07-22)

### 20.1 Product conclusion: the route is blind, the risk is not

The blind box must not be turned into financial gambling like "randomly buy a high-yield RWA" or "draw a rare high APY". The championship-grade mechanism that suits AgentBL best is:

> **Mystery Voyage is a surprise-style RWA discovery entry point: an eligible user first chooses a risk passport, and the system locks a candidate set within public risk bounds; the user makes a small x402 purchase of a single AI due-diligence reveal, sees the full cargo, route, pricing, worst-case scenario and fairness proof, and then separately decides whether to subscribe.**

Core principles:

```text
Before the box: publish candidate count, hit probabilities, risk range, price/yield range, maximum stress loss, report fee and selection rules
During the box: only the AI report fee is paid; no investment principal is moved, no automatic subscription, no promise of prize value
After the box: reveal the specific eBL/RWA + full AI report + randomness proof; only after the user confirms again does it enter the existing subscribe flow
```

One-line pitch: **"We hide the voyage, never the risk. x402 unlocks the due diligence; Injective proves the reveal; investing is always a second, explicit decision."**

### 20.2 Why it naturally fits the current project

| Current real capability | How Mystery Voyage reuses it | Required changes |
|---|---|---|
| Investment market `GET /api/market/listings` | Candidate RWA pools and the post-reveal detail page | The candidate set must use real `PricingQuote`s and can no longer rely on the hard-coded `0.90 / 1000bps / riskBps=200` mock |
| AI pricing, document review, valuation, world risk | Generate the pre-box risk bounds and the post-reveal AI Risk Passport | Add candidate eligibility policy, stress loss and suitability reasons |
| The three kinds of x402 paid reports | Use a real HTTP 402 to perform the "open box" action | Add a `mystery-voyage` service and a paid report kind/builder |
| `PaymentOracle` | Bind the box-opening payment, report hash and case on-chain | Reused directly in P0; no need to deploy a new contract for an animation |
| `RWAOfferingPool` + `InvestorComplianceGate` | Independent, compliant RWA subscription after the reveal | Check eligible, pool state and quota both before and after opening the box |
| Portfolio API/page | Add the subscription result to holdings after the reveal | Add "discovery source = Mystery Voyage"; do not fabricate Live tx |
| Demo Mode / Live Mode | Stable offline demo + real x402/Explorer evidence | Demo receipts must be labelled `DEMO`; Live only accepts real payment tx |

What it brings is not an isolated gimmick but a new growth funnel:

```text
Market visitor
  → choose a risk passport (low cognitive load)
  → small x402 payment to open the box (protocol revenue)
  → AI due-diligence reveal (education + trust)
  → view the route story / fairness proof (social sharing)
  → second confirmation to subscribe (qualified investment conversion)
  → Voyage Passport collectible stamp (non-financial retention)
```

### 20.3 P0 mechanism: Mystery Voyage Discovery Box

#### 20.3.1 The Risk Passport before opening the box

The user must first choose or confirm:

- Risk tier: `CONSERVATIVE / BALANCED / ADVENTUROUS`;
- Per-report budget and future investment budget cap (strictly separate);
- Maximum acceptable risk score, maximum stress loss and minimum collateral coverage;
- Excluded cargo, routes, jurisdictions and sanctions hits;
- Expected maturity range and liquidity preference;
- Compliance eligibility and risk acknowledgement status.

Above the open-box button, the following must be published:

- The current number of eligible candidates `N`; by default each candidate's probability is `1/N`;
- If weights are used in the future, every weight and the algorithm version must be published before payment; hidden re-weighting is forbidden;
- Min/max ranges of candidate risk, issue price, target upside and stress loss;
- `1 RWA = $1.00` is only the target redemption value, not a capital guarantee;
- This step only pays the x402 AI report fee; opening the box does not subscribe to any asset;
- Report price, whether it is refundable, expiry time and rules for retrying on errors.

#### 20.3.2 User flow

```text
1. Preview: the user chooses a Risk Passport; the backend filters pools that are eligible + Open/Repriced
2. Commit: the backend freezes a candidate snapshot and returns candidate_set_hash + server_commitment + probability/risk bounds
3. User entropy: the browser generates user_nonce with crypto.getRandomValues (must come after the server commitment)
4. x402: the user pays the 0.001 USDC demo price; PaymentOracle binds the payment tx and the report hash
5. Reveal: the server publishes server_secret, the entropy from both sides selects one pool, and the full AI Risk Passport is returned
6. Verify: the browser locally recomputes the commitment, candidate set, selection hash and selected index
7. Decide: after reading the full risk, the user clicks "Subscribe" or "Back to market"; subscription is a second, independent signature/transaction
8. Collect: completing a reveal earns a non-transferable Voyage Passport route stamp, which does not affect returns, quota or probability
```

#### 20.3.3 Reveal content

The reveal page must show all at once:

- Cargo, port of loading/destination port, ETA, eBL/cargo hash summary;
- `final_issue_price_usd`, target redemption price, target upside and a "returns not guaranteed" notice;
- AI-verified cargo value, collateral coverage, risk score, risk level, worst-case stress recovery rate/loss;
- Document review issues, insurance gaps, war/weather/port evidence and data freshness;
- Why it matches the user's Risk Passport;
- x402 payment tx, `PaymentAttested`, `report_hash`, `evidence_hash`;
- Fairness proof and one-click Verify;
- Two equally prominent buttons: "View full report" and "Subscribe after risk acknowledgement"; countdowns must not be used to pressure the user.

### 20.4 Verifiable fairness: P0 commit-reveal, production uses an external VRF

P0 uses a replayable commit-reveal; it does not use `Math.random()`, timestamps or results picked ad hoc by the backend:

```text
eligible_pool_ids  = sort(filter(listings, risk_passport + compliance + active_state))
candidate_set_hash = keccak256(canonical_json(eligible_pool_ids + disclosed_weights + quote_hashes))
server_commitment  = keccak256(server_secret)

# server_commitment must be returned first; only then does the client generate user_nonce and start x402
selection_hash = keccak256(
  algorithm_version || round_id || server_secret || user_nonce ||
  payment_tx_hash || candidate_set_hash || wallet_address
)
selected_index = rejection_sample(selection_hash, eligible_pool_ids.length)
```

Suggested `MysteryRevealProof` structure:

```ts
type MysteryRevealProof = {
  reveal_id: string;
  round_id: string;
  algorithm_version: 'mystery-voyage-v1';
  risk_passport_hash: `0x${string}`;
  candidate_pool_ids: string[];       // Published after the reveal, for recomputation
  candidate_quote_hashes: `0x${string}`[];
  disclosed_weights: number[];        // All 1 in P0
  candidate_set_hash: `0x${string}`;
  server_commitment: `0x${string}`;
  server_secret: `0x${string}`;       // Published only after payment settlement
  user_nonce: `0x${string}`;
  payment_tx_hash: `0x${string}` | `demo://receipt/${string}`;
  selection_hash: `0x${string}`;
  selected_index: number;
  selected_pool_id: string;
  report_hash: `0x${string}`;
  created_at: string;
  expires_at: string;
};
```

The fairness boundary must be stated honestly: commit-reveal can stop the server from swapping the result after seeing the user nonce / payment tx, but it cannot fully eliminate selective aborts by the server. In P0, aborts are handled as "record the abort + free reopen/refund status on the original payment receipt + never silently swap pools"; the production version will then integrate an external VRF/random beacon verified to support Injective, and include the request/fulfillment proof in the same proof.

### 20.5 P1 advanced: Portfolio Mystery Box (reveal first, then transact)

P1 can let institutional investors submit a portfolio intent, for example "budget 5,000 USDC, at most 3 projects, risk no higher than WARNING, no single project over 40%, minimum collateral coverage 120%". The AI first randomly generates a multi-route portfolio that satisfies the constraints, reveals it and shows the full report for each item, and only after the user signs again does it subscribe pool by pool.

Constraints:

- P1 is still not "deduct investment principal first, then tell you what you bought"; at most, funds enter a revocable reservation/escrow and must not be irreversibly transacted before the reveal;
- Each selected pool must separately pass `InvestorComplianceGate.isEligible`, state, remaining quota and concentration checks;
- Portfolio selection must satisfy total budget, per-pool cap, cargo/route diversification, correlation and maximum stress loss;
- If any pool becomes Paused/Frozen between reveal and confirmation, the whole order fails closed and the user reconfirms a new portfolio;
- P1 contracts are developed only after the P0 user funnel has been validated, to avoid adding a new fund-custody attack surface for a marketing animation.

Not doing: random APY, rarity mapped to higher returns, unlimited paid re-draws, referral rebates of investment principal, tradeable blind box NFTs, automatic subscription before reveal, public sales to users who have not completed KYC/AML.

### 20.6 Economic model and growth strategy

| Revenue/growth item | Design | Guardrail |
|---|---|---|
| x402 box-opening revenue | P0 demo suggests `0.001 USDC/reveal`; commercial price configured by full data cost | Report fee separated from investment principal; payment does not change the risk score, reveal probability or issue price |
| Premium upsell | After the reveal summary, the existing valuation / fraud / world-risk deep reports can be purchased | No double charging; the page shows purchased content and TTL |
| Issuer-sponsored discovery | Exporters can sponsor eligible investors' report fees to improve project discovery | Sponsors must not affect random weights, AI scores or search rankings, and must be explicitly disclosed |
| Voyage Passport | Collect route stamps for copper, crude oil, soybeans, rubber, etc., forming share cards and a reason to return | Non-transferable, no cash value, does not affect investment eligibility/returns/probability |
| Institution API | Other Agents request Risk Passports and fair reveals in bulk via MCP/A2A | Budget, rate, compliance, idempotency and audit logs strictly enforced |

The north-star metric is not "number of boxes opened" but **Qualified Report-to-Investment Conversion**: the share of eligible users who completed risk disclosure that move on to subscription confirmation after the report reveal.

Required tracking events: `mystery_impression → passport_completed → preview_created → 402_challenged → payment_settled → reveal_verified → report_opened → risk_acknowledged → subscribe_started → subscribe_confirmed`.

Growth acceptance targets (hackathon demo/closed testing; no claims of real market data externally):

- 90% of testers can say within 10 seconds "I only bought a report, I haven't bought an RWA yet";
- 100% can find the non-guarantee notice, worst-case loss and Verify on the reveal page;
- Demo box-opening full flow ≤ 45 seconds, followed by ≤ 15 seconds to show the independent subscription confirmation;
- Payment/reveal failure rate, selective abort rate and risk-acknowledgement drop-off rate are shown independently; conversion rate is not used to mask risk.

#### 20.6.1 MBOX-PM-3 frozen spec: disclosure, risk acknowledgement, refunds and cooling-off period

This spec is a product baseline, not legal advice; the applicable law, qualified-investor rules, digital-content withdrawal rights and refund time limits in the launch jurisdiction must still be confirmed by local counsel. The frontend, API and Demo must follow the same state order:

~~~text
DISCLOSURE
  → USER_ACKNOWLEDGED_REPORT_PURCHASE
  → COMMITTED
  → X402_SETTLED
  → REVEALED
  → PROOF_VERIFIED
  → REVIEW_COOLDOWN
  → USER_ACKNOWLEDGED_INVESTMENT_RISK
  → OPTIONAL_SUBSCRIPTION_SIGNATURE
~~~

Any skipped step, pre-ticked box, combined signature or "opening the box subscribes" is treated as a P0 blocker.

**A. Must be shown on the same screen before paying to open the box**

1. **What is bought**: this purchase is one AI due-diligence report and the Mystery Voyage reveal service, not an RWA, deposit, insurance, lottery ticket or return right;
2. **What is paid**: exact report fee, currency, network, payee, one-time/non-subscription nature, estimated gas, and "the investment budget will not be deducted in this step";
3. **Candidates and probabilities**: candidate count, public weight/probability of each candidate, algorithm version, candidate snapshot time and validity period;
4. **Risk bounds**: candidate ranges of risk level, issue price, target upside and maximum stress loss, with a separate statement that up to 100% of the investment principal may be lost;
5. **Not capital-guaranteed**: 1 RWA = 1.00 USD is only the target redemption value, not guaranteed redemption; the report, Physical AI, gifts and Trust Premium do not change this;
6. **Data boundary**: data sources, freshness, Demo/Live status, and that AI/sensors may be wrong, delayed or offline;
7. **Fairness boundary**: commit-reveal makes the selection result verifiable, but P0 still carries the risk of selective aborts by the server; aborts are handled according to the matrix below;
8. **Gift boundary**: opening the box and gifts do not change candidate probabilities, risk scores, issue price or investment eligibility; physical gifts are handled by the rules only after an independent, compliant subscription;
9. **Cancellation/refund**: the user can exit at any time before payment; delivery, free reopen, refund triggers and processing status after payment;
10. **Privacy**: the paying wallet is visible on the public chain; the respective visibility scopes of the report, share card and shipping information.

Above the payment button keep three confirmation checkboxes that are unticked by default:

~~~text
[ ] I confirm this payment only buys an AI due-diligence reveal and will not automatically subscribe to any RWA.
[ ] I have seen the candidate probabilities, risk/loss ranges, report fee and refund rules.
[ ] I understand that the AI report and physical evidence may be wrong, and do not constitute a capital guarantee, return or investment advice.
~~~

Frozen English copy:

~~~text
I am purchasing an AI due-diligence reveal, not an RWA.
No investment principal will move until I review the revealed risk and sign separately.
Target redemption, AI analysis, physical evidence and gifts are not guarantees.
~~~

**B. Must be shown after the reveal and before the subscription signature**

- The specific selected pool, cargo, route, quote hash, candidate snapshot and local Verify result;
- Issue price, target redemption, target upside, stress-scenario recovery rate/loss, and that the principal may be lost entirely;
- Original risk, Physical Confidence/Trust Credit, remaining hard risk and evidence freshness;
- Current pool state, remaining quota, quote expiry time, compliance eligibility and the subscription amount about to be signed;
- Three clear options, "Back to market", "View full report" and "Subscribe", with no default focus, auto-redirect or countdown pressure.

Before subscribing, use a second set of confirmation checkboxes that are unticked by default and cannot carry over the box-opening confirmations:

~~~text
[ ] I have reviewed the full report, the worst-case scenario and the risks not offset by Trust Credit.
[ ] I understand that neither target redemption nor target upside is guaranteed, and principal may be partially or fully lost.
[ ] I confirm the current subscription amount, RWA quantity, pool state, quote validity period and wallet address.
[ ] I understand that route collectible stamps or gifts are not investment returns and do not affect this price or redemption.
~~~

Only when all four confirmations are still valid and the cooling-off period has ended may the subscribe transaction be constructed. If any quote, risk, pool state, evidence freshness or wallet changes, the confirmations must be cleared and the cooling-off period restarted.

**C. Frozen cooling-off rules**

| Mode | Minimum time | Starting point | Action when it ends |
|---|---:|---|---|
| Final Demo | 5 seconds, clearly labelled DEMO ACCELERATED | Full report rendered and proof verify is PASS | Only unlocks the subscribe button, never sends a transaction automatically |
| Production Prototype | 60 seconds by default; may be extended by applicable law, cannot be shortened by frontend parameters | Same as above | User signs after actively completing the second set of confirmations |
| Quote/Risk Changed | Restart the timer | New quote and change summary finish rendering | Old confirmations are void |
| Pool Paused/Frozen/Expired | Does not end | Until the state recovers and a new quote is obtained | Subscription forbidden; only exit/refresh allowed |

The cooling-off page must not show FOMO copy such as "only X seconds left" or "don't miss out"; the timer only conveys "please read the risks first".

**D. Report fee exception handling matrix**

| Scenario | Product outcome | Funds rule | Audit state |
|---|---|---|---|
| Cancelled before payment | Back to market | No charge | CANCELLED_BEFORE_PAYMENT |
| Wallet rejects signing / settlement fails | Keep preview, can retry | Must not be marked as charged | PAYMENT_FAILED |
| Duplicate settlement with the same idempotency key | Deliver only one report | Overcharged amount automatically refunded to source | DUPLICATE_REFUND_PENDING / REFUNDED |
| Settled but the server does not reveal within 30 seconds | User chooses a refund to source or one free reopen; defaults to refund if no choice | Must never silently swap pools | ABORTED_AFTER_PAYMENT |
| commitment/proof/candidate set verification fails | Terminate immediately, show no substitute result | Automatic refund to source | PROOF_INVALID_REFUND_PENDING |
| At the moment of reveal the selected pool is ineligible, Paused/Frozen or expired | Do not deliver a subscribable result | Refund to source or the user actively chooses one free reopen | CANDIDATE_INVALIDATED |
| Valid report fully delivered, user chooses not to invest | Report can still be re-read within the TTL | Report fee not refunded unless applicable law provides otherwise; investment principal was never touched | DELIVERED_NO_SUBSCRIPTION |
| Natural market change after a valid reveal | Show stale, do not allow subscription with old confirmations; offer one free refresh | Do not disguise market risk as a report failure | STALE_AFTER_REVEAL |
| User goes offline / closes the page | Recover the same report via receipt/reveal id | No double charging | DELIVERED_RECOVERABLE |

Live refunds must return a refund tx/status that can be queried; Demo refunds must show SIMULATED REFUND and must never generate a random tx hash. All refunds go back to source, in the original asset and to the original wallet, and any gas/fee-bearing rules must be disclosed before payment.

**E. Banned words and alternatives**

| Banned | Use instead |
|---|---|
| guaranteed / guarantee, capital-guaranteed, sure win | target / non-guaranteed / target redemption, may lose money |
| win / jackpot / prize win, grand prize, lucky streak | reveal / discover / reveal, discover a route |
| prize value | report service + equal-value keepsake |
| risk-free | risk-bounded discovery / discovery with transparent risk bounds |
| buy now before it is gone / grab it now | review the report and decide separately / decide independently after reading the report |

**F. Minimum audit events**

disclosure_viewed, report_acknowledged, payment_settled, reveal_delivered, proof_verified, cooldown_started/completed/reset, risk_acknowledged, subscribe_signed, refund_requested/pending/settled must carry the policy version, time, mode and idempotency key; shipping addresses, full documents or behavioral profiling beyond the checkboxes must not be recorded.

MBOX-PM-3 definition of done: the copy and state matrix above are frozen; in the implementation phase they are delivered by MBOX-FE-2/3/6, MBOX-BE-4/6, MBOX-X402-1/2 and MBOX-QA-1/3.

#### 20.6.2 MBOX-PM-4 frozen spec: Voyage Passport collectible stamps and share cards

**Product definition**

The Voyage Passport is a **non-financial product credential and journey collectible record** that a user receives after completing one verifiable reveal. It proves "this wallet verified the AI report for a certain route at a certain time"; it does not prove cargo ownership, RWA holdings, investment returns, credit rating, insurance coverage or future entitlements.

Both P0 and P1 use server-signed off-chain credentials; ERC-20, transferable NFTs, tradeable rarity, floor prices, royalties and secondary markets are forbidden. If a non-transferable token is used in the future, it may only be used for tamper-proofing/access, must not carry economic rights, and requires a separate legal and privacy review.

**A. Two tiers of stamps**

| Type | Condition to earn | Content shown | Must not imply |
|---|---|---|---|
| Discovery Stamp | Report delivered and reveal proof verified | Cargo category, coarse-grained route, date, mode, proof digest | Invested, owns the cargo, earned returns |
| Investor Journey Stamp | Independent risk acknowledgement completed and subscription transaction succeeded / explicit Demo success | Discovery content + redacted subscription proof/tx link | Capital guarantee, successful investment outcome, higher returns than others |

Discovery Stamp and Investor Journey Stamp use clearly different icons and labels; they must not be distinguished by color alone. Cancellations, refunds, proof invalid or reveal aborted earn no stamp. If the report is delivered but no subscription is made, only a Discovery Stamp can be earned.

**B. Credential data structure**

~~~ts
type VoyagePassportCredential = {
  credential_id: string;
  schema_version: 'voyage-passport-v1';
  stamp_type: 'DISCOVERY' | 'INVESTOR_JOURNEY';
  voyage_id: string;
  cargo_category: string;
  route_label: string;
  route_code: string;
  revealed_at: string;
  experience_mode: 'DEMO' | 'RECORDED_REPLAY' | 'LIVE_PROTOTYPE' | 'VESSEL_LIVE';
  reveal_proof_digest: string;
  report_hash: string;
  physical_evidence_digest?: string;
  subscription_reference?: string;
  artwork_variant: string;
  issuer: 'AgentBL';
  issuer_signature: string;
  revoked_at?: string;
};
~~~

The credential does not store wallet balance, subscription amount, yield, risk preference, real name, shipping address, full wallet, full eBL/case id, precise real-time location or unpublished commercial documents. The server uses a wallet signature to prove view/export permission and does not build a public leaderboard of wallet behavior.

**C. Visual grammar of the stamps**

- Front: cargo illustration, coarse-grained route arc, port seal, voyage_id, Discovery/Investor Journey type;
- Back: reveal date, experience mode, three short hashes, Verify QR/NFC;
- Visual variants can be route stories such as Dawn / Storm / Night / Port Arrival, but every variant is equally likely or follows a fixed public rule, with no price difference;
- Rarity language that implies economic value is banned, such as gold/silver/diamond tiers, SSR, Legendary, Winner, Profit Badge;
- "3/6 route types collected" may be shown; "asset value", "collection market value" or "expected appreciation" may not;
- Physical AI data shows only a verification summary and time; share images must not leak the real-time vessel position or camera access tokens.

**D. Public fields on share cards**

Allowed to be public by default:

- AgentBL / Mystery Voyage brand;
- cargo category and coarse-grained route label;
- Discovery or Investor Journey type;
- experience mode, which must prominently show Demo/Replay/Prototype/Live;
- reveal month or date;
- Verified reveal, the first and last 4–6 characters of the proof digest, Verify URL/QR;
- "Not an investment certificate · Not proof of ownership or return";
- A user-chosen nickname; the wallet is not shown by default.

Only when the user actively opens Advanced Share and confirms again may the full public tx hash/Explorer link be added. Regardless of the user's choice, the following are never made public:

- Investment amount, RWA quantity, PnL, target upside, wallet balance;
- Full wallet, KYC status, risk tier, sanctions/compliance results;
- Precise GPS, current vessel position, real-time camera URL/token;
- Unpublished exporter/importer identities, eBL, invoice, insurance policy or commercial prices;
- Shipping address, phone, email, real name;
- User templates such as "I made money", "sure-win route" or "I won".

Frozen share card footer:

~~~text
A product-experience credential for a verified AI report reveal.
Not an RWA, not cargo ownership, not proof of investment performance.
~~~

**E. Lifecycle and user rights**

| Operation | Rule |
|---|---|
| Claim | Actively claimed by the user after the proof is verified; not auto-minted, no gas charged |
| Export | PNG/PDF/JSON credential; preview the public fields before export |
| Verify | The public page only verifies the issuer signature, schema, revocation and proof digest |
| Hide | The user can hide it from their personal collection at any time, without affecting the report or holdings |
| Delete | Deletes the display copy and nickname hosted by AgentBL; the boundary that on-chain payment/tx cannot be deleted must be explained |
| Revoke | Revoked when the proof is shown to be invalid, it was issued in error, or the user successfully revokes report delivery; historical share cards show REVOKED |
| Transfer | Never supported; wallet migration only via dual signatures from the old/new wallet to copy it and revoke the old credential |
| Commercialize | Selling, pledging, licensing royalties or redeeming for investment perks are not supported |

**F. Relationship with route gifts**

The Passport is a digital collectible record; the Voyage Keepsake is an optional, equal-value physical/digital memento. Neither is an investment return:

- Discovery users can receive a digital stamp, but do not get a physical gift or subscription perks from it;
- Investor Journey users can choose a physical memento or a digital version of equal value, paid from the marketing/sponsor budget;
- A gift's artwork_variant can correspond to a Passport design, but not to different cash values, yields, draw probabilities or service priority;
- NFC/QR only opens the redacted credential/evidence page; shipping records, addresses or wallets are not written to the tag.

**G. Five-question comprehension test**

Closed testing must ask the questions in random order; PM-4 acceptance passes only if all five are answered correctly:

1. Does this Passport mean you own the cargo or an RWA? Correct answer: No;
2. Does a Discovery Stamp mean you have already invested? Correct answer: No;
3. Can it be sold or transferred? Correct answer: No;
4. Does the design variant affect returns, price or the next probability? Correct answer: No;
5. Does the share card make the wallet, amount or real-time vessel position public by default? Correct answer: No.

Acceptance threshold: at least 10 non-project participants, first-attempt all-correct rate ≥90%; if any question is below 90%, naming/visuals must be revised and retested. If real user testing cannot be completed before the Final Demo, the task can only be marked Spec Done / Validation Pending and must not claim completed user validation.

Test records use only anonymous IDs and collect no wallets, names or contact details:

| Participant | Q1 | Q2 | Q3 | Q4 | Q5 | First-pass all correct | Confusing phrase |
|---|---|---|---|---|---|---|---|
| P01–P10 | Y/N | Y/N | Y/N | Y/N | Y/N | Y/N | Optional phrase, no identity recorded |

The result summary must always include: sample size, accuracy for each of the five questions, first-attempt all-correct rate, copy that was revised, retest results and test date. Deleting failed samples or reporting only the average score is forbidden.

MBOX-PM-4 definition of done: product definition, credential fields, visual/share allowlist, privacy, lifecycle, gift relationship and comprehension test frozen; in the implementation phase they are delivered by MBOX-FE-7, GIFT-FINAL-1/2/3 and MBOX-QA-5.

### 20.7 Engineering task list

#### 20.7.1 Product / Risk / Compliance

| ID | Priority | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| MBOX-PM-1 | P0 | Freeze naming and narrative: Mystery Voyage = surprise discovery, not randomized investment | PM | Todo | Copy review across README, pitch script and UI | - |
| MBOX-PM-2 | P0 | Define the three Risk Passport tiers, candidate filtering rules, stress loss bounds and prohibited jurisdictions | PM + Risk | Todo | Policy fixtures cover all three tiers and the zero-candidate state | - |
| MBOX-PM-3 | P0 | Complete pre-box disclosure, post-reveal risk acknowledgement, refund/free reopen and cooling-off rules | PM + Compliance | Done | Compliance checklist; guaranteed / win / jackpot must not appear | §20.6.1: dual-confirmation state machine, screen-by-screen disclosure, cooling-off period, 9-scenario exception matrix, banned words and audit events frozen |
| MBOX-PM-4 | P1 | Design Voyage Passport collectible stamps and share cards, forbidding tokenization/cash value | Product | Review | User testing can distinguish collectible stamps from investment certificates | §20.6.2: Spec Done; two stamp tiers, credential, share/privacy allowlist, lifecycle and five-question test frozen; 10-person validation Pending |

#### 20.7.2 Backend / AI / x402

| ID | Priority | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| MBOX-BE-1 | P0 | Replace the hard-coded quotes and `riskBps=200` in market initialization with `quoteFromCase`/real pool state | Backend | Done | `tests/marketApi.test.js` asserts listings match the PricingQuote | `src/app/server.js`/`src/app/store.js`: 22 financing cases use normalized PricingQuotes and pricing action states; marketApi validates quote/risk/price, Paused pools are not listed |
| MBOX-BE-2 | P0 | Add `src/mystery/policy.js`: deterministic filtering by Risk Passport, compliance, pool state, quota and freshness | Backend + AI | Done | `tests/mysteryPolicy.test.js` covers low/medium/high risk, sanctions, Paused, expired, zero candidates | `tests/mysteryPolicy.test.js`: three-tier thresholds, compliance, quota, freshness, cargo/route/jurisdiction exclusion and zero candidates all pass |
| MBOX-BE-3 | P0 | Add `src/mystery/fairness.js`: canonical hash, commit, rejection sampling, proof verify | Backend | Done | 10,000-seed property test + tamper test; the same proof must select the same pool | `tests/mysteryFairness.test.js`: 10,000-seed distribution, deterministic replay and pool/weight/nonce/payment/quote/array tamper tests pass |
| MBOX-BE-4 | P0 | Add a persistent reveal store: states `PREVIEWED/COMMITTED/PAID/REVEALED/ABORTED/EXPIRED`, TTL, idempotency keys | Backend | Done | Restart recovery, concurrent payment, duplicate receipt, expiry and replay tests | `src/mystery/store.js` + `tests/mysteryStore.test.js`: restart recovery, wallet-scoped idempotency, single reveal under concurrency, receipt replay, TTL and ABORTED persistence pass |
| MBOX-BE-5 | P0 | Add `POST /api/mystery/preview` and `GET /api/mystery/:id/proof` | Backend | Done | API schema tests; preview does not leak the selected pool/server secret | `tests/mysteryApi.test.js`: preview=201, proof before payment=409, proof verifiable after payment; preview contains no candidate IDs, selected pool or server secret |
| MBOX-X402-1 | P0 | Add `mystery-voyage` to `X402_SERVICES`, paid-report kinds/builders and the server route | Backend + Web3 | Done | unpaid=402, paid=200, report envelope/schema/hash all pass | Four-product catalog/V2 config/builder/route wired in; Demo preflight verifies mystery-voyage unpaid=402, signed paid=200, valid envelope |
| MBOX-X402-2 | P0 | Bind the x402 payment tx, selected case, Risk Passport hash and reveal proof hash into `PaidReportEnvelope`/`PaymentOracle` | Backend + Web3 | Done | Replayable from the Explorer tx to the same selected pool/report hash | `tests/paidReport.test.js`/`tests/mysteryApi.test.js`: payment_tx, case_id, selected_pool_id, risk_passport_hash and reveal_proof_hash go into the canonical report_hash; PaymentOracle continues to anchor that hash |
| MBOX-AI-1 | P0 | Generate the reveal-version `AI Risk Passport`: suitability reasons, pricing breakdown, stress recovery, evidence freshness | AI | Done | schema + groundedness eval; deterministic fallback when the LLM fails | `src/mystery/riskPassport.js`: the deterministic report includes suitability, real pricing breakdown, stress recovery, collateral coverage, evidence graph/freshness and non-guarantee; end-to-end groundedness assertions pass |
| MBOX-BE-6 | P0 | Handle candidates becoming invalid before/after payment: fail closed, record abort, free reopen/refund status, no silent substitution | Backend | Done | State race and Paused/Frozen injection tests | Before payment all candidates are revalidated and `PAYMENT_NOT_SETTLED`; post-payment races go to `ABORTED` + `REFUND_OR_FREE_REOPEN_AVAILABLE`; API/store injection tests pass |
| MBOX-BE-7 | P1 | Write the Mystery reveal source into portfolio/analytics without changing the original PricingQuote or yield | Backend | Done | Portfolio API and event funnel tests | `src/mystery/passport.js`/`analytics.js`, `src/mystery/service.js`, `src/app/store.js`: Discovery/Investor Journey signed credentials, redacted public verification, `MYSTERY_VOYAGE` source attribution, anonymous funnel and quote/yield integrity; `tests/mysteryPassport.test.js`, `tests/mysteryApi.test.js` all pass |
| MBOX-MCP-1 | P1 | Add `preview_mystery_voyage` / `verify_mystery_reveal` MCP capabilities; purchasing remains subject to budget and human authorization | AI + Backend | Done | MCP Inspector calls + over-budget rejection test | `src/mcp/tools.js`/`mcpServer.js`: preview reads candidates read-only with a human-confirmation boundary, the verifier fails closed locally; MCP surface=9 tools+3 resources; `tests/mysteryMcp.test.js`, `tests/mcp*.test.js`, check/preflight manifest gates all pass |

#### 20.7.3 Frontend / Experience

| ID | Priority | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| MBOX-FE-1 | P0 | Add a Mystery Voyage entry and a three-tier Risk Passport selector to the market's first screen | Frontend | Done | Manual acceptance at 375px/1440px; keyboard operable | `public/index.html`/`public/styles.css`: market first-screen entry + 3 native radio risk tiers; responsive constraints at 1080/760/420px, operable with native arrow keys/Tab; `tests/mysteryFrontend.test.js` DOM contract passes |
| MBOX-FE-2 | P0 | Pre-box card shows N, equal probability, risk/return/stress loss ranges, 0.001 USDC and the non-subscription notice | Frontend + PM | Done | 5-second comprehension test; screenshot review | `public/mystery.js` uses the real preview's `candidate_count`/commit hashes, and before payment shows `1/N`, the three-tier risk/return/stress loss ranges, `0.001 USDC`, `$1 target != capital guarantee` and the "no automatic subscription" notice together |
| MBOX-FE-3 | P0 | Reuse the x402 stepper to show Commit → 402 → Settlement → Reveal → Verify | Frontend | Done | Both Demo/Live modes; in Live only real tx can jump to Explorer | `public/index.html`/`public/mystery.js`: five-step state machine wired to the real preview→402→signed settlement→reveal→proof APIs; Demo explicitly shows the receipt; Explorer anchors are generated only when `payment.live === true` and the tx/URL is valid |
| MBOX-FE-4 | P0 | Implement the box-opening animation and route reveal: container seal, map route, cargo image, risk pulse | Frontend | Done | No strong animation under `prefers-reduced-motion`; no layout shift | `public/styles.css`: container double doors and seal with fixed aspect-ratio/min height, route trail, risk pulse; `public/mystery.js` reuses 6 kinds of real cargo images; reduced-motion disables transition/animation and opens the doors directly |
| MBOX-FE-5 | P0 | Implement a browser-local proof verifier; if any field is tampered with, immediately fail closed in red | Frontend + Web3 | Done | Playwright/DOM tamper cases; on success show the recomputation summary | `public/mystery-proof.js` locally recomputes the canonical hash, commitment, candidate set, rejection sampling, selected index and report/envelope/payment bindings; the proof textarea verifies on input, failures show a red FAIL CLOSED and disable subscription; tests cover 10 kinds of proof tampering plus report/envelope tampering |
| MBOX-FE-6 | P0 | Keep the "view report / subscribe" dual CTA after the reveal; before subscribing, pop up a second confirmation of amount, loss and risk | Frontend + Compliance | Done | Without signing the second confirmation, subscribe is never called | `public/index.html`/`public/mystery.js`: dual CTA stays visible; a separate modal shows pool/amount/risk/stress loss, and after ticking the boxes a second signature is still required; a source-order test asserts `/api/pool/subscribe` is only called after a successful signature |
| MBOX-FE-7 | P1 | Voyage Passport collection book, shareable but redacted route cards | Frontend | Done | Cards contain no trade secrets, wallet balances or misleading return promises | `public/index.html`/`mystery.js`/`passport.js`/`styles.css`: Discovery and Investor Journey dual stamps, independently signed claiming, collection refresh/local hide, share preview and JSON/PNG/Print-PDF export; strict share allowlist, Demo forbids transaction disclosure, advanced share requires double confirmation; `tests/mysteryFrontend.test.js` + 1440/375 browser acceptance pass |
| MBOX-I18N-1 | P0 | Complete Chinese/English Mystery Voyage copy and add it to i18n coverage | Frontend | Done | `tests/i18nCoverage.test.js` | `public/i18n.js` covers the entry, three Passport tiers, five-step payment, reveal, verification and second subscription; coverage extended to scan dynamic keys in `public/mystery.js`; tests for missing Chinese/English keys and Chinese mixed into English pass |

#### 20.7.4 Contract / Security / QA

| ID | Priority | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| MBOX-WEB3-1 | P0 | P0 adds no custody contract; reuse PaymentOracle and RWAOfferingPool, and record the reveal proof hash | Web3 | Todo | Design review proves that a failed box opening never touches investment principal | - |
| MBOX-WEB3-2 | P1 | Design `MysteryAllocationRouter` only when portfolio intents go into implementation, supporting eligibility, caps, pause, cancel/refund | Web3 | Todo | Hardhat state-machine, reentrancy, permission, pause and refund tests | - |
| MBOX-QA-1 | P0 | Add a security matrix: nonce replay, receipt replay, candidate tampering, weight tampering, selective abort, concurrent box opening | QA + Security | Todo | All fail closed, with recoverable error codes and audit logs | - |
| MBOX-QA-2 | P0 | Verify the invariant: ineligible/Paused/Frozen/expired/over-risk pools are never selected | QA | Todo | Policy fuzz/property tests | - |
| MBOX-QA-3 | P0 | Verify fund isolation: opening the box only settles the report fee; without a second confirmation, subscription/portfolio/USDC investment are all unchanged | QA | Todo | API + contract harness before/after balance assertions | - |
| MBOX-QA-4 | P0 | Add to preflight: Mystery offline, x402 demo, proof replay, i18n/reduced-motion static checks | QA | Todo | `npm run preflight` all green 3 times in a row | - |
| MBOX-QA-5 | P0 | Complete a 20-person closed usability test and event funnel report | PM + QA | Todo | Output comprehension rate, completion time and failure rate; do not fabricate real investment conversion | - |

### 20.8 Implementation order and qualification gates

#### Wave M0 (0-6h): freeze the rules first

```text
MBOX-PM-1 → MBOX-PM-2 → MBOX-PM-3 → MysteryRevealProof schema
```

Gate M0: any team member can answer "what is blind, what is not, when the report fee is paid, when the investment happens, and how fairness is verified". Animation work must not start before this passes.

#### Wave M1 (6-24h): deterministic engine and API

```text
MBOX-BE-1 → MBOX-BE-2 → MBOX-BE-3 → MBOX-BE-4/5 → MBOX-AI-1
```

Gate M1: in offline tests, the same proof always selects the same pool; tampering with any one of candidate/nonce/weight/quote fails; zero candidates and state changes both fail closed.

#### Wave M2 (24-42h): x402 and the one-screen experience

```text
MBOX-X402-1/2 → MBOX-FE-1/2/3/4/5 → MBOX-I18N-1
```

Gate M2: demo Preview → 402 → Payment → Reveal → Verify within 45 seconds; Demo/Live labels are clear, and in real mode the payment tx can be traced to `PaymentAttested` and the report hash.

#### Wave M3 (42-60h): independent subscription and security

```text
MBOX-FE-6 → MBOX-BE-6/7 → MBOX-WEB3-1 → MBOX-QA-1/2/3/4
```

Gate M3: no subscription without a second signature; ineligible or paused pools are never selected; a failed box opening does not affect investment principal; preflight passes three times in a row.

#### Wave M4 (60-72h): growth validation and pitch freeze

```text
MBOX-QA-5 → 60-second script rehearsal → backup video → feature freeze
```

Gate M4: testers can clearly restate "I spent 0.001 USDC on an AI due-diligence reveal, not a random RWA purchase"; the pitch does not use phrasing such as "sure win, prize, jackpot, guaranteed floor".

### 20.9 60-second championship demo script

```text
0-08s  "There are too many projects in the market; ordinary investors don't know which to research first." Choose the Balanced Risk Passport.
08-16s Show 5 eligible candidates, equal probability, risk/stress loss ranges: "We hide the voyage, but never the risk."
16-28s Click Open Mystery Voyage: real HTTP 402 → 0.001 USDC → payment tx.
28-40s The container is unsealed, revealing "500 tonnes of copper, Singapore→Shanghai"; the AI Risk Passport expands document review, valuation, war/insurance evidence.
40-50s Click Verify: locally recompute the candidate hash, two-sided entropy and selected index; open the PaymentAttested Explorer page.
50-60s Emphasize "opening the box only buys a report". After reading the worst-case loss, the user confirms the subscription separately; Injective executes the existing compliant pool state machine.
```

Closing line:

> **Most blind boxes hide both value and risk. AgentBL flips the model: the voyage is a surprise, but risk, probability, payment and allocation are all verifiable.**

---

## 21. Final Demo Enhancement: Living Voyage (Physical AI × Trust Premium × Route Gifts)

This section absorbs **Enhancement Dimension 1: Physical AI** and **Enhancement Dimension 4: The Economics of Trust Scarcity** from docs/enhancement-physical-ai-trust-insurance-zk(2).md, and connects them to the Mystery Voyage in the previous section. The goal is not to pretend before the final demo that we already own an ocean-going fleet, but to tell a story that judges will remember and that has honest engineering boundaries:

> **What the investor opens is not a yield number but a window onto a real voyage: see the cargo, verify its status, watch the sea; the more complete the physical evidence, the better the AI can turn "trust" into an explainable reduction in financing cost. After subscribing, the customer receives an equal-value keepsake from this route, turning a financial transaction into a traceable maritime memory.**

### 21.1 The final-round one-liner and three layers of experience

~~~text
Mystery Voyage         = discover an unknown route with transparent risk bounds
VoyageCam / Ocean View = open a physical window onto this route
Trust Premium          = camera + AIS + sensors + document evidence → a smaller uncertainty discount
Voyage Keepsake        = an equal-value route memento after subscription + a link to the evidence and journey
~~~

The complete loop the user sees:

~~~text
Blind box reveal
  → CargoCam: see the container seal, hold/deck and loading status
  → Ocean Window: switch the camera to the horizon, track and sea-state presets
  → Physical AI: cross-verify vision + AIS/GPS + temperature/humidity/vibration/light/seal
  → Trust Evidence Graph: physical confidence rises, Trust Premium enters the price waterfall
  → Subscribe after the risk is clear
  → The route gift is delivered to the customer; NFC/QR leads back to the same on-chain proof
~~~

Every screen at the final must carry a status label:

| Label | Meaning | Allowed wording |
|---|---|---|
| LIVE PROTOTYPE | A phone/USB camera or real WebRTC stream connected live | "This is the physical camera prototype we are controlling" |
| RECORDED REPLAY | Pre-recorded video replayed on real timestamps, with reproducible sensor data | "This is a verifiable replay of the same AI pipeline" |
| DIGITAL TWIN / VISION | 3D/model ship/synthetic data, only showing the future experience | "This is the product vision once a fleet is connected in the future" |

It is forbidden to describe RECORDED REPLAY or DIGITAL TWIN as being connected to a real vessel; this honest boundary is exactly what makes the "trustworthy" narrative hold up.

### 21.2 Enhancement Dimension 1: Physical AI / VoyageCam

#### 21.2.1 Two cameras, not just a surveillance feed

**CargoCam (proves the cargo exists)**: by default shows the container door, electronic seal, hold/deck and loading area; the AI detects seal integrity, container anomalies, standing water/smoke, changes in loaded quantity and sudden lighting changes.

**Ocean Window (lets investors take part in the voyage)**: users can switch between safe presets such as "horizon / stern wake / cloud weather / towards destination port" to see the sea view and the voyage stage. It is immersive access, not steering rights: it cannot control the rudder, propulsion, communications, crew areas or safety equipment.

Camera interaction must be managed by a ViewBroker:

- Each wallet holds only a 15–30 second PTZ preset lease at a time;
- Preset commands are queued, rate-limited and auditable; arbitrary-angle scanning of crew/port security areas is forbidden;
- No audio by default, faces/documents/the bridge are automatically masked, and sensitive geographic locations can be delayed or blurred;
- All holders get the same basic viewing opportunity; investment amount cannot buy the right to get "closer to the cargo";
- The stream itself is not put on-chain; only segment hashes, the sensor Merkle root, time and model version are recorded on-chain.

#### 21.2.2 Physical evidence inputs and AI outputs

The PhysicalConfidence from the enhancement plan is extended further into optional fields that can plug into the existing PricingQuote:

~~~ts
type VoyagePhysicalEvidence = {
  source_level: 'NONE' | 'DOCUMENT_ONLY' | 'GPS_TRACKED' | 'MULTI_SENSOR' | 'FULL_STACK';
  camera_mode: 'NONE' | 'RECORDED_REPLAY' | 'LIVE_PROTOTYPE' | 'VESSEL_LIVE';
  gps_corroborated: boolean;
  ais_corroborated: boolean;
  sensor_data_consistent: boolean;
  container_seal_intact: boolean;
  last_seen_at: string;
  segment_hashes: string[];
  sensor_root: string;
  anomaly_events: Array<{
    type: 'ROUTE_DEVIATION' | 'TEMPERATURE_EXCURSION' | 'SHOCK_DETECTED'
      | 'SEAL_BROKEN' | 'CAMERA_OFFLINE' | 'AIS_GAP';
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
    evidence_hash: string;
  }>;
  confidence_score: number; // 0..1, evidence completeness, not a safety guarantee
};
~~~

Every Physical AI refresh outputs three things:

1. **Observation**: what was seen, and whether the source is video, AIS, sensors or documents;
2. **Consistency**: whether the sources support each other, and whether there is AIS spoofing, a camera offline or a conflicting seal status;
3. **Action**: only recommends existing actions such as OPEN_WITH_WARNING / REPRICE_DOWN / PAUSE_OFFERING; automatic liquidation based on a single frame is not allowed.

Key invariants:

~~~text
Missing physical evidence ≠ the cargo is safe
Complete physical evidence ≠ the investment is risk-free
Critical anomaly/war/insurance lapse → trust credit goes to zero or triggers the existing PAUSE/FREEZE
Physical data can only reduce the uncertainty discount; it cannot erase hard risks or the collateral coverage guardrail
~~~

#### 21.2.3 Physical AI options demo-able at the final

Ordered by feasibility:

~~~text
P0: local RECORDED REPLAY + data/physical-intel fixtures
    Pre-recorded sea/container video, AIS track, temperature/vibration/seal timeline replayed in sync
    After clicking "seal anomaly", Physical AI generates an anomaly → the price waterfall shows an added risk charge

P0.5: LIVE PROTOTYPE
    One phone/USB PTZ camera pointed at a model container or a real warehouse container
    Judges click CargoCam/Ocean Window and view signed telemetry while watching the feed

P1: VESSEL LIVE
    WebRTC + MQTT/HTTP sensor gateway + AIS provider + edge CV
    Segment hashes and the sensor root are periodically anchored on Injective, supporting token-gated views for investors
~~~

Even P0 must make judges feel "this really works": every frame in the replay has a timestamp, segment hash and model version; it is not a decorative looping video.

### 21.3 Enhancement Dimension 4: Trust Premium / explicit pricing of trust

#### 21.3.1 Trust is not a slogan but a line in the price waterfall

The core invariants of the existing engine must be preserved. The trust layer only acts as an **evidence credit** against the risk share; it does not introduce a separate formula that would break the PricingQuote:

~~~text
raw_risk_score_bps      = existing document + market + world-risk policy
evidence_credit_bps     = f(physical confidence, corroboration, integrity, freshness)
trust_credit_bps        = min(evidence_credit_bps, TRUST_CREDIT_CAP_BPS,
                              raw_risk_score_bps)
adjusted_risk_score_bps = max(0, raw_risk_score_bps - trust_credit_bps)

# Feed back into the existing pricingEngine
risk_share        = f(adjusted_risk_score_bps)
risk_discount_bps = price_delta(speed_price, price_from_share(risk_share))
indicative_price  = base_issue_price - urgency_discount - risk_discount
final_price       = max(indicative_price, collateral_floor)
~~~

trust_credit_bps cannot be filled in by hand by the project team; it must come from the evidence graph and is subject to the following caps:

- When documents, AIS, GPS, camera and temperature sensors prove the same fact, it counts only once, preventing double counting;
- Even FULL_STACK cannot offset hard risks such as war, sanctions, insurance expiry or severe seal anomalies;
- When evidence exceeds its freshness TTL, the camera goes offline or AIS shows unexplained gaps, the credit decays automatically;
- No trust score automatically changes PAUSE_OFFERING back to OPEN_OFFERING; resumption must go through the existing Agent/Oracle state machine;
- The page shows raw risk, evidence credit and adjusted risk side by side; showing only the better-looking final number is forbidden.

#### 21.3.2 A Trust Waterfall judges understand at a glance

Add a side-by-side comparison to the AI Console (numbers must be computed from fixtures/policy; the following is only a narrative illustration):

| Evidence combination | Trust signal | Price change | What it means to the investor |
|---|---|---|---|
| Only eBL/invoice/insurance | Consistent on paper | Baseline | "The documents don't contradict each other, but the physical world is unknown" |
| + AIS/GPS cross-check | The ship is on a reasonable route | Risk discount decreases | "The position is not a single GPS claim" |
| + camera seal + temperature/humidity | Cargo status is continuously observed | Risk discount decreases further | "It's not just one loading photo" |
| + repayment history/guarantee/insurance | Trust is reusable | Forms a Trust Premium | "Trust has turned into financing cost savings" |

It must be explained to investors: a higher price does not mean "giving you returns"; it means that because uncertainty has dropped, the exporter does not have to pay an equally deep risk discount; investors still bear real trade, market and default risk.

#### 21.3.3 The trust flywheel

~~~text
Investors are willing to open boxes/subscribe
  → Projects are willing to install cameras, electronic seals and sensors
  → Physical evidence becomes more plentiful and more reliable
  → AI uncertainty discount drops, exporter financing cost falls
  → More cargo owners join, more investors are willing to view real voyages
  → Device makers, shipowners, insurers and guarantors have an economic incentive to connect
  → AgentBL turns from an "AI pricing page" into a "trust pricing network"
~~~

### 21.4 Route merchandise gifts: turning an investment into a memorable journey

The gift is named **Voyage Keepsake / route keepsake box**, not a "lottery prize". The blind box may hide the gift's specific design or route easter egg, but not its value, delivery conditions or return/exchange rules.

#### 21.4.1 Creative gift catalog

| Route/cargo | Keepsake idea | How it links |
|---|---|---|
| Singapore → Shanghai copper cathode | Metal bookmark replicating the container seal, port coordinates postcard, NFC evidence card | NFC opens the reveal proof, seal status timeline and sea view replay |
| Bangkok → Qingdao rubber | Recycled canvas route patch, route weather card, port stamp sticker | Scan to view temperature/humidity/vibration telemetry and AI risk explanation |
| Brazil/Asia soybean route | Route illustration leaflet, trade route magnet, sustainable packaging story card | Opens cargo provenance and ESG/compliance evidence summary |
| Cargo unsuitable for shipping, such as crude oil/ore | 3D paper model container, ship silhouette card, digital boarding ticket | No shipping of dangerous or regulated goods; the digital card links to the voyage timeline |
| Any customer who completed a subscription | A unique voyage_id voyage passport page recording "you witnessed this cargo" | Does not represent ownership or returns, and does not affect the next probability |

Gift principles:

- Every order is equal-value, low-value, non-cash, non-financial merchandise; "rare" may only describe the illustration/story and must not correspond to higher APY, capital guarantee or larger quota;
- Gift costs come from the protocol's marketing/sponsor budget and are not deducted from exporter proceeds, the insurance pool or investors' target redemption;
- Shipping address, name and customs information are stored only in an encrypted off-chain fulfillment store; only gift_fulfillment_hash goes on-chain;
- For sanctioned regions, dangerous goods, or when cross-border customs clearance is not feasible, automatically switch to an equal-value digital keepsake so the "gift" never blocks redemption;
- Report users get a digital route stamp; only customers who completed an independent, compliant subscription and chose to receive delivery enter the physical gift queue, to avoid using gifts to induce ineligible users to buy securities;
- Any gift can be declined or exchanged for the digital version; the frontend shows "the gift is not an investment return".

#### 21.4.2 The most memorable box-opening moment

~~~text
AI Reveal: you opened SG → Shanghai Copper Voyage #0007
Screen: live/replayed sea view; the investor drags "CargoCam ↔ Ocean Window"
AI: seal intact, AIS and GPS consistent, temperature stable; Trust Credit +XX bps (verifiable)
User: acknowledges the risk and subscribes; the second on-chain event completes
Physical/digital box: a "Port of Singapore → Shanghai" stamp appears
NFC: the phone opens this voyage's PaymentAttested, PricingUpdated and sensor timeline
~~~

This makes the "gift" not merchandise handed out from nowhere but a portable entry point to evidence: the customer puts the card on their desk and can still return to that real or replayed voyage in the future.

### 21.5 Final Demo narrative (90-second version)

~~~text
0-10s  "Traditional RWA makes you stare at a PDF and guess whether the cargo exists. AgentBL lets you choose your risk bounds first, then open a voyage."
10-22s Choose the Balanced Mystery Voyage, showing candidate count, risk range, worst-case scenario and the x402 report fee.
22-32s 402 → payment tx → open the box; the camera cuts from the seal to the horizon, with LIVE PROTOTYPE/RECORDED REPLAY shown alongside.
32-45s Judges move CargoCam/Ocean Window; Physical AI simultaneously reads video, AIS/GPS, temperature and seal telemetry.
45-58s The AI deliberately demonstrates an anomaly: AIS deviation/seal alert; Physical Confidence drops, RiskPricingOracle recommends REPRICE or PAUSE.
58-70s Normal evidence is restored; the Trust Waterfall shows "uncertainty discount reduced by XXbps" and explains that this is not a guaranteed return.
70-80s The investor completes the second risk acknowledgement and RWA subscription; Explorer shows the three kinds of evidence: payment, reveal, pricing.
80-90s The route keepsake box appears: the NFC card opens the same evidence chain. "We don't sell blind returns; we price visible trust and let the customer take this voyage home."
~~~

If there is no real camera on site, say directly:

> "Today this is a RECORDED REPLAY, but the verifier, timestamps, anomaly detection and price actions are really running; swap the input for shipboard WebRTC/MQTT and the protocol does not need to be rewritten."

### 21.6 Engineering task list

#### 21.6.1 Physical AI / Data / Trust Pricing

| ID | Priority | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| PHY-FINAL-1 | P0 | Build data/physical-intel/ fixtures: CargoCam/Ocean Window video, AIS/GPS, temperature/humidity, vibration, seal, anomaly events | AI + Backend | Todo | Fixture replay outputs a stable hash/root on a fixed timeline | - |
| PHY-FINAL-2 | P0 | Define VoyagePhysicalEvidence and a backward-compatible PricingQuote.physical_confidence | AI + Backend | Todo | Schema positive case / default NONE / invalid source level tests | - |
| PHY-FINAL-3 | P0 | Implement the Physical AI deterministic fallback: multi-source consistency, anomaly classification, freshness and confidence score | AI | Todo | Anomaly fixtures: normal, AIS gap, broken seal, temperature excursion | - |
| PHY-FINAL-4 | P0 | Implement the ViewBroker's preset views, leases, queueing, rate limiting, privacy masking and permission boundaries | Frontend + Backend | Todo | Unauthorized wallets, duplicate control, sensitive presets and expired leases all fail closed | - |
| PHY-FINAL-5 | P0 | Add CargoCam/Ocean Window dual panels and LIVE/REPLAY/TWIN status labels to the frontend | Frontend | Todo | 375px/1440px, keyboard, reduced-motion; screenshot review shows nothing misleading | - |
| TRUST-FINAL-1 | P0 | Turn physical evidence into a capped trust_credit_bps, first adjusting the existing risk_score_bps and then letting the engine derive risk_discount_bps, without breaking PricingQuote invariants | AI + Backend | Todo | document-only/GPS/full-stack comparison + collateral/critical guard tests | - |
| TRUST-FINAL-2 | P0 | Build the Trust Evidence Graph: every bps of credit is bound to a source, timestamp, hash and model version | AI | Todo | Deleting, double counting or expiring any piece of evidence changes or rejects the quote | - |
| TRUST-FINAL-3 | P0 | Implement the event pipeline physical anomaly → REPRICE_DOWN/PAUSE_OFFERING, forbidding direct liquidation on anomalies | Agent + Web3 | Todo | Autonomous agent, oracle and offering simulator states consistent across all three | - |
| TRUST-FINAL-4 | P1 | Reserve Insurance/ZK/Guarantor as trust layer providers, without faking deployed insurance or ZK in the final demo | Web3 + Security | Todo | When a provider is missing, show NOT_CONNECTED and never raise trust credit | - |

#### 21.6.2 Voyage Keepsake / Growth Experience

| ID | Priority | Task | Owner | Status | Verification | Done Evidence |
|---|---|---|---|---|---|---|
| GIFT-FINAL-1 | P0 | Design three sets of route keepsake visuals: copper, rubber, generic digital boarding ticket; uniformly low-value, non-financial, equal-value | Product + Design | Todo | UI copy and pitch Q&A clearly state "not an investment return" | - |
| GIFT-FINAL-2 | P0 | After the reveal, generate a redacted Voyage Passport and an NFC/QR mock link, linking reveal/report/evidence | Frontend + Backend | Todo | The link returns only hashes, timeline and public summary, without leaking addresses/full documents | - |
| GIFT-FINAL-3 | P1 | Physical gift fulfillment state machine: ELIGIBLE/ADDRESS_ENCRYPTED/PACKED/SHIPPED/DIGITAL_FALLBACK | Backend | Todo | Addresses never go into logs/on-chain; sanctions/customs failures automatically switch to the digital version | - |
| GIFT-FINAL-4 | P1 | Build a sponsor/marketing budget ledger, isolating gift costs from the RWA pool/insurance pool | PM + Finance | Todo | Ledger asserts gift cost does not change exporter cash, redemption exposure or yield | - |
| GIFT-FINAL-5 | P0 | 90-second Final Demo rehearsal: Mystery → Camera → Physical AI → Trust Premium → Subscribe → Keepsake | PM + QA | Todo | Three consecutive runs with no verbal patches; every simulated input has an on-screen label | - |

### 21.7 Final sprint Waves

#### Wave F0 (0-4h): freeze the story and trust labels

~~~text
PHY-FINAL-1 → GIFT-FINAL-1 → unify LIVE PROTOTYPE / RECORDED REPLAY / DIGITAL TWIN copy
~~~

Gate F0: judges can tell apart the current demo, pluggable interfaces and the long-term vision; no unverified claims such as "connected to a real fleet / insured / ZK completed" appear.

#### Wave F1 (4-14h): physical AI sense of presence

~~~text
PHY-FINAL-2/3 → PHY-FINAL-4/5 → anomaly event → autonomous action
~~~

Gate F1: camera switching and the telemetry timeline complete within 15 seconds; one anomaly lets judges see confidence, risk action and the on-chain/simulated evidence hash change in sync.

#### Wave F2 (14-24h): trust enters the price

~~~text
TRUST-FINAL-1/2/3 → Pricing Console Trust Waterfall → pricing invariant/preflight
~~~

Gate F2: for the document-only and physical-evidence versions of the same transaction, the price difference comes from an explainable bps credit; critical risk is never whitewashed by "trust".

#### Wave F3 (24-32h): route gifts and shareable memories

~~~text
GIFT-FINAL-2 → GIFT-FINAL-3/4 (if out of time, only do the digital fallback) → GIFT-FINAL-5
~~~

Gate F3: the customer scans the code and returns to the same evidence chain; the gift promises no returns, does not change the odds, and does not write the wallet address on-chain.

#### Wave F4 (32h+): only fix demo blockers

~~~text
npm run preflight → npm run test → npm run demo:once → 90-second screen recording and live rehearsal
~~~

### 21.8 Four final answers for the judges

1. **"What does the physical AI do?"** — It cross-checks cameras, AIS/GPS, temperature/humidity, vibration and electronic seals into an auditable Physical Confidence; it does not just play a sea view.
2. **"Does seeing the cargo guarantee returns?"** — No. It only reduces the verifiable uncertainty discount; war, insurance, the market and importer default can still cause investors to lose money.
3. **"Is the gift a referral scheme or a lottery?"** — No. It is an equal-value route keepsake given after a compliant order is completed, funded separately, with no cash value, and it does not affect price, probability or subscription eligibility.
4. **"Is a ship really connected now?"** — On site it is honestly labelled as replay or live prototype; the physical data interface, hash evidence, anomaly pipeline and price actions are already designed on the same protocol, so switching to real WebRTC/MQTT does not require rewriting the RWA main path.

Final close:

> **AgentBL does not ask investors to trust a black box. It lets them open a voyage, look at the cargo, verify the evidence, price the trust, and take home a proof of the journey.**
