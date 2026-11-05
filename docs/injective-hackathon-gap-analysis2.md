# AgentBL → Injective Rising Star Program: Development Direction Analysis v2

> **Target event**: the Injective Rising Star Program jointly launched by Injective × Microsoft × Web3Labs (AI × real-world application track)
>
> **Positioning**: Web3-Native Trade Finance Protocol — Exporters Tokenize, AI Prices, Global Investors Fund
>
> **Underlying capabilities**: ENI trusted document layer + Lixun Technology logistics / supply-chain use cases
>
> **Analysis date**: 2026-06-20
>
> **Version note**: v2 corrects the narrative, shifting it from "building infrastructure for banks" to "a Web3-native trade finance protocol that replaces banks".

---

## 1. Core Narrative: Replace Banks, Don't Serve Them

### 1.1 Traditional Trade Finance vs AgentBL

```
Traditional model (bank intermediary)     AgentBL (Web3-native)

Exporter                                Exporter
  │                                       │
  ├─ Applies to a bank for financing      ├─ eBL goes on-chain (ENI verifies uniqueness)
  ├─ Bank reviews credentials (weeks)     ├─ AI prices automatically (seconds)
  ├─ Bank assesses risk                   ├─ Smart contract creates an offering pool
  ├─ Bank disburses (layers of approval)  ├─ Global investors subscribe to the RWA
  │                                       │
  ▼                                       ▼
Bank earns the spread                     Exporter receives funds directly
Bank bears the credit risk                Investors bear cargo/route risk and earn the discount
Bank has the final say                    Code decides everything; no one can intervene
```

### 1.2 One-Line Positioning

> **AgentBL is a Web3-native trade finance protocol.**
>
> Exporters tokenize electronic bills of lading on-chain. AI prices the cargo risk — not the exporter's credit score. Global investors fund the trade directly. No bank. No credit committee. No intermediary.
>
> The eBL *is* the collateral. The smart contract *is* the settlement. ENI guarantees the document is real. Injective enforces every decision.

### 1.3 Five Unshakeable Principles

| # | Principle | Meaning |
|---|------|------|
| 1 | **Exporters tokenize** | The exporter is the active party. Open AgentBL, upload the eBL, tokenize in one click. No bank approval needed. |
| 2 | **AI prices risk, not people** | AI only assesses the risk of "this cargo + this route + the current state of the world". It does not check the exporter's credit report. |
| 3 | **Investors fund directly** | Anyone in the world with a wallet can browse the eBL market and subscribe to RWAs. Funds flow straight from investors to exporters. |
| 4 | **Smart contracts settle** | Importer pays → the contract redeems automatically. Cargo arrives at port → the contract settles automatically. No bank clearing department needed. |
| 5 | **eBL is the collateral** | The electronic bill of lading itself is the collateral. Its legal validity + ENI's immutability = no third-party custodian needed. |

---

## 2. Current Project Status Overview

AgentBL is a prize-winning project from the ETHBeijing 2026 hackathon and already has these core capabilities:

| Dimension | Status |
|------|------|
| **AI dynamic pricing engine** | ✅ Complete: `src/core/pricingEngine.js`, a discount model based on the "exporter profit share" |
| **eBL on-chain** | ✅ Basic: mint/pledge/release |
| **Taobao-style eBL market** | 📐 Designed: [ebl-marketplace-design.md](./ebl-marketplace-design.md) |
| **AI smart recommendations** | 📐 Designed: natural-language description → AI filters, ranks and recommends |
| **Frontend dashboard** | ✅ Complete: browse eBLs + one-click minting + shipment tracking |
| **World risk intelligence** | ✅ Complete: xAPI integration (X/Twitter + news + prediction markets) |
| **AI chat assistant** | ✅ Complete: popup-assistant.js, 9 Function Calling tools |
| **Document consistency check** | ✅ Complete: 7-dimension cross-verification |
| **Blockchain deployment** | ✅ Injective Testnet (inEVM) |
| **Autonomous AI agent** | ❌ Missing: the AI is currently "called on demand", not making continuous autonomous decisions |
| **Full eBL lifecycle** | ❌ Missing: no transfer/endorse, no cargoHash double-spend protection |
| **AI document parsing** | ❌ Missing: no OCR/NLP to extract fields from scanned documents |

---

## 3. Six Major Gaps and Development Plans

### Direction 1: 🔴 Injective Chain Adaptation (Highest Priority)

#### Current Status

All contracts are deployed on Injective Testnet (inEVM/Solidity), and the frontend supports MetaMask.

#### What Needs to Be Built

##### 1.1 Choosing inEVM vs CosmWasm

| Option | Pros | Cons | Recommendation |
|------|------|------|------|
| **inEVM** | 80%+ of the existing Solidity contracts can be reused; high development efficiency | Gas is paid in INJ; some EVM opcodes may behave differently | **Recommended first** |
| **CosmWasm** | Native to Injective; better performance | All contracts must be rewritten in Rust; long development cycle | Consider in later iterations |

**Recommendation**: land quickly on inEVM first; core contracts can be rewritten in CosmWasm later.

##### 1.2 inEVM Contract Deployment

Deploy the following contracts to the inEVM testnet:

| Contract | File | Description |
|------|------|------|
| `AgentBLRWA` | [hardhat/contracts/AgentBLRWA.sol](../hardhat/contracts/AgentBLRWA.sol) | Main contract: tokenize() + offering pool management |
| `RiskPricingOracle` | [hardhat/contracts/RiskPricingOracle.sol](../hardhat/contracts/RiskPricingOracle.sol) | Anchors AI pricing on-chain |
| `RWAOfferingPool` | [hardhat/contracts/RWAOfferingPool.sol](../hardhat/contracts/RWAOfferingPool.sol) | Offering pool: open → subscribe → pause → settle |
| `EBLRegistry` | [hardhat/contracts/EBLRegistry.sol](../hardhat/contracts/EBLRegistry.sol) | eBL registry (needs an upgrade to V2) |
| `RWAToken` | [hardhat/contracts/RWAToken.sol](../hardhat/contracts/RWAToken.sol) | Investor share token |

**Key technical points**:

- Configure the inEVM RPC endpoint
- Add an inEVM network to the Hardhat network config
- INJ as the gas token
- Refactor the frontend `chain-config.json` into a multi-chain format

##### 1.3 Wallet Integration

Add the following in [public/web3.js](../public/web3.js):

- Current: MetaMask only (ethers v6)
- Target: support for three wallets: MetaMask + Keplr + Leap

##### 1.4 Frontend Multi-Chain Config

Refactor [public/chain-config.json](../public/chain-config.json) into a multi-chain format, with the default chain pointing to `injective-testnet`.

**Estimated effort**: 3-4 days

---

### Direction 2: 🤖 Autonomous AI Agent (Core Innovation, Must Be Strengthened)

#### Current Status

AI capabilities are scattered across several files, all following a "user triggers → AI responds" pattern. **There is no autonomous decision-making at all.**

#### What Needs to Be Built

##### 2.1 Agent Orchestrator

New file: `src/agent/orchestrator.js`

```
Exporter uploads eBL
      │
      ▼
┌──────────────────────────────────────────────────────────────┐
│                      Agent Orchestrator                      │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │ Document     │ → │ Cargo value  │ → │ Risk pricing     │  │
│  │ cross-check  │   │ AI pricing   │   │ 3-speed compare  │  │
│  └──────────────┘   └──────────────┘   └──────────────────┘  │
│          │                  │                    │           │
│          ▼                  ▼                    ▼           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ AI selects the best plan → opens automatically       │    │
│  │ No human approval; opens once the eBL is on-chain    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Continuous loop (every N minutes / event-driven)     │    │
│  │ xAPI detects a risk change → reprices autonomously   │    │
│  │ Cargo arrives at port → settlement auto-triggers     │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Core design principles**:

- The moment an eBL goes on-chain, the AI starts working automatically. Nobody needs to click "Start assessment".
- AI decisions (pricing, repricing, pausing, settlement) are executed directly on-chain. There is no manual approval step in between.
- Exporters can set parameters ("minimum acceptable offering price", "payout speed preference"), but the AI executes autonomously.

##### 2.2 Autonomous Trigger Pipeline

New file: `src/agent/autonomousAgent.js`

**Event → Decision → On-chain Action pipeline**:

| Event (Trigger) | AI Decision | On-chain Action |
|-----|------|------|
| Exporter mints an eBL + document verification passes | AI valuation + pricing + recommended speed selection | Auto-open `OPEN_OFFERING` |
| xAPI detects escalating war/sanctions | AI reassesses route risk | `PAUSE_OFFERING` or `REPRICE_DOWN` |
| Risk cleared (xAPI signals back to normal) | AI confirms the risk has been eliminated | `RESUME_OFFERING` |
| Importer payment confirmed | AI verifies the payment amount | Triggers `settle()` → investors are paid out |
| Cargo arrives at port (confirmed by shipment tracking) | AI generates a settlement report | Automatic redemption flow |
| Insurance about to expire | AI checks for coverage gaps | `OPEN_WITH_WARNING` |

##### 2.3 Decision Audit Log

New file: `src/agent/decisionLogger.js`

Each autonomous decision records:

```typescript
type AgentDecision = {
  decision_id: string;           // SHA-256 hash
  timestamp: string;
  trigger_event: string;         // Trigger condition
  agent_pipeline: string[];      // Agents that took part in the decision
  input_snapshot: object;        // Snapshot of the input data
  reasoning: string;             // AI reasoning process (explainability)
  decision: string;              // OPEN / PAUSE / REPRICE / SETTLE / ...
  on_chain_tx?: string;          // On-chain transaction hash
  evidence_hashes: string[];     // List of evidence hashes
  overridden_by_human?: boolean; // Human intervention in rare extreme cases
};
```

All decisions are auditable on-chain. Both exporters and investors can see "why the AI made this pricing decision".

##### 2.4 Frontend Agent Activity Panel

New View ⑤: shows the agent's current state, a timeline of recent decisions, and a visualisation of its reasoning in real time.

**Estimated effort**: 5-7 days

---

### Direction 3: 📄 eBL Capability Upgrade (Integrating the ENI Foundation)

#### Current Status

[EBLRegistry.sol](../hardhat/contracts/EBLRegistry.sol) has only 3 functions: mintEBL, pledge, releasePledge.

#### What Needs to Be Built

##### 3.1 eBL Uniqueness Control (Preventing Multiple Bills for One Cargo) — Core Innovation

This is the core value of the ENI foundation and the root of trust for the entire protocol.

```solidity
// New in the eBL contract
function isUnique(bytes32 cargoHash) external view returns (bool);
function registerCargoHash(bytes32 cargoHash, uint256 eblId) internal;

// cargoHash = SHA-256(vessel + voyage + commodity + quantity + portOfLoading)
// A given cargo can register only one eBL. Prevents "multiple bills for one cargo" loan fraud.
```

Without this mechanism, none of the protocol's security assumptions hold. ENI's trusted document layer + on-chain cargoHash registration = a replacement for the bank's review of "trade authenticity".

##### 3.2 Full eBL Lifecycle

| Function | Description |
|------|------|
| `mintEBL(metadataHash, holder)` | Existing: registration |
| `pledge(eblId, pool)` | Existing: pledge to an offering pool |
| `releasePledge(eblId)` | Existing: release the pledge |
| `transfer(eblId, to)` | **New**: transfer ownership |
| `endorse(eblId, endorsee)` | **New**: transfer by endorsement |
| `getTransferHistory(eblId)` | **New**: full transfer history |

##### 3.3 Structured eBL Metadata

```solidity
struct EBLMetadata {
    bytes32 cargoHash;          // Unique cargo hash (core of double-spend protection)
    string vesselName;
    string voyageNumber;
    string portOfLoading;
    string portOfDischarge;
    uint256 quantityMt;
    string commodity;
    string hsCode;
    uint256 declaredValueUsd;
    string incoterms;
    uint256 issuedAt;
    string complianceStandard;  // MLETR / eUCP / DCSA
}
```

##### 3.4 AI Document Parser

New: `src/agent/documentParser.js`. Uses an LLM to automatically extract structured fields from scanned eBLs / invoices / insurance policies.

##### 3.5 Compliance Tagging Engine

New: `src/agent/complianceChecker.js`. Automatically checks MLETR / eUCP / DCSA / ICC DSI compliance.

**Estimated effort**: 4-5 days

---

### Direction 4: 🌍 Web3-Native Trade Finance Protocol (Productisation)

> ⚠️ **Major v2 correction**: the narrative for this direction shifts from "building supply-chain finance products for banks" to "building a Web3-native protocol that replaces banks".

#### 4.1 Participants

The protocol involves only three parties. No bank.

| Role | What they do | Difference from the bank model |
|------|--------|-----------------|
| **Exporter** | Upload eBL → tokenize → choose preferences → receive funds | No bank credit line needed; funds arrive in seconds |
| **Investor** | Browse the eBL market → subscribe to RWA → hold until redemption | No bank account needed; invest directly with MetaMask/Keplr |
| **AI + smart contracts** | Price risk, open offerings, monitor, reprice, settle | Replace the bank's risk, lending and clearing departments |

#### 4.2 Product Logic

The protocol has just one primitive: **one bill, one pool**.

```
Exporter tokenizes eBL
       │
       ▼
AI pricing (three speeds: FAST / BALANCED / SAFE)
       │
       ▼
Offering pool created on-chain → RWA tokens minted
       │
       ▼
Investors subscribe → funds go straight to the exporter
       │
       ▼
Importer pays / cargo arrives at port → contract redeems automatically → investors profit
```

Bank product categories such as "receivables discounting", "purchase order financing" and "inventory financing" do not exist here. Putting an eBL on-chain is simply putting an eBL on-chain.

#### 4.3 The Essence of AI Risk Pricing

The AI does not care who the exporter is. It answers only three questions:

```
1. How much is this cargo worth?
   → Reference LME/COMEX spot prices + AI document cross-verification

2. How risky is this route?
   → Geopolitical risk + weather risk + piracy risk + insurance coverage

3. What discount makes the offering reasonable?
   → Higher risk → lower offering price → higher potential return for investors
   → The exporter trades a discount for immediate funds
```

This is the heart of being **Web3-native**: the risk being assessed is not the "person" but the "cargo + route". Any exporter who can provide a genuine eBL can get funded.

#### 4.4 eBL Market (Taobao-Style)

See [ebl-marketplace-design.md](./ebl-marketplace-design.md)

- All tokenized eBLs are displayed in a card grid
- Natural-language AI search: "somewhat higher yield, medium risk"
- Multi-dimensional filters: yield / risk / cargo / route / amount
- Click a card for details; subscribe in one click

#### 4.5 API Extensions

| Endpoint | Method | Purpose |
|----------|------|------|
| `/api/market/listings` | GET | All active eBL offering pools |
| `/api/market/search` | POST | AI natural-language search + filters |
| `/api/pool/subscribe` | POST | Investor subscribes to RWA |
| `/api/pool/status` | GET | Real-time offering pool status |
| `/api/exporters/dashboard` | GET | Exporter: status of my eBLs |
| `/api/investors/portfolio` | GET | Investor: my holdings |

**Estimated effort**: 3-4 days

---

### Direction 5: 🧠 AI Capability Expansion

#### 5.1 AI Compliance Check

New: `src/agent/complianceChecker.js`

Dimensions checked automatically:
- Sanctions list screening (exporter / carrier / consignee)
- Export controls (whether the HS code requires a licence)
- MLETR electronic bill of lading compliance
- eUCP electronic presentation compliance

Note: the compliance check is **informational**, not an **admission barrier**. The AI flags risks but will never refuse service because "the company is too small".

#### 5.2 Multi-LLM Competitive Assessment

Enhancement: the `src/agent/llm/` directory

Same case → 3 LLMs assess independently → take the median / consensus.

#### 5.3 AI Investment Advisor (Linked to the eBL Market)

New: `src/agent/investmentAdvisor.js`

```
Input:  the investor's natural-language preference
        "high yield, controllable risk, amount under 2 million"
      
Output: a ranked list of eBLs + the reason for recommending each
```

This is exactly the backend for the eBL market's AI search, invoked from popup-assistant.js through the `recommendEBL` tool.

#### 5.4 AI Chat Interface (Ready)

[public/popup-assistant.js](../public/popup-assistant.js) already provides full DeepSeek streaming chat + 9 Function Calling tools. The next step is simply to extend the `recommendEBL` tool to connect it with the eBL market.

**Estimated effort**: 4-5 days

---

### Direction 6: 🖥️ Frontend Productisation

#### 6.1 Page Plan

| View | File name | Purpose | Status |
|------|--------|------|------|
| **⓪ eBL Market** | `public/market.js` | Browse eBLs + AI recommendations + filters | 📐 Designed |
| **① eBL Details & Minting** | `public/app.js` (existing) | eBL details + AI pricing waterfall + one-click minting | ✅ Exists |
| **② Shipment Tracking** | `public/voyage.js` (existing) | In-transit tracking + real-time repricing + xAPI risk | ✅ Exists |
| **③ eBL Management** | `public/ebl.js` | Exporter: upload eBLs, view status | To do |
| **④ Portfolio** | `public/portfolio.js` | Investor: holdings, returns, redemption history | To do |
| **⑤ Agent Activity** | `public/agent-activity.js` | Real-time timeline of autonomous AI decisions | To do |

#### 6.2 Injective Branding

- Theme colour switch: add an Injective purple theme
- Replace logo/brand elements
- Show partners: "Powered by ENI + Injective"

**Estimated effort**: 5-7 days

---

## 4. Prioritisation and Timeline

Assuming a hackathon period of **30-45 days**:

### 🔴 P0 (Must Do, ~15 Days): Connect the Main Flow End to End

| # | Task | File | Effort |
|---|------|------|--------|
| 1 | Injective inEVM contract deployment | [hardhat/contracts/](../hardhat/contracts/) | 2 days |
| 2 | Keplr + MetaMask dual wallets | [public/web3.js](../public/web3.js) | 2 days |
| 3 | Agent orchestrator (autonomous decisions) | `src/agent/orchestrator.js` (new) | 3 days |
| 4 | Autonomous trigger pipeline | `src/agent/autonomousAgent.js` (new) | 3 days |
| 5 | eBL contract upgrade (uniqueness + transfer) | [hardhat/contracts/EBLRegistry.sol](../hardhat/contracts/EBLRegistry.sol) | 2 days |
| 6 | AI document parser | `src/agent/documentParser.js` (new) | 3 days |

### 🟡 P1 (Recommended, ~10 Days): Core Differentiation

| # | Task | File | Effort |
|---|------|------|--------|
| 7 | Taobao-style eBL market (View ⓪) | `public/market.js` (new) | 2 days |
| 8 | AI recommendation engine (recommendEBL) | popup-assistant.js extension | 1 day |
| 9 | Decision audit log | `src/agent/decisionLogger.js` (new) | 1 day |
| 10 | AI compliance check | `src/agent/complianceChecker.js` (new) | 2 days |
| 11 | eBL management panel (View ③) | `public/ebl.js` (new) | 2 days |
| 12 | Agent activity panel (View ⑤) | `public/agent-activity.js` (new) | 2 days |

### 🟢 P2 (If Time Allows, ~5 Days): Nice-to-Haves

| # | Task | File | Effort |
|---|------|------|--------|
| 13 | Investor portfolio panel (View ④) | `public/portfolio.js` (new) | 1 day |
| 14 | Multi-LLM competitive assessment | `src/agent/llm/` | 1 day |
| 15 | Injective brand theme | `public/styles.css` | 1 day |
| 16 | Exporter parameter panel (preference settings) | `public/` extension | 2 days |

---

## 5. Key Differentiating Selling Points

### 5.1 Fundamental Differences from Other Projects

| Dimension | Typical hackathon entry | AgentBL |
|----------|-------------|----------------|
| Core idea | Web3 tool / DeFi protocol | **A Web3-native protocol that replaces bank trade finance** |
| AI role | Chat / customer service / recommendations | **Cargo valuation + route risk assessment + autonomous decisions** |
| Basis of trust | Over-collateralisation / credit scores | **Legal validity of the eBL + ENI immutability + on-chain transparency** |
| RWA type | Tokenized real estate / art | **Electronic bills of lading — the core document behind $5 trillion of global trade each year** |
| Degree of autonomy | User-triggered | **Event-driven + continuous monitoring + automatic on-chain execution** |
| Admission mechanism | KYC / credit review | **Cargo authenticity is the only admission barrier. It doesn't matter who you are** |
| Industry resources | Purely on-chain | **ENI (trusted documents) + Lixun (logistics use cases)** |

### 5.2 One Line

> **AgentBL:** Exporters tokenize eBLs. AI prices the cargo, not the credit score. Global investors fund the trade. Injective enforces every decision on-chain. No bank required.

### 5.3 3-Minute Demo Script

1. **25s** — Exporter uploads an eBL → ENI verifies uniqueness, cargoHash goes on-chain
2. **35s** — AI automatically parses the bill of lading + cross-checks the invoice/insurance → values the cargo
3. **30s** — AI prices automatically (three-speed comparison) → selects the best plan → opens the offering on-chain automatically
4. **35s** — eBL market showcase: investors browse, AI recommends "high yield, medium risk" → click to subscribe
5. **35s** — In transit, xAPI detects escalating geopolitical risk → AI reprices autonomously → on-chain PAUSE
6. **10s** — Risk cleared → resumes autonomously. Importer pays → automatic redemption. Investors profit.
7. **10s** — ENI + Lixun + Injective: trade finance infrastructure that replaces banks.

---

## 6. Technical Architecture

```
                     ┌──────────────────────────┐
                     │     Lixun Technology     │
                     │  Logistics use cases ·   │
                     │  industry customers      │
                     └─────────────┬────────────┘
                                   │
    ┌──────────────────────────────┼───────────────────────────────┐
    │                       AgentBL Protocol                       │
    │                                                              │
    │  ┌─────────────┐  ┌────────────────────┐  ┌────────────────┐ │
    │  │ Doc parsing │  │ Autonomous AI Agent│  │ eBL market     │ │
    │  │ B/L, invoice│  │ orchestrator       │  │ card grid      │ │
    │  │ insurance   │  │ price→open→monitor │  │ AI search+recs │ │
    │  └──────┬──────┘  └──────────┬─────────┘  └────────┬───────┘ │
    │         │                    │                     │         │
    │         └────────────────────┼─────────────────────┘         │
    │                              │                               │
    │                ┌─────────────┴────────────┐                  │
    │                │ AI pricing engine (Core) │                  │
    │                │ cargo value + route risk │                  │
    │                │ 3-speed pricing          │                  │
    │                └─────────────┬────────────┘                  │
    │                              │                               │
    └──────────────────────────────┼───────────────────────────────┘
                                   │
    ┌──────────────────────────────┼───────────────────────────────┐
    │  ENI (trusted document foundation)                           │
    │  Uniqueness · immutability · control transfer · auditability │
    │  Core question it answers: does this cargo really exist?     │
    └──────────────────────────────┼───────────────────────────────┘
                                   │
    ┌──────────────────────────────┼───────────────────────────────┐
    │  Injective blockchain                                        │
    │  EBLRegistry · RWAOfferingPool · RiskPricingOracle           │
    │  Every price, every decision, every redemption: all on-chain,│
    │  all auditable                                               │
    └──────────────────────────────────────────────────────────────┘
```

---

## 7. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------|------|------|
| inEVM testnet is unstable | Medium | High | Keep the local simulation mode as a backup demo |
| LLM API rate-limited during the competition | Medium | Medium | Deterministic fallback engine is ready (runs fully offline) |
| ENI API integration falls short of expectations | Low | Medium | eBL features are self-contained and can demonstrate ENI's value independently |
| Not enough time | High | High | Execute strictly in P0 → P1 → P2 priority order |
| Judges don't understand the "replace banks" narrative | Medium | Medium | "Uber replaced taxi dispatchers. AgentBL replaces trade finance banks." |

---

## 8. Summary

AgentBL currently has a solid foundation (155 tests, a complete pricing engine, a full front-to-back flow). The core work to pivot towards Injective + ENI + Lixun Technology:

1. **Chain migration**: Ethereum → Injective inEVM
2. **AI upgrade**: on-demand calls → an event-driven autonomous decision agent
3. **eBL enhancement**: basic registration → uniqueness control + full lifecycle + ENI foundation
4. **Productisation**: lab toggles → Taobao-style eBL market + AI recommendations

Core narrative: **"Exporters tokenize eBLs. AI prices the cargo risk. Global investors fund directly. No bank."**

Proceed at a **P0 (15 days) → P1 (10 days) → P2 (5 days)** cadence, with a demonstrable incremental deliverable at the end of each stage.
