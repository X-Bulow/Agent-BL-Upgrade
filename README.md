# AgentBL

> **From recommending products to recommending the assets behind global commerce.**

**AgentBL** is an AI-powered, context-aware platform for evaluating, pricing, recommending, and continuously monitoring electronic Bill of Lading (eBL)-backed Real-World Assets (RWAs).

AgentBL explores how the same intelligent-agent principles used in next-generation conversational e-commerce — **intent understanding, retrieval, ranking, multi-turn context, dynamic recommendation, and continuous monitoring** — can be extended from consumer products to real-world trade assets.

> **AI understands the context. AgentBL prices the risk. Web3 coordinates the asset.**

---

## ⚡ Quick Start

Requires **Node.js 22.13+** (`node -v`). From the repository root:

```bash
npm install                    # install backend + frontend dependencies
npm --prefix hardhat install   # install the smart-contract toolchain (Hardhat 3)
npm run dev                    # start the server, then open http://localhost:3000
```

The site starts in Demo Mode, so no wallet or API keys are needed. To check that everything works:

```bash
npm test && npm --prefix hardhat test && npm run preflight
```

See [Build and Run](#-build-and-run) for Docker, live API keys, a full on-chain walkthrough on a local chain, and testnet deployment.

---

## 🌐 Project Overview

Modern e-commerce is moving beyond static keyword search.

A next-generation shopping agent must understand what a user actually wants, distinguish high-intent **Buying** from open-ended **Browsing**, retrieve relevant candidates, rank them according to evolving preferences, and continuously adapt as new context becomes available.

AgentBL applies this same underlying **agentic decision pattern** to another layer of digital commerce:

> **Investment in eBL-backed real-world trade assets.**

In a conventional e-commerce platform, an AI shopping agent learns a consumer's preferences and recommends suitable products. After a purchase, the commerce and logistics infrastructure continues to track the physical movement of those goods.

AgentBL extends this logic from:

**Consumers + Products**

to:

**Investors + Tokenized Trade Assets**

Instead of asking:

> **Which product best matches this consumer?**

AgentBL explores:

> **Which eBL-backed trade asset best matches this investor's risk and return preferences?**

The object being recommended changes, but both share closely related underlying decision logic.

---

## 🛍️ From Product Recommendation to Trade-Asset Recommendation

| Conversational E-commerce | AgentBL |
|---|---|
| Consumer | Investor |
| Product catalog | eBL-backed RWA opportunity pool |
| Consumer preferences | Investor risk / return preferences |
| Buying intent | Targeted investment intent |
| Browsing intent | Investment opportunity exploration |
| Product attributes | Cargo, voyage, maturity, yield and risk attributes |
| Product retrieval | Trade-asset opportunity retrieval |
| Product ranking | Risk-adjusted investment ranking |
| Product recommendation | eBL-backed RWA recommendation |
| Product price | RWA valuation / financing price |
| Logistics tracking | Cargo and voyage risk tracking |
| Updated user context | Updated investor + trade-risk context |
| Product re-ranking | Repricing / reassessment |
| Purchase conversion | Investment decision |

### Conversational E-commerce

```text
Consumer Intent
          ↓
Candidate Retrieval
          ↓
Ranking
          ↓
Product Recommendation
          ↓
Purchase + Logistics
          ↓
Updated Context
          ↓
Re-ranking
```

### AgentBL

```text
Investor Intent
          ↓
Trade-Asset Retrieval
          ↓
Risk Analysis + Valuation
          ↓
Investment Recommendation
          ↓
Cargo + Voyage Monitoring
          ↓
Updated Risk Context
          ↓
Revaluation + Re-ranking
```

The key connection is **Dynamic Context**.

A consumer's preferred product may change when their requirements change. Likewise, an eBL-backed investment opportunity may become more or less attractive when the real-world shipment changes.

New information about weather, shipping routes, geopolitical events, insurance coverage, cargo conditions, commodity markets, or counterparty risk can become new context for the AgentBL agent.

Both systems can therefore form a continuous decision loop:

```text
Observe
      ↓
Understand Context
      ↓
Retrieve
      ↓
Evaluate
      ↓
Recommend
      ↓
Monitor
      ↓
Update Context
      ↓
Re-evaluate
```

> **Recommendation is a continuous decision process, not a one-time prediction.**

---

## 🔄 Dynamic Context Programming

Consider a shopping agent.

A consumer may initially say:

> "I need a pair of shoes."

Then:

> "They should be waterproof."

Then:

> "My budget is below $100."

The agent should accumulate these constraints and continuously re-rank products.

If the consumer suddenly says:

> "Actually, I want a jacket."

the agent must recognize an **Intent Override**, erase obsolete state, and rebuild the context.

The same logic applies in AgentBL.

An investor's context may include:

- Risk tolerance
- Target return
- Maturity
- Cargo preference
- Geographic exposure
- Trade route
- Counterparty risk
- Insurance conditions

At the same time, the real-world cargo context keeps changing.

For example:

```text
Typhoon Detected
          ↓
Voyage Delay Probability ↑
          ↓
Cargo + Insurance Risk Changes
          ↓
Agent Context Updates
          ↓
Risk Reassessment
          ↓
Asset Repricing
          ↓
Recommendation Changes
```

> **When real-world context changes, the recommendation should change with it.**

---

## 🌍 From Web2 Commerce to Web3 Trade Infrastructure

E-commerce does not end when a customer clicks **Buy**.

Behind every digital transaction is a physical supply chain in which goods must be documented, transported, tracked, financed, transferred, and settled:

```text
Document
      ↓
Transport
      ↓
Track
      ↓
Finance
      ↓
Transfer
      ↓
Settle
```

The **electronic Bill of Lading (eBL)** is an important digital trade document associated with the physical movement and control of goods.

AgentBL explores how eBL-backed trade flows can connect with **Real-World Asset (RWA)** infrastructure, forming a more complete commerce lifecycle:

```text
Discover
      ↓
Recommend
      ↓
Buy
      ↓
Ship
      ↓
Track
      ↓
Finance
      ↓
Settle
```

In Web2 e-commerce:

> **Understand the consumer → Recommend the product**

AgentBL extends this idea:

> **Understand the investor → Evaluate the trade asset → Monitor the cargo → Update risk → Reprice → Support financing and settlement**

The broader vision is an **Intelligent Commerce Infrastructure** in which:

- consumers receive personalized product recommendations;
- investors receive context-aware trade-asset recommendations;
- real-world cargo information continuously updates the decision context;
- changing risk triggers reassessment and repricing;
- eBL-backed RWAs connect physical trade with programmable financing;
- Web2 commerce workflows can interact with Web3 financial infrastructure.

---

## 🎯 Alignment with the Conversational Commerce Challenge

The challenge focuses on intelligent recommendation under evolving conversational context.

AgentBL explores how the same architectural principles can be generalized from **Product Recommendation** to **Trade-Asset Recommendation**.

---

### I. Intent Routing & Hybrid Decision Pipeline

The challenge distinguishes between:

- **Buying** — purchasing with a clear target
- **Browsing** — open-ended exploration

A similar distinction exists in investment discovery.

#### Targeted Investment Intent

An investor may specify:

- acceptable risk;
- target yield;
- maturity;
- cargo type;
- geographic exposure;
- trade route.

These are hard constraints.

#### Exploratory Investment Intent

An investor may instead ask:

> "What trade-finance opportunities are worth looking at?"

This behaviour resembles Browsing and calls for broader discovery of candidate opportunities.

Both share a common pipeline:

```text
Intent Detection
          ↓
Candidate Retrieval
          ↓
Semantic + Risk Ranking
          ↓
Recommendation
```

---

### II. Multi-Turn Scenario Evolution

Shopping and investment decisions both evolve over time.

Users may progressively reveal preferences or abruptly change their requirements.

The agent should maintain evolving state rather than treating each input as a completely independent query.

Relevant state may include:

- risk tolerance;
- expected return;
- maturity;
- commodity preference;
- geographic exposure;
- voyage conditions;
- counterparty risk;
- insurance conditions.

---

### III. Dynamic Context Programming

For conversational shopping:

```text
New User Preference
        ↓
Context Update
        ↓
Product Re-ranking
```

For AgentBL:

```text
New Cargo / Voyage / Risk Evidence
              ↓
        Context Update
              ↓
       Risk Reassessment
              ↓
           Repricing
              ↓
   Investment Re-ranking
```

As a result, severe weather, geopolitical conflict, insurance issues, or changes in counterparty risk can all change the attractiveness of an investment opportunity at runtime.

---

### IV. Recommendation Quality & Decision Efficiency

A good shopping agent should not overwhelm a consumer with every product in the catalog.

It should progressively narrow the candidate pool and surface the most relevant choices.

A good investment agent should behave similarly: it should not present every RWA opportunity and leave the investor to judge them alone.

AgentBL aims to reduce the distance between:

> **Ambiguous Investment Intent**

and:

> **A Relevant, Risk-Adjusted Trade-Asset Decision**

---

## 📌 Scope of This Repository

AgentBL was originally developed around:

> **AI-assisted eBL-backed RWA trade finance**

with components covering:

- risk analysis;
- pricing;
- paid intelligence;
- MCP interoperability;
- Injective-based execution.

For the conversational-commerce challenge, AgentBL demonstrates how the same underlying agent architecture can be applied to recommendation under dynamic context.

The competition's Amazon catalog and official evaluation framework remain a **separate, read-only evaluation environment**.

> **AgentBL does not claim that Amazon products themselves are tokenized as RWAs.**

What actually connects the two is the underlying decision architecture:

```text
Preference Understanding + Context
                ↓
             Retrieval
                ↓
              Ranking
                ↓
          Recommendation
                ↓
             Monitoring
                ↓
          Context Update
                ↓
           Re-evaluation
```

---

## 🧠 System Architecture

AgentBL combines four major layers:

```text
┌──────────────────────────────────────────────┐
│              AI / Agent Layer                │
│ Risk Analysis • Pricing • Recommendation    │
│ Dynamic Context • Evidence Evaluation       │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│           x402 Intelligence Layer            │
│ Paid Risk Reports • Valuation • Settlement  │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│              MCP Interoperability            │
│ Agent Tools • Resources • External AI       │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│          Web3 / Injective Execution          │
│ eBL • RWA • Pricing Oracle • Settlement     │
└──────────────────────────────────────────────┘
```

### Architecture Color Legend

- 🤖 **Purple** — AI / ML and autonomous decision-making
- 💰 **Orange** — x402 paid intelligence and revenue layer
- ⛓️ **Blue** — Web3 / Injective settlement and execution
- 🔌 **Teal** — MCP interoperability layer

---

## 🤖 AI Risk & Recommendation Engine

AgentBL evaluates trade opportunities using multiple sources of context:

- cargo value
- trade documentation
- voyage information
- insurance
- geopolitical conditions
- weather
- counterparty risk
- collateral safety
- market conditions

The objective is not simply to produce a risk score, but to form a continuous chain:

```text
Evidence
      ↓
Risk Assessment
      ↓
Valuation
      ↓
Recommendation
      ↓
Monitoring
      ↓
Reassessment
```

A deterministic fallback remains available when an external LLM is unavailable in Demo Mode.

---

## 🚢 Cargo Risk as Dynamic Recommendation Context

Logistics information is not merely something displayed after an investment.

It is part of the **decision context**.

```text
Normal Voyage
→ Stable Risk
→ Offering Remains Attractive
```

But if something changes:

```text
Typhoon / War / Insurance Issue
        ↓
Risk Context Changes
        ↓
AI Reassesses Exposure
        ↓
Pricing Changes
        ↓
Recommendation May Change
```

This closely parallels conversational e-commerce, where new consumer information triggers product re-ranking.

---

## 💰 x402 Paid Intelligence

AgentBL includes x402-based paid intelligence flows.

Machine clients and AI agents can request premium risk or valuation information through a payment-gated interface.

```text
AI Agent
      ↓
Requests Risk Intelligence
      ↓
HTTP 402
      ↓
Payment / Authorization
      ↓
Settlement
      ↓
Premium Intelligence Unlocked
```

Demo Mode can reproduce the core flow without requiring a live wallet.

---

## 🔌 MCP Interoperability

AgentBL exposes capabilities through the **Model Context Protocol (MCP)**.

The repository includes MCP tools and resources for operations such as:

- retrieving trade cases;
- generating pricing quotes;
- searching the knowledge base;
- simulating offerings;
- pushing pricing information to the oracle.

This allows external AI systems to interact with AgentBL as a structured tool provider rather than relying only on a web interface.

---

## ⛓️ Web3 & Injective

AgentBL includes smart contracts for representing and coordinating the eBL-backed RWA lifecycle, including:

- eBL registration
- RWA offerings
- risk pricing
- tokenized RWA shares
- protocol coordination

The architecture uses Injective's EVM-compatible environment for Web3 execution.

---

## 📍 On-Chain Evidence

### Deployed Contracts — Injective Testnet

**Chain ID: `1439`**

| Contract | Address | Purpose |
|---|---|---|
| **AgentBLRWA** | [`0x3C6774d2D1ac6Bf35d08e5C9c84A233F5bc7f5Ce`](https://testnet.blockscout.injective.network/address/0x3C6774d2D1ac6Bf35d08e5C9c84A233F5bc7f5Ce) | Protocol coordinator |
| **EBLRegistry V2** | [`0x85bfdcd00E0bBb9dDce3dcD2A58A62380703AdA6`](https://testnet.blockscout.injective.network/address/0x85bfdcd00E0bBb9dDce3dcD2A58A62380703AdA6) | eBL registry / anti-duplication |
| **RWAOfferingPool** | [`0x1F44D336111dE4e2640bd9a5945991D42e876f65`](https://testnet.blockscout.injective.network/address/0x1F44D336111dE4e2640bd9a5945991D42e876f65) | Offering lifecycle |
| **RiskPricingOracle** | [`0x0F9618DDbac86eD51d48ef1361789D7e5eF1FAE1`](https://testnet.blockscout.injective.network/address/0x0F9618DDbac86eD51d48ef1361789D7e5eF1FAE1) | AI → on-chain pricing |
| **RWAToken** | [`0x7eb44f73368d14DBE4c2E30F8490a60513Fe17B0`](https://testnet.blockscout.injective.network/address/0x7eb44f73368d14DBE4c2E30F8490a60513Fe17B0) | ERC-20 RWA shares |

---

## 🧪 Reproducible Verification

Setup and the full list of verification commands are in [Build and Run](#-build-and-run) below.

### Preflight

`npm run preflight` is the 56-item release gate. It checks:

- runtime environment;
- repository integrity;
- Node tests;
- Solidity contracts;
- API flows;
- x402;
- MCP;
- UI acceptance;
- live-readiness configuration.

Live-network checks may be skipped or reported as warnings in **Demo Mode**.

### Solidity Contract Tests

The contracts use Hardhat 3, which requires **Node.js 22.13+**. A locally reproduced run of `npm --prefix hardhat test` produced:

```text
52 passing
```

---

## 🚀 Build and Run

### 0. Requirements

- **Node.js 22.13+** and npm. The website alone runs on Node.js 20+, but compiling, testing and deploying the contracts with Hardhat 3 needs 22.13+. Check with `node -v`.
- Git.

```bash
git clone <this repository URL>
cd <repository folder>
```

### 1. Install dependencies

Run both on first checkout and again after pulling changes:

```bash
npm install
npm --prefix hardhat install
```

### 2. Start the website

```bash
npm run dev
```

Open http://localhost:3000.

The site runs in **Demo Mode** by default: no wallet and no API keys are needed, and AI pricing and risk analysis use built-in offline data. To use live services, optionally create a `.env` and add your keys (LLM, market data), then restart the server:

```bash
cp .env.example .env
```

> **Never commit `.env`, private keys, wallet secrets, or API keys to GitHub.**

What you can explore:

- RWA investment opportunities
- AI risk assessments
- pricing and expected yield
- cargo and voyage risk
- investment workflow
- x402 paid intelligence
- MCP integration
- Web3 evidence

### 3. Verify

```bash
npm test                      # backend + frontend unit tests
npm --prefix hardhat test     # Solidity contract tests
npm run check                 # data / config validation
npm run smoke                 # starts the server and calls the main APIs
npm run preflight             # 56-item release gate
```

For a quick end-to-end walkthrough in the terminal:

```bash
npm run demo:once
```

### 4. Docker (optional)

```bash
docker compose up -d --build
```

Then open http://localhost:3000.

### 5. Full on-chain experience on a local chain (optional)

Use two terminals.

**Terminal 1** — start a local chain and keep it running:

```bash
cd hardhat
npx hardhat node --chain-id 1439
```

**Terminal 2** — from the repository root, deploy the protocol, open the offerings and start the site:

```bash
export INJECTIVE_RPC_URL=http://127.0.0.1:8545
export DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
npm run deploy:protocol
npm run protocol:op -- seed
npm run dev
```

In MetaMask, import Hardhat test account #1 with private key `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`.

> This is a publicly known Hardhat test key. Use it on the local chain only.

Open the market view, pick a case and use the **On-chain offering** panel to claim test mUSDC and subscribe. Advance the platform side of an offering with:

```bash
npm run protocol:op -- fill <caseId>
npm run protocol:op -- settle <caseId>
npm run protocol:op -- cancel <caseId>
```

When you are done, restore the files the local deployment rewrote (never commit local addresses):

```bash
git restore public/chain-config.json docs/evidence/wave-b-protocol.json
```

### 6. Deploy to Injective testnet (operator)

1. Set `DEPLOYER_PRIVATE_KEY` in `.env`.
2. Fund that account from the [Injective testnet faucet](https://testnet.faucet.injective.network/).
3. Deploy and open the offerings:

   ```bash
   npm run deploy:protocol
   npm run protocol:op -- seed
   ```

4. Commit the updated `public/chain-config.json`.

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for details.

### Useful commands

```bash
npm run demo                    # scripted demo
npm run scenarios               # dynamic risk scenarios
npm run price                   # pricing quote
npm run intel                   # world intelligence
npm run smoke:x402              # x402 paid-intelligence smoke test
npm run x402:intel              # fetch a paid x402 intelligence report
npm run verify:wave-b           # Wave B gate: x402 payment -> on-chain pricing evidence
npm run mcp:stdio               # standalone stdio MCP server
npm run protocol:op -- status   # on-chain offerings (see docs/DEPLOYMENT.md)
```

The Wave B gate verifies live Injective testnet evidence; in Demo Mode, live payment and on-chain checks are skipped or simulated, and simulated receipts are not on-chain transactions. Live Mode uses a real wallet, USDC and on-chain transactions.

---

## 🧪 Dynamic Risk Scenarios

### Normal Trade

```text
Normal Shipment
→ Acceptable Risk
→ Financing Remains Available
```

### Severe Weather

```text
Typhoon
→ Voyage Disruption
→ Increased Risk
→ Repricing / Possible Pause
```

### Geopolitical Crisis

```text
Conflict
→ Route + Insurance + Counterparty Uncertainty
→ Increased Risk
→ Recommendation Reassessed
```

### Documentation / Fraud Risk

```text
Document Inconsistency
→ Evidence Validation Fails
→ Risk Increases
→ Offering Rejected or Paused
```

These scenarios demonstrate why **Dynamic Context** matters for trade-asset recommendation.

---

## 🛠️ Technology Stack

### AI & Intelligence

- Context-aware risk assessment
- Deterministic fallback
- RAG-style knowledge retrieval
- Structured output with Zod
- Scenario-based risk evaluation

### Blockchain & Web3

- Injective EVM-compatible testnet
- Solidity
- Hardhat 3 (ESM config, Mocha + ethers tests)
- ethers.js 6.x

### Payment & Settlement

- `@injectivelabs/x402`
- x402 payment-gated intelligence
- Settlement state machine
- Payment / report evidence binding

### Backend

- Node.js 20+ (22.13+ for the Hardhat contract toolchain)
- Express 5.x
- Native Node.js test runner
- JSON-based local state

### Agent Interoperability

- `@modelcontextprotocol/sdk`
- MCP tools
- MCP resources
- Standalone MCP server

### Frontend

- Vanilla JavaScript
- HTML
- Modern CSS
- Interactive AgentBL Dashboard

---

## 💼 Business Model

AgentBL explores several potential revenue channels.

### 1. Paid Risk Intelligence

Risk, fraud, and valuation reports can be provided as machine-consumable intelligence to:

- Investors
- Banks
- Insurers
- Logistics platforms
- Autonomous AI agents

### 2. RWA Protocol Fees

A future production implementation could charge protocol fees on successfully financed trade assets.

### 3. Institutional APIs

Banks, insurers, and trade-finance platforms could integrate AgentBL through APIs or MCP-compatible workflows.

> **AgentBL is currently a hackathon prototype, not a production financial service.**

---

## ⚠️ Limitations

AgentBL is currently a **hackathon prototype**.

Important limitations include:

- cargo and settlement scenarios may use simulated or demo data;
- Demo Mode does not represent real investment execution;
- real-world legal ownership requires jurisdiction-specific integration;
- production eBL infrastructure requires recognized eBL systems and standards;
- real logistics feeds are not yet fully integrated;
- production insurance and commodity data require reliable external providers;
- AI risk assessment requires human and institutional controls before real financial use;
- this repository is not investment advice;
- the competition's Amazon retrieval benchmark remains separate from the current AgentBL RWA demonstration.

---

## 🔮 What We Would Improve With More Time

### Conversational Commerce

- integrate the official frozen Amazon competition catalog
- implement explicit Buying / Browsing intent routing
- add keyword + category + dense multi-route retrieval
- add LLM semantic re-ranking
- implement session-level preference distillation
- support slot accumulation, decay, erasure, and intent override
- add proactive clarification when the candidate pool remains too broad
- evaluate Hit Rate@K, MRR, Top-K Hit Rate, and MTTC with the official evaluator

### AgentBL / Trade Finance

- integrate real-time logistics data
- integrate production-grade insurance and commodity risk feeds
- strengthen investor preference modelling
- dynamically rank multiple RWA opportunities
- connect cargo events directly to recommendation updates
- strengthen KYC / AML and investor eligibility controls
- extend eBL legal interoperability
- improve the explainability of AI risk assessments and recommendations

The longer-term goal is to connect:

```text
Conversational Commerce
        +
Dynamic Recommendation
        +
Real-World Logistics
        +
Trade Finance
        +
Web3 Settlement
```

---

## 🗺️ Roadmap

### Current Prototype

- AI-assisted trade risk and pricing
- eBL-backed RWA architecture
- Investment Opportunity Dashboard
- Cargo / Voyage Risk Scenarios
- x402 Paid Intelligence
- MCP Interoperability
- Solidity Smart Contracts
- Injective Testnet Evidence
- Local Demo Mode

### Next Stage

- Conversational Investor Preference Modelling
- Dynamic Opportunity Ranking
- Richer Logistics Context
- Real-world Data Integration
- Stronger Recommendation Explainability
- Competition-compatible Product Retrieval

### Long-Term Vision

> **AI understands demand, context, risk and opportunity, while programmable financial infrastructure coordinates the assets behind real-world commerce.**

```text
Product Discovery
          ↓
Recommendation
          ↓
Purchase
          ↓
Physical Trade
          ↓
eBL
          ↓
RWA Financing
          ↓
Continuous Risk Monitoring
          ↓
Programmable Settlement
```

---

## ❓ FAQ

### Q1. Is AgentBL a shopping recommendation engine?

Not directly.

AgentBL currently focuses on **trade-asset evaluation and recommendation**, rather than Amazon product recommendation.

However, both share the same underlying decision pattern:

```text
Understand Preference
        ↓
Retrieve Candidates
        ↓
Evaluate
        ↓
Rank
        ↓
Recommend
        ↓
Monitor Context
        ↓
Re-evaluate
```

---

### Q2. Why is AgentBL relevant to conversational e-commerce?

Because both systems address the same broader problem:

> **How can an intelligent agent turn changing, incomplete human intent and external context into a high-quality recommendation?**

A shopping agent uses:

> **Consumer Preferences + Product Information**

AgentBL uses:

> **Investor Preferences + Trade Information + Dynamic Cargo Risk**

---

### Q3. Why use an electronic Bill of Lading?

An eBL creates a digital bridge between:

```text
Digital Commerce
        ↓
Physical Goods
        ↓
Trade Documentation
        ↓
Financing
```

AgentBL explores how this bridge can support eBL-backed RWA workflows.

---

### Q4. What happens when cargo risk changes?

```text
New Evidence
        ↓
Risk Context Changes
        ↓
AI Reassesses Trade
        ↓
Pricing Changes
        ↓
Investment Recommendation Changes
```

This is analogous to a shopping agent re-ranking products after consumer preferences change.

---

### Q5. Is AgentBL a production investment platform?

No.

AgentBL is currently a **hackathon prototype** demonstrating the combination of:

- AI
- Dynamic Context
- Risk Assessment
- Web3
- eBL / RWA
- x402
- MCP
- Trade Finance

> **It is not investment advice and should not be treated as a production financial service.**

---

## 📄 License

MIT License — see [`LICENSE`](./LICENSE).

---

<div align="center">

### From product recommendation to the assets behind global commerce.

**AI understands the context. AgentBL prices the risk. Web3 coordinates the asset.**

</div>
