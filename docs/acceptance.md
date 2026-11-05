# AgentBL Agent Acceptance Criteria

This document defines the acceptance criteria for the project preparation phase and the MVP development phase. Every new feature must be verifiable by at least one harness command.

Current main line: **an eBL-backed RWA discounted-issuance protocol with AI dynamic pricing** (see `docs/PRD.md` v0.2).

> Status legend:
> - **Current** = the current harness can already verify it (the old `RiskReport` engine is still running).
> - **Target** = a target acceptance item for the new model (`PricingQuote` / RWA discounted issuance); it becomes Current once tasks such as AI-1 / BE-2 / BE-3 in `tasks.md` land.
> The code is migrating from `RiskReport` (contract_action) to `PricingQuote` (pricing_action); both sets of acceptance criteria coexist during the transition.

## 1. Preparation Phase Acceptance

| ID | Criterion | Verification command | Status |
|---|---|---|---|
| A1 | Repository contains a README | `npm run check` | Current |
| A2 | Repository contains a quick-start background document | `npm run check` | Current |
| A3 | Repository contains a PRD (AI dynamic pricing RWA) | `npm run check` | Current |
| A4 | Repository contains a task breakdown | `npm run check` | Current |
| A5 | Repository contains demo seed data | `npm run check` | Current |
| A6 | Repository contains a minimal test framework | `npm run test` | Current |
| A7 | Repository contains a smoke test | `npm run smoke` | Current |
| A8 | The skeleton app can start | `npm run dev` | Current |
| A9 | Repository contains a multi-scenario scenario harness | `npm run scenarios` | Current |
| A10 | Repository contains realistic uploaded documents (eBL + commercial invoice) | Manually inspect `data/uploads/` | Current |
| A11 | Repository contains an AI valuation tool calling example | `npm run agent:value` | Current |

## 2. Main Flow Acceptance (AI-Priced Discounted Issuance)

| ID | Criterion | Verification command | Status |
|---|---|---|---|
| F1 | Can read the electronic bill of lading + commercial invoice demo data | `npm run smoke` | Current |
| F2 | Can generate structured pricing output (`RiskReport` during the transition, `PricingQuote` as the target) | `npm run test` | Current → Target |
| F3 | Pricing output contains `evidence_hash` / `quote_hash` | `npm run test` | Current → Target |
| F4 | Pricing output contains `pricing_action` (OPEN / REPRICE_DOWN / PAUSE / FREEZE / LIQUIDATION) | `npm run smoke` | Target |
| F5 | Changing the payout speed (FAST / BALANCED / LOW_COST) changes `base_issue_price` | `npm run scenarios` | Target |
| F6 | Changing the risk event (war / weather / insurance / price) changes `risk_discount` and `final_issue_price` | `npm run scenarios` | Target |
| F7 | Offering status moves into `Repriced` / `Paused` / `Frozen` / `Liquidation` as risk changes | `npm run smoke` / `npm run scenarios` | Target |
| F8 | Collateral coverage guardrail: target redemption exposure does not exceed safe coverage | `npm run test` | Target |
| F9 | CLI demo can show the full state machine (Created → Priced → Open → ... → Redeemed) | `npm run demo` | Current → Target |
| F10 | Web page shows issue price, target redemption price, implied yield and risk sources | Manually visit `npm run dev` | Target |
| F11 | API can return the scenario harness summary | `npm run smoke` | Current |
| F12 | AI valuation tool can output market valuation + historical comparable trade prices (with deterministic fallback) | `npm run agent:value` | Current |

## 3. Pricing Invariants Acceptance

These are hard constraints that prevent "AI guesswork" and "inflated issuance"; they must be covered by tests.

| ID | Invariant | Verification | Status |
|---|---|---|---|
| P1 | `token_supply = expected_cash_to_exporter / final_issue_price` | pricing unit test | Target |
| P2 | `target_redemption_exposure = token_supply × 1 USD` | pricing unit test | Target |
| P3 | `target_redemption_exposure ≤ ai_verified_collateral_value × redemption_coverage_limit` | pricing invariant test | Target |
| P4 | `0 < final_issue_price ≤ base_issue_price ≤ 1.0` | pricing invariant test | Target |
| P5 | `final_issue_price = base_issue_price − urgency_discount − risk_discount` (consistent in bps) | pricing unit test | Target |
| P6 | `final_issue_price` is monotonically non-increasing as risk rises | scenario test | Target |

## 4. Documentation Acceptance

| ID | Criterion | File |
|---|---|---|
| D1 | Members without an international trade background can understand bills of lading, trade finance, eBL, RWA and discounted issuance | `docs/background.md` |
| D2 | PRD describes the AI dynamic-pricing discounted-issuance model and the PricingQuote schema | `docs/PRD.md` |
| D3 | Explicitly states what is out of scope | `docs/PRD.md` §7 |
| D4 | Explicitly states the 48-hour development plan | `docs/PRD.md` §12 |
| D5 | Explicitly states technical risks and fallback options | `docs/PRD.md` §13 |
| D6 | README describes how the team collaborates | `README.md` |
| D7 | Docs include the award roadmap and AI/MCP/RAG/contract task planning | `docs/award-roadmap.md` |
| D8 | Docs explain which external APIs AI valuation tool calling needs | `docs/ai-valuation-tooling.md` |

## 5. Hackathon Demo Acceptance

During the demo, the judges must understand within 3 minutes:

1. Who the users are (exporters / investors);
2. What the pain point is (they need cash fast, but pricing is slow and opaque);
3. Why an electronic bill of lading can serve as RWA collateral;
4. What the AI Pricing & Risk Agent does (valuation + converting speed and risk into an issuance discount);
5. How the AI's discount changes on-chain state (Open → Repriced / Paused);
6. Why this is an AI Pricing Oracle rather than a chatbot;
7. Why `1 RWA = 1 USD` is a target redemption price, not a principal guarantee.

## 6. Feature Freeze Criteria

When entering the final 6 hours:

- No new features;
- Only fix bugs that affect the demo;
- `npm run check`, `npm run test` and `npm run smoke` must all pass;
- `npm run scenarios` must pass and cover fast payout / balanced payout / high-risk reprice;
- `npm run agent:value` must run end to end with the deterministic fallback when no API key is set;
- Keep the CLI demo as a fallback in case the web page fails;
- Keep the mock provider as a fallback in case the DeepSeek / Qwen APIs fail.

## 7. Acceptance Template for Each New Feature

Every new feature must fill this in on its PR:

```text
Feature name:
Owner:
Task ID:
Changed files:
How to run:
Verification command:
Expected output:
Which scenario it affects / whether it changes issue price / whether it writes to RiskPricingOracle:
Fallback plan:
```

Features without a verification command must not be merged into the main branch. If a feature touches RWA pricing, it must explain the relationship between `issue price / target redemption / risk discount`; if it touches investor returns, it must keep the no-principal-guarantee wording.
