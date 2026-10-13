# AgentBL-AI → Injective Rising Star Program: Development Direction Analysis

> **Target event**: the Injective Rising Star Program, jointly launched by Injective × Microsoft × Web3Labs (AI × real-world application track)
>
> **Project positioning**: AI-Powered Autonomous eBL & Supply Chain Finance Agent on Injective
>
> **Underlying capabilities**: ENI trusted document layer + Lixun Technology logistics / supply chain scenarios
>
> **Analysis date**: 2026-06-20

---

## 1. Current Project Status Overview

AgentBL-AI is a completed ETHBeijing 2026 hackathon project. Its core capabilities are:

| Dimension | Status |
|------|------|
| **AI dynamic pricing engine** | ✅ Complete: `src/core/pricingEngine.js`, a discount model based on the "exporter's profit share" |
| **eBL Registry contract** | ⚠️ Basic: only mint/pledge/release, no transfer/endorse |
| **Document consistency check** | ✅ Complete: `src/agent/documentConsistency.js`, cross-checks across 7 dimensions |
| **RWA lifecycle simulation** | ✅ Complete: a state machine with 12 states |
| **World risk intelligence** | ✅ Complete: xAPI integration (X/Twitter + news + prediction markets) |
| **Frontend Dashboard** | ✅ Complete: two views (RWA minting + shipment tracking) |
| **Blockchain deployment** | ✅ Injective Testnet (inEVM) |
| **Autonomous AI Agent** | ❌ Missing: the AI is currently "called on demand", not making autonomous decisions |
| **Supply chain finance products** | ⚠️ Only discounted RWA issuance; no receivables, credit scoring, etc. |
| **Multi-role system** | ❌ Missing: no distinction between exporter/bank/investor roles |
| **AI document parsing** | ❌ Missing: no OCR/NLP to extract fields from scanned documents |

---

## 2. Six Major Gaps Against the Target Direction and Development Plans

### Direction 1: 🔴 Injective Chain Adaptation (Highest Priority)

#### Current State

All contracts are deployed on Injective Testnet (inEVM/Solidity), and the frontend supports MetaMask.

#### What Needs to Be Built

##### 1.1 inEVM vs CosmWasm Choice

| Option | Pros | Cons | Recommendation |
|------|------|------|------|
| **inEVM** | 80%+ of existing Solidity contracts can be reused; high development efficiency | Gas is paid in INJ; some EVM opcodes may behave differently | **Recommended first** |
| **CosmWasm** | Native to Injective; better performance | All contracts must be rewritten in Rust; long development cycle | Consider in later iterations |

**Recommendation**: land quickly on inEVM first; core contracts can be rewritten in CosmWasm later.

##### 1.2 inEVM Contract Deployment

Deploy the following contracts to the inEVM testnet:

| Contract | File | Description |
|------|------|------|
| `AgentBLRWA` | [hardhat/contracts/AgentBLRWA.sol](../hardhat/contracts/AgentBLRWA.sol) | Main contract, permissioned demo |
| `RiskPricingOracle` | [hardhat/contracts/RiskPricingOracle.sol](../hardhat/contracts/RiskPricingOracle.sol) | AI pricing on-chain |
| `RWAOfferingPool` | [hardhat/contracts/RWAOfferingPool.sol](../hardhat/contracts/RWAOfferingPool.sol) | Offering pool lifecycle |
| `EBLRegistry` | [hardhat/contracts/EBLRegistry.sol](../hardhat/contracts/EBLRegistry.sol) | Upgraded eBL registry |
| `RWAToken` | [hardhat/contracts/RWAToken.sol](../hardhat/contracts/RWAToken.sol) | Investor share token |

**Key technical points**:

- inEVM RPC endpoint configuration
- Add an inEVM network to the Hardhat network config
- INJ as the gas token
- Rework the frontend `chain-config.json` into a multi-chain format

##### 1.3 Wallet Integration

Add the following to [public/web3.js](../public/web3.js):

```
Current: MetaMask only (ethers v6)
Target:  MetaMask + Keplr + Leap (three wallets supported)
```

- `@keplr-wallet/types` type definitions
- Injective's `injective-lists` or `@injectivelabs/sdk-ts` for chain interaction
- Automatic wallet detection: EVM wallets go through inEVM, Cosmos-native wallets go through CosmWasm (later)

##### 1.4 Frontend Multi-Chain Configuration

Rework [public/chain-config.json](../public/chain-config.json):

```json
{
  "chains": {
    "injective-testnet": {
      "chainId": "injective-888",
      "rpcUrl": "https://testnet.sentry.tm.injective.network:443",
      "contracts": {
        "AgentBLRWA": { "address": "0x...", "abi": [...] },
        "RiskPricingOracle": { "address": "0x...", "abi": [...] }
      }
    }
  },
  "defaultChain": "injective-testnet"
}
```

**Estimated effort**: 3-4 days

---

### Direction 2: 🤖 Autonomous AI Agent (Core Innovation, Must Be Strengthened)

#### Current State

AI capabilities are scattered across several files, all following a "user triggers → AI responds" pattern:

- `src/agent/valuationAgent.js` — called manually
- `src/agent/documentConsistency.js` — called manually
- `src/agent/worldRiskAgent.js` — called manually
- `src/agent/pricingNarrator.js` — called manually

**There is no autonomous decision-making capability at all**.

#### What Needs to Be Built

##### 2.1 Agent Orchestrator

New file: `src/agent/orchestrator.js`

```
┌─────────────────────────────────────────────────┐
│               Agent Orchestrator                │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ eBL      │  │ Cargo    │  │ Risk Pricing │   │
│  │ Verify   │→ │ Valuation│→ │ Agent        │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│       │              │               │          │
│       ▼              ▼               ▼          │
│  ┌──────────────────────────────────────────┐   │
│  │  Pricing decision → on-chain action      │   │
│  │  OPEN / PAUSE / REPRICE / LIQUIDATE      │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Continuous monitoring loop              │   │
│  │  (every N minutes / event-driven)        │   │
│  │  xAPI signal → risk change → auto-reprice│   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Core design**:

```javascript
// orchestrator.js pseudocode
class AgentOrchestrator {
  // eBL minted on-chain → automatically trigger the full workflow
  async onEBLMinted(eblId, metadataHash) {
    // Step 1: document parsing + verification
    const docReport = await documentConsistencyAgent.verify(eblId);
    if (docReport.has_critical) return this.reject("Document verification failed");

    // Step 2: cargo valuation
    const valuation = await valuationAgent.run(caseData);

    // Step 3: risk pricing (three payout speeds)
    const quotes = await pricingEngine.compareSpeeds(caseData);

    // Step 4: automatically pick the recommended option and open the offering
    const recommended = quotes.recommended_payout_speed;
    await this.openOffering(quotes[recommended]);
  }

  // Continuous risk monitoring loop
  async startMonitoring(poolId) {
    // Every 5 minutes / event-driven
    this.interval = setInterval(async () => {
      const worldRisk = await worldRiskAgent.sweep(poolId);
      if (worldRisk.levelChanged) {
        const newQuote = await pricingEngine.reprice(poolId, worldRisk);
        await this.pushOnChainAction(newQuote);
      }
    }, 5 * 60 * 1000);
  }
}
```

##### 2.2 Autonomous Financing Trigger Pipeline

New file: `src/agent/autonomousAgent.js`

**Trigger → Action pipeline**:

| Trigger | Action (autonomous) | On-chain effect |
|-----|------|------|
| eBL registered + documents verified | AI auto-valuation + pricing | Automatically create an RWA offering pool |
| Risk score ≤ MEDIUM | Auto-open the offering | `OPEN_OFFERING` |
| xAPI detects war/sanctions escalation | AI re-evaluates | `PAUSE_OFFERING` or `REPRICE_DOWN` |
| Insurance about to expire | AI checks for coverage gaps | `OPEN_WITH_WARNING` |
| Importer payment confirmed | Auto-settle | `settle(poolId)` |
| Cargo arrival at port confirmed | Auto-redeem | Trigger the redemption flow |

##### 2.3 Decision Audit Log

New file: `src/agent/decisionLogger.js`

Each autonomous decision records:

```typescript
type AgentDecision = {
  decision_id: string;           // SHA-256 hash
  timestamp: string;
  trigger: string;               // trigger condition
  agent_pipeline: string[];      // agents that took part in the decision
  inputs: object;                // snapshot of the input data
  reasoning: string;             // AI reasoning process
  decision: string;              // OPEN / PAUSE / REPRICE / etc.
  on_chain_tx?: string;          // on-chain transaction hash
  evidence_hashes: string[];     // list of evidence hashes
  human_override?: boolean;      // whether a human intervened
};
```

##### 2.4 Frontend Agent Activity Panel

Add a real-time display to the Dashboard:
- Current agent state (idle / monitoring / deciding)
- Recent decisions list (timeline)
- Reasoning visualisation (why this decision was made)
- Manual intervention button (human override for emergencies)

**Estimated effort**: 5-7 days

---

### Direction 3: 📄 eBL Capability Upgrade (Integrating the ENI Foundation)

#### Current State

[EBLRegistry.sol](../hardhat/contracts/EBLRegistry.sol) has only 3 functions:
- `mintEBL(bytes32 metadataHash, address holder)` — register
- `pledge(uint256 eblId, address pool)` — pledge
- `releasePledge(uint256 eblId)` — release

#### What Needs to Be Built

##### 3.1 eBL Contract Upgrade

```solidity
// New functionality
contract EBLRegistryV2 {
    // === Existing functionality ===
    function mintEBL(bytes32 metadataHash, address holder) external returns (uint256);
    function pledge(uint256 eblId, address pool) external;
    function releasePledge(uint256 eblId) external;

    // === New: transfer and endorsement ===
    function transfer(uint256 eblId, address to) external;
    function endorse(uint256 eblId, address endorsee) external;

    // === New: uniqueness control ===
    function isUnique(bytes32 cargoHash) external view returns (bool);
    function registerCargoHash(bytes32 cargoHash, uint256 eblId) internal;

    // === New: structured metadata ===
    struct EBLMetadata {
        bytes32 cargoHash;          // unique cargo hash (prevents double-spending)
        string vesselName;          // vessel name
        string voyageNumber;        // voyage number
        string portOfLoading;       // port of loading
        string portOfDischarge;     // port of discharge
        uint256 quantityMt;         // cargo quantity (metric tonnes)
        string commodity;           // commodity type
        string hsCode;              // HS code
        uint256 declaredValueUsd;   // declared cargo value
        string incoterms;           // trade terms
        uint256 issuedAt;           // issuance timestamp
        string complianceStandard;  // MLETR / eUCP / DCSA
    }

    function setMetadata(uint256 eblId, EBLMetadata calldata meta) external;
    function getMetadata(uint256 eblId) external view returns (EBLMetadata memory);

    // === New: transfer history ===
    struct TransferEvent {
        address from;
        address to;
        uint256 timestamp;
        string transferType;  // "TRANSFER" | "ENDORSE" | "PLEDGE" | "RELEASE"
    }

    function getTransferHistory(uint256 eblId)
        external view returns (TransferEvent[] memory);

    // === Events ===
    event EBLTransferred(uint256 indexed eblId, address indexed from, address indexed to);
    event EBLEndorsed(uint256 indexed eblId, address indexed endorsee);
    event CargoHashRegistered(bytes32 indexed cargoHash, uint256 indexed eblId);
    event MetadataUpdated(uint256 indexed eblId, bytes32 indexed cargoHash);
}
```

##### 3.2 AI Document Parser

New file: `src/agent/documentParser.js`

Use an LLM to extract structured fields from scans of eBLs / invoices / insurance policies:

```
Input:  eBL PDF/image (or Markdown text)
Output: structured fields
  - B/L number
  - Vessel / voyage
  - Port of loading / port of discharge
  - Cargo description / HS code
  - Quantity / weight
  - Shipper / consignee
  - Issue date
  - Trade terms (Incoterms)
```

**LLM prompt design**:

```
You are an expert in parsing international trade documents. Extract structured information from the following electronic bill of lading text.

Requirements:
1. If a field is not found in the document, mark it as null
2. Monetary fields are in US dollars
3. Dates use ISO 8601 format (YYYY-MM-DD)

Output in JSON format...
```

##### 3.3 eBL Uniqueness Verification

New file: `src/agent/eblUniqueness.js`

- Generate `cargoHash = SHA-256(vessel + voyage + commodity + quantity + portOfLoading)` for each cargo batch
- Register the `cargoHash → eblId` mapping in the eBL contract
- When a new eBL is registered, check whether the `cargoHash` already exists → prevents multiple bills for one cargo
- This is ENI's core technical value proposition

##### 3.4 Compliance Tagging Engine

New file: `src/agent/complianceChecker.js`

Automatically check whether a transaction complies with:
- **MLETR** (Model Law on Electronic Transferable Records)
- **eUCP** (Uniform Customs and Practice for Electronic Presentation under documentary credits)
- **DCSA** (Digital Container Shipping Association standards)
- **ICC DSI** (ICC Digital Standards Initiative)

**Estimated effort**: 4-5 days

---

### Direction 4: 🏦 Productising Supply Chain Finance

#### Current State

There is only one product form: discounted RWA issuance.

#### What Needs to Be Built

##### 4.1 Multi-Party Role System

| Role | Permissions | View |
|------|------|------|
| **Exporter** | Create eBLs, apply for financing, choose payout speed | Financing management panel |
| **Importer** | Confirm receipt, initiate payment | Transaction status panel |
| **Bank / financial institution** | Review eBLs, disburse loans, view risk reports | Risk review panel |
| **Investor** | Browse RWA products, subscribe, view holdings | Investment dashboard (exists) |
| **Logistics company** | Update cargo status, upload documents | Logistics update panel |
| **ENI node** | Provide trusted document verification services | Technical integration |

##### 4.2 Financing Product Matrix

| Product | Based on | Use case |
|------|----------|----------|
| **eBL-pledged financing** | Shipped-on-board bill of lading | Cargo in transit, exporter needs cash (existing) |
| **Receivables discounting** | Commercial invoice + eBL | Cargo has arrived, awaiting importer payment |
| **Purchase order financing** | Purchase order | Exporter preparing goods, needs funds to buy raw materials |
| **Inventory financing** | Warehouse receipt | Cargo in warehouse, awaiting shipment |

##### 4.3 Credit Scoring Engine

New file: `src/agent/creditScoring.js`

```
Scoring dimensions:
├── Transaction history (repayment record, number of defaults)
├── Company fundamentals (years in business, registered capital)
├── Trade authenticity (eBL / invoice / insurance consistency)
├── Importer country risk
├── Industry risk (commodity volatility)
└── Bank / financial institution endorsement
```

##### 4.4 API Extensions

| Endpoint | Method | Purpose |
|----------|------|------|
| `/api/finance/products` | GET | List financing products |
| `/api/finance/apply` | POST | Exporter applies for financing |
| `/api/finance/approve` | POST | Bank approves |
| `/api/finance/credit-score` | GET | Query credit score |
| `/api/finance/receivables` | GET | List receivables |
| `/api/finance/settle` | POST | Settle |

**Estimated effort**: 3-4 days

---

### Direction 5: 🧠 Expanding AI Capabilities

#### 5.1 AI Compliance Checks

New file: `src/agent/complianceChecker.js`

Dimensions checked automatically:
- Sanctions list screening (whether the exporter/importer/carrier/bank is on a sanctions list)
- Export controls (whether the cargo's HS code requires an export licence)
- Anti-money laundering (AML) red-flag indicators
- MLETR electronic bill of lading compliance
- eUCP electronic presentation compliance

##### 5.2 Multi-LLM Competitive Evaluation

Enhance: the `src/agent/llm/` directory

```
Same case → 3 LLMs evaluate independently
  ├── DeepSeek (cost advantage)
  ├── Qwen (advantage in Chinese-language scenarios)
  └── Tencent Hunyuan (domestic compliance advantage)
       ↓
  Take the median / consensus / weighted average
       ↓
  If divergence is too large → flag for human review
```

##### 5.3 AI Financing Advisor

New file: `src/agent/financingAdvisor.js`

```
Input:
  - Exporter preference (speed first / cost first)
  - Cargo valuation
  - Current risk level
  - Market interest rates

Output:
  - Recommended financing product type
  - Recommended payout speed
  - Estimated financing cost
  - Risk warnings
  - Alternatives
```

##### 5.4 AI Chat Interface

New frontend component: `public/chat.js`

- Users talk to the AI Agent directly
- Queries: eBL status, financing progress, risk level
- Actions: apply for financing, adjust parameters, confirm transactions
- Supports Chinese / English

**Estimated effort**: 4-5 days

---

### Direction 6: 🖥️ Productising the Frontend

#### 6.1 New Pages

| Page | File name | Purpose |
|------|--------|------|
| **View ③ eBL Management** | `public/ebl.js` | eBL list, create, transfer, pledge, view transfer history |
| **View ④ Financing Management** | `public/finance.js` | Financing applications, product comparison, approval status, repayment |
| **View ⑤ Agent Activity** | `public/agent-activity.js` | Real-time status and decision records of the autonomous agent |
| **View ⑥ Supply Chain Overview** | `public/supply-chain.js` | End-to-end visualisation: order → eBL → financing → shipping → arrival → payment |

#### 6.2 Injective Branding

- Theme colour switch: current dark theme → add an Injective purple theme
- Replace logo / brand elements
- Show "Powered by ENI + Injective" partners
- Replace blockchain explorer links with Injective Explorer

#### 6.3 Responsive Optimisation

- Mobile adaptation (judges may view it on their phones)
- Mobile-first key action buttons

**Estimated effort**: 5-7 days

---

## 3. Prioritisation and Timeline

Assuming the hackathon runs for **30-45 days**:

### 🔴 P0 (must do, ~15 days): Get the Main Flow Working End to End

| # | Task | File | Effort |
|---|------|------|--------|
| 1 | Injective inEVM contract deployment | [hardhat/contracts/](../hardhat/contracts/) | 2 days |
| 2 | Keplr wallet integration | [public/web3.js](../public/web3.js) | 2 days |
| 3 | Agent orchestrator | `src/agent/orchestrator.js` (new) | 3 days |
| 4 | Autonomous financing trigger pipeline | `src/agent/autonomousAgent.js` (new) | 3 days |
| 5 | eBL contract upgrade (transfer + uniqueness) | [hardhat/contracts/EBLRegistry.sol](../hardhat/contracts/EBLRegistry.sol) | 2 days |
| 6 | AI document parser | `src/agent/documentParser.js` (new) | 3 days |

### 🟡 P1 (recommended, ~10 days): Core Differentiation

| # | Task | File | Effort |
|---|------|------|--------|
| 7 | Multi-party role system | `public/` + API | 3 days |
| 8 | Decision audit log | `src/agent/decisionLogger.js` (new) | 1 day |
| 9 | AI compliance checks | `src/agent/complianceChecker.js` (new) | 2 days |
| 10 | eBL management panel (View ③) | `public/ebl.js` (new) | 2 days |
| 11 | Agent activity panel (View ⑤) | `public/agent-activity.js` (new) | 2 days |

### 🟢 P2 (if time allows, ~5 days): Nice-to-Haves

| # | Task | File | Effort |
|---|------|------|--------|
| 12 | AI chat interface | `public/chat.js` (new) | 2 days |
| 13 | Credit scoring engine | `src/agent/creditScoring.js` (new) | 1 day |
| 14 | Multi-LLM competitive evaluation | `src/agent/llm/` | 1 day |
| 15 | Injective brand theme | `public/styles.css` | 1 day |

---

## 4. Key Differentiating Selling Points

For the Injective Rising Star Program, the project's most distinctive competitive advantages:

### 4.1 Fundamental Differences from Other Projects

| Dimension | Typical entries | AgentBL-AI |
|----------|-------------|----------------|
| AI role | Chat / customer service / recommendations | **Financial underwriting + pricing** (performs a real financial function) |
| RWA | Tokenised real estate / art | **eBL bills of lading** (the core document of global trade) |
| Degree of autonomy | User-triggered | **Event-driven + continuous monitoring** (truly autonomous) |
| Risk control | On-chain liquidation | **Prepaid compensation** (discount = the price of default risk) |
| Industry resources | Purely on-chain | **ENI (trusted documents) + Lixun (logistics scenarios)** |

### 4.2 One-Line Description

> **AI-Powered Autonomous eBL & Supply Chain Finance Agent on Injective**
>
> ENI's trusted document layer powers eBL uniqueness + AI autonomously prices trade risk into RWA discount + Injective enforces every decision on-chain.

### 4.3 3-Minute Demo Script

1. **30s** — Exporter uploads an eBL → the ENI trusted document layer verifies uniqueness
2. **40s** — The AI Agent automatically parses the eBL + values the cargo + prices the risk → generates three financing options
3. **30s** — The Agent automatically picks the recommended option → creates an RWA offering pool on Injective → opens it automatically
4. **40s** — In transit, xAPI detects escalating geopolitical risk → the Agent autonomously decides to reprice → on-chain PAUSE
5. **30s** — Risk clears → the Agent automatically resumes → importer pays → automatic settlement → investors profit
6. **10s** — ENI + Lixun + Injective working as one to build next-generation supply chain finance infrastructure

---

## 5. Target Technical Architecture

```
                     ┌──────────────────────────────────┐
                     │  Lixun Technology (logistics     │
                     │  scenario layer)                 │
                     │  Customers · industry scenarios  │
                     │  · system integration            │
                     └──────────────┬───────────────────┘
                                    │
    ┌───────────────────────────────┼──────────────────────────────┐
    │                    AgentBL-AI                                │
    │                                                              │
    │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
    │  │ AI document  │  │ Autonomous Agent│  │ AI compliance    │ │
    │  │ parsing:     │  │ orchestrator:   │  │ checks: MLETR /  │ │
    │  │ B/L, invoice,│  │ value → price → │  │ eUCP / sanctions │ │
    │  │ insurance    │  │ execute         │  │ lists            │ │
    │  └──────┬───────┘  └────────┬────────┘  └────────┬─────────┘ │
    │         │                   │                    │           │
    │         └───────────────────┼────────────────────┘           │
    │                             │                                │
    │               ┌─────────────┴──────────────┐                 │
    │               │  AI Pricing Engine (Core)  │                 │
    │               │  pricingEngine · scoreRisk │                 │
    │               │  offeringSimulator · oracle│                 │
    │               └─────────────┬──────────────┘                 │
    │                             │                                │
    └─────────────────────────────┼────────────────────────────────┘
                                  │
    ┌─────────────────────────────┼────────────────────────────────┐
    │                ENI (trusted document foundation)             │
    │  Document uniqueness · tamper-proof · control · auditable    │
    │  · cross-enterprise transfer                                 │
    └─────────────────────────────┼────────────────────────────────┘
                                  │
    ┌─────────────────────────────┼────────────────────────────────┐
    │                 Injective blockchain                         │
    │  EBLRegistry · RWAOfferingPool · RiskPricingOracle           │
    │  INJ gas · Keplr wallet · on-chain audit trail               │
    └──────────────────────────────────────────────────────────────┘
```

---

## 6. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------|------|------|
| inEVM testnet is unstable | Medium | High | Keep the local simulation mode as a backup demo |
| LLM APIs are rate-limited during the competition | Medium | Medium | The deterministic fallback engine is ready (runs fully offline) |
| ENI API integration falls short of expectations | Low | Medium | eBL functionality is self-contained and can demonstrate ENI's value on its own |
| Not enough time | High | High | Strictly follow the P0→P1→P2 priority order, with a demoable output at each stage |
| Judges don't understand supply chain finance | Medium | Medium | Prepare a simplified analogy ("like Ant Group's Jiebei credit line, but for ocean shipping") |

---

## 7. Summary

AgentBL-AI already has a solid foundation (154 tests, a complete pricing engine, a full frontend-to-backend flow). The core work in pivoting towards Injective + ENI + Lixun Technology is:

1. **Chain migration**: Ethereum → Injective inEVM
2. **AI upgrade**: on-demand calls → an autonomous decision-making Agent
3. **eBL enhancement**: basic registration → full transfer flow + uniqueness + ENI foundation
4. **Productisation**: a single RWA issuance → a multi-product supply chain finance platform

We recommend proceeding at a **P0 (15 days) → P1 (10 days) → P2 (5 days)** pace, with a demoable increment at the end of each stage. The core storyline always revolves around the three pillars of **"ENI trusted documents + AI autonomous pricing + Injective on-chain execution"**.
