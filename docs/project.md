# AgentBL — An eBL-backed RWA Trade Finance Protocol with AI Dynamic Pricing

> 🎯 **Understand it in 5 seconds: your goods are drifting at sea, and the money is still 45 days away. Who watches the risk for you? AgentBL's AI risk Agent prices the risk correctly before investors place their orders.**

---

## One-Line Pitch (recommended as-is)

AgentBL is an AI-driven eBL (electronic bill of lading) RWA discounted issuance protocol: the exporter pledges an electronic bill of lading → AI reviews documents/values/manages risk/prices → investors subscribe at a discount → on-chain enforcement. It gives AI a real financial responsibility: not chatting, but underwriting.

---

## 1. Background and Pain Points

### A Real Scenario

At the Port of Singapore, 500 tonnes of copper cathode plates are loaded for Shanghai. The invoice value is USD 4.5 million. The exporter urgently needs cash to buy the next batch of raw materials, but under traditional trade finance the money takes 30-45 days to arrive.

**The global trade finance gap is as large as USD 2.5 trillion.** The problem is not a lack of money; it is that risk is hard to read and pricing is opaque.

### Three Deadly Off-Chain Risks

1. **Document fraud**: the eBL says 500 tonnes, the invoice says 480 tonnes, and the insurance only covers 3 million: the three documents do not match
2. **Insurance traps**: the policy expires 3 days before arrival, and the war exclusion clause wipes everything out
3. **Deceptive signals**: war breaks out and copper prices rise → a price-only oracle thinks it is "safer", which is exactly backwards

**Who reads these risks correctly and prices them for investors before they place their orders?** That is the whole answer AgentBL provides.

---

## 2. Product Vision and Solution

### Main Flow (plain-language version)

```
Exporter pledges the electronic bill of lading
    → AI document review and anti-fraud (cross-check eBL/invoice/insurance)
    → AI valuation (live LME copper price + UN Comtrade historical trades + volatility haircut)
    → AI risk scoring (war/weather/port/insurance/price volatility, five dimensions)
    → AI sets the issuance discount (more urgent need for cash + higher risk = deeper discount)
    → Investors subscribe at a discount (e.g. buy at $0.80, target redemption $1.00)
    → On-chain RiskPricingOracle anchors the decision + evidence hash
    → Risk escalates during shipping → AI reprices/pauses/liquidates in real time
```

### Core Pricing Formula

```
Exporter gross profit P = invoice value − purchase cost
Financing cost          = share × P                            ← what investors earn = what the exporter pays
Issue price             = cash / (cash + share × P)            ← $0.80 to $0.89
share                   = payout-speed share + risk share      ← two levers drive the discount
```

### Why Does It Have to Be AI?

**The money is paid to the exporter the moment the offering is Funded, while the goods are still at sea. Repricing after the fact cannot protect money that is already committed.** That discount is the investor's only, prepaid risk compensation. And who sets that discount? AI, **before investors subscribe.**

$1.00 is the **target redemption price, not a principal guarantee.** The same copper shipment has three possible outcomes:
- ✅ Repayment: $0.80 → $1.00, a 25% gain
- ❌ War tail default: $0.80 → only $0.698 recovered, a 12.8% loss
- 🟡 Mild default: principal recovered thanks to overcollateralisation

**That $0.20 discount = the premium AI collects in advance for the default tail.**

---

## 3. Fit with the Challenge and Innovations

| Judging Criterion | How AgentBL Hits It |
|---------|----------------|
| **AI Agent × Blockchain** | AI decides the issue price/amount/on-chain actions: a real financial Agent, not a chat box |
| **Security / Risk Agent** | Anti-fraud document review (7 cross-checks) + five-dimension risk scoring + war premium trap detection |
| **Auditable / Explainable** | Every discount is tied to evidence sources + decision hash recorded on-chain in RiskPricingOracle |
| **On-chain attestation** | AgentBLRWA + RiskPricingOracle + PaymentOracle deployed on Injective Testnet |
| **x402 paid intelligence** | AI automatically pays to unlock premium data (HTTP 402 → EIP-3009 → on-chain settlement) |
| **MCP Server** | 7 tools + 3 resources, plugs directly into Claude Code / Cursor |
| **Real use cases** | 9 structured cases across copper/crude oil/iron ore/rubber/aluminium, including the warcrisis extreme scenario |
| **Test coverage** | 154 JS tests + 11 Solidity tests + preflight pre-competition check |

---

## 4. Technical Innovation Highlights

### 🤖 AI Document Review and Anti-Fraud: What Price Oracles Cannot Do

Before pricing, AI first does the job of a document checker: **three-way cross-check of eBL / commercial invoice / insurance policy**:
- Are the quantities consistent (mismatch +250bps)
- Does the invoice unit price deviate from the market (over-/under-invoicing +150bps)
- Does the insurance cover the cargo value (underinsured +220bps)
- Does the policy expire before arrival (+120bps)
- Are the Incoterms consistent

**Every red flag is converted into risk basis points and directly lowers the issue price.**

### 🔭 Seeing Through Deceptive Signals: The "Double-Edged Correlation" of the War Premium

When war breaks out, copper prices rise → a price oracle thinks "the collateral is worth more" → **exactly backwards.**

AgentBL's AI knows:
- Default probability ↑ (the importer abandons the cargo)
- Insurance becomes void (war exclusion clause)
- Liquidation recovery rate ↓
- **All protections collapse together**

So it acts in the opposite direction: a 21% cargo value haircut, 1410bps of risk, and **an immediate PAUSE of the issuance.**

### 💎 x402 Paid Intelligence: AI Pays for Intelligence, with On-Chain Attestation

When free intelligence is not enough, AI automatically buys premium data via the x402 protocol:
1. Request the paid endpoint → HTTP 402 Payment Required
2. AI automatically signs an EIP-3009 TransferWithAuthorization
3. On-chain settlement → PaymentOracle records the payment evidence
4. Premium intelligence unlocked → flows into the pricing engine → the price may change as a result

**A complete loop: pay → settle → attest → price change, every step auditable.**

### 🔗 MCP Server: The Native Interface for AI Agents

7 MCP tools (get_trade_case / generate_pricing_quote / simulate_offering / push_pricing_to_oracle / search_knowledge_base / assess_world_risk / fetch_premium_x402_intel) + 3 Resources, plugging directly into Claude Code / Cursor. The Agent drives machine payments in natural language, with no human needed to press a button.

---

## 5. System Architecture

```
Frontend Dashboard (SPA)
    ↕ fetch (PricingQuote)
API Server (Node.js http)
    ↕
┌──────────────────────┬──────────────────────┐
│ AI pricing engine    │ MCP / x402 / RAG      │
│ pricingEngine        │ 7 tools + 3 resources │
│ scoreRisk            │ HTTP 402 paid intel   │
│ offeringSimulator    │ 5-dim risk intel RAG  │
└──────────────────────┴──────────────────────┘
    ↕ quote_hash / evidence_hash
Injective Testnet contracts
├── AgentBLRWA (RWA minting)
├── RiskPricingOracle (pricing attestation)
├── PaymentOracle (x402 payment evidence)
├── RWAOfferingPool (issuance/subscription/settlement)
└── EBLRegistry (bill of lading registry)
```

---

## 6. Quick Start

```bash
# 1. Install
npm install

# 2. Start
npm run dev
# → http://localhost:3000

# 3. One-click demo
npm run demo:once

# 4. Full pre-competition check
npm run preflight
```

**Requirements**: Node.js ≥ 18.18.0 · a modern browser · **no API key needed (the offline fallback guarantees the demo always runs)**

---

## 7. Demo Command List

| Command | What It Does |
|------|---------|
| `npm run demo:once` | 🔥 One-click, 1-minute full end-to-end demo |
| `npm run dev` | Web Dashboard (interactive for judges) |
| `npm run demo:default` | Comparison of three settlement outcomes (gain/loss/break-even) |
| `npm run agent:value` | AI valuation tool-call trace |
| `npm run qa` | Judges' Q&A rehearsal |
| `npm run smoke:x402` | x402 paid intelligence full chain |
| `npm run preflight` | Full pre-competition check (benchmarked against hermes-pay) |

---

## 8. Contract Addresses (Injective Testnet)

| Contract | Address |
|------|------|
| AgentBLRWA | `0x4a03B5707eEBFc88f56f6E6a99b5D98466B31c94` |
| RiskPricingOracle | To be deployed |
| PaymentOracle | To be deployed |

---

## 9. Closing Line

> **Ordinary DeFi lets the market guess the price and leaves liquidation to clean up afterwards. AgentBL lets AI turn trade fraud and real-world risk into an explainable, on-chain RWA discount before investors place their orders.**
>
> **AI prices the risk; the chain enforces it.**
