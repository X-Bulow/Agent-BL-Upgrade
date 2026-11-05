# 🎬 AgentBL · Injective Rising Star Program Video Script

> **Target competition**: the Injective Rising Star Program, jointly launched by Injective × Microsoft × Web3Labs
>
> **Video length**: 3 minutes (180 seconds)
>
> **Core positioning**: Web3-Native Trade Finance Protocol - a trade finance protocol that replaces the bank
>
> **Must emphasise**: Injective inEVM deployment, the ENI trusted document layer, the Lixun Technology logistics scenario, autonomous AI decision-making
>
> **Recording language**: English voiceover + English subtitles (key lines highlighted)

---

## 🎯 Core One-Liner (opening/closing caption)

**English**:
> **AgentBL: Exporters tokenize eBLs. AI prices cargo risk. Global investors fund directly. No bank required.**

**Powered by**: Injective × ENI × Lixun Technology

---

## 📋 Video Script - Full Version (3 minutes)

### Opening Caption (5 seconds)
```
AgentBL
Web3-Native Trade Finance Protocol

Exporters tokenize eBLs · AI prices risk · Investors fund directly
Powered by Injective × ENI × Lixun Technology

Injective × Microsoft × Web3Labs Rising Star Program
```

---

### [0:00–0:35] Opening: The Pain Point + Traditional Model vs Web3-Native Model

**[Visuals]** 
- World map + container ship animation
- Simple comparison graphic: traditional model (bank intermediary) vs AgentBL (Web3-native)

**[Voiceover]**
> Hello judges, this is AgentBL.
>
> Let's start with a real pain point: in international trade, once the goods are loaded onto the ship, it takes **30 to 45 days** for the exporter to get paid. The global trade finance gap is as large as **US$2.5 trillion**.
>
> In the traditional model, the exporter applies to a bank for financing - the bank reviews their credentials, assesses the risk, and goes through layer after layer of approvals. That takes weeks, and then the bank earns the spread.
>
> **What AgentBL sets out to do is replace the bank.**
>
> The exporter puts the electronic bill of lading on-chain, AI prices it in seconds, a smart contract opens the offering automatically, and global investors subscribe directly. Funds flow straight from investors to the exporter - no bank in between, no approvals, code decides everything.

**[English Subtitles]**
> Traditional: Exporters → Banks → Weeks of approval → High spreads
>
> AgentBL: Exporters → AI pricing → Smart contracts → Global investors
>
> **No bank. No intermediary. Code enforces everything.**

---

### [0:35–1:15] Core Innovation 1: ENI Trusted Document Layer + eBL Uniqueness

**[Visuals]**
- ENI logo + document-on-chain animation
- Show the cargoHash anti-double-spend mechanism
- EBLRegistry contract interface

**[Voiceover]**
> But there's a core problem here: **the off-chain world is full of fraud and risk**. Documents can be forged, and the same shipment can be used to issue multiple bills of lading to obtain multiple loans - traditionally, the bank's trade finance department is the gatekeeper.
>
> AgentBL's first layer of innovation: the **ENI trusted document layer**.
>
> ENI is the official trusted document infrastructure of the Injective ecosystem. When each electronic bill of lading goes on-chain, we generate a **cargoHash** - a SHA-256 hash of the vessel name, voyage, cargo, quantity and port of loading.
>
> This cargoHash is registered on-chain, and **each shipment can only be registered once**. Try to issue a second bill of lading for the same shipment? The contract rejects it outright.
>
> **This is the value of ENI: immutability + uniqueness control = replacing the bank's review of trade authenticity.**

**[On-screen Text Overlay]**
```
✅ ENI trusted document layer
✅ cargoHash prevents multiple eBLs per shipment
✅ On-chain uniqueness registration

Traditional: bank trade finance department review (days)
AgentBL: ENI + smart contract verification (seconds)
```

**[English Subtitles]**
> **ENI Trusted Document Layer**: One cargo = One eBL. On-chain uniqueness prevents double-financing fraud.

---

### [1:15–2:00] Core Innovation 2: Autonomous AI Pricing Engine + Lixun Technology Logistics Scenario

**[Visuals]**
- Switch to the Dashboard and select a case (Singapore → Shanghai copper cargo)
- The AI Pricing Console waterfall chart expands
- Show the data sources: LME copper price, xAPI risk intelligence, Lixun logistics data

**[Voiceover]**
> The second layer of innovation: the **autonomous AI pricing engine**.
>
> In the traditional bank model, the risk department assesses "this exporter's credit rating". AgentBL is completely different - **the AI only assesses the cargo itself and the route risk, regardless of who the exporter is.**
>
> Look at this case: a Singapore exporter, 500 tonnes of copper cathode, bound for the port of Shanghai.
>
> The AI starts working automatically:
> - It calls the real-time **LME copper price** API to value the cargo → US$4.5 million
> - It cross-checks three documents - the electronic bill of lading, the commercial invoice and the insurance policy → verifying that the quantities match and that the insurance cover is sufficient
> - It pulls geopolitical, weather and route risk in real time via the **xAPI protocol**
> - It connects to the **Lixun Technology logistics system** to get this route's historical on-time rate and port congestion
>
> The AI then offers three financing options: FAST payout (20% discount), BALANCED (15% discount), and SAFE (10% discount).
>
> **Once the exporter picks an option, the AI automatically creates the offering pool on the Injective chain and opens it automatically - no human approval needed.**

**[On-screen Text Overlay]**
```
AI pricing inputs:
✅ Real-time LME copper price API
✅ xAPI geopolitical risk intelligence
✅ Lixun Technology logistics data
✅ Cross-verification of three documents

Output:
→ Cargo valuation: $4,500,000
→ Risk score: MEDIUM
→ Issue price: $0.80 (FAST) / $0.85 (BALANCED) / $0.90 (SAFE)
```

**[English Subtitles]**
> **AI prices the cargo, not the credit score.**
>
> Data sources: LME prices + xAPI risk intel + Lixun logistics + document cross-verification
>
> Output: Risk-adjusted issuance price. Auto-opens on Injective. No human approval.

---

### [2:00–2:35] Core Innovation 3: Autonomous In-Transit Decisions + On-Chain Execution on Injective

**[Visuals]**
- Switch to the Voyage Tracking screen
- Click the "Simulate Strait of Hormuz conflict escalation" button
- Show the risk dimensions turning red, the AI autonomously repricing, and the status changing to PAUSE
- Show the on-chain transaction record

**[Voiceover]**
> The third layer of innovation: **autonomous AI decisions while the cargo is in transit**.
>
> While the cargo is at sea, the risk changes in real time. In the traditional bank model, the loan has already been disbursed, and the bank can only deal with changes in risk after the fact.
>
> AgentBL is different. Let's simulate an extreme scenario: this copper is out at sea when the **Strait of Hormuz conflict suddenly escalates**.
>
> At that moment the copper price is actually rising - an ordinary price oracle would conclude that "the collateral is worth more, so it's safer". **That's exactly backwards.**
>
> AgentBL's AI knows this is a **fragile war premium**. At the same time it means:
> - The importer's probability of default goes up
> - The insurance becomes void because of the "war exclusion" clause  
> - The cargo's liquidation recovery rate goes down
>
> So the AI **decides autonomously**: it applies a 21% haircut to the cargo value, pushes the risk score to 1410 basis points, and directly **executes PAUSE on the Injective chain** - stopping new investors from entering and keeping them clear of the blow-up.
>
> **From detecting the risk to executing on-chain, this decision is fully automatic, with no human intervention.**

**[On-screen Text Overlay]**
```
Event: Strait of Hormuz conflict escalates

AI autonomous decision path:
1. xAPI detects the geopolitical risk escalation
2. AI reassesses: default ↑ insurance ↓ recovery ↓
3. Automatically generates a new quote: cargo value -21%, risk 1410bps
4. Executed on the Injective chain: PAUSE_OFFERING
5. Decision evidence hash recorded on-chain: auditable

Time taken: < 3 seconds
```

**[English Subtitles]**
> **Autonomous AI decision on-chain.**
>
> War breaks out → AI detects via xAPI → Reprices risk → Auto-pauses on Injective
>
> Traditional banks: Risk changes after loan is out
>
> AgentBL: AI prevents exposure before it happens

---

### [2:35–3:00] Wrap-up: Three Pillars + Core Value

**[Visuals]**
- Architecture diagram: Injective + ENI + Lixun Technology + AgentBL
- Return to the home page and show the "Powered by" badge
- End on a full-screen tagline

**[Voiceover]**
> To sum up, AgentBL is a **Web3-native trade finance protocol** built on three official tools:
>
> **Injective** - all smart contracts are deployed on the Injective inEVM testnet, and every AI decision and every state transition is enforced on-chain.
>
> **The ENI trusted document layer** - uniqueness control and immutability for electronic bills of lading, which is the foundation of trust for the whole protocol.
>
> **The Lixun Technology logistics scenario** - real logistics data and industry customers, so the AI's risk assessment is grounded in real business.
>
> **The core value: replacing the bank.** Exporters don't need bank credit lines, investors don't need bank accounts, and AI plus smart contracts replace the bank's risk, lending and clearing departments.
>
> **The eBL is the collateral. The smart contract is the settlement. Code decides everything.**
>
> AgentBL, for the Injective Rising Star Program. Thank you, judges.

**[Full-screen Caption - 5 seconds]**
```
AgentBL
Web3-Native Trade Finance Protocol

Exporters tokenize eBLs · AI prices risk · Investors fund directly

Powered by:
Injective × ENI × Lixun Technology

No bank. No intermediary.
The AI prices. The chain enforces.
```

---

## 🎬 Demo Walkthrough (on-screen actions to match the voiceover)

### Segment [0:00–0:35] Opening
**Actions**:
- Show the comparison graphic (can be a slide or a whiteboard)
- No need to open the web page; use a simple animation to explain the concept

### Segment [0:35–1:15] ENI Section
**Actions**:
1. Open the browser and go to the Dashboard home page
2. Click "Connect Wallet" in the top-right corner (show the MetaMask connection)
3. Navigate to the eBL management page (if there is one)
4. **Key shot**: point to the `cargoHash` field of an eBL
5. Voiceover: "This hash is registered on-chain, which guarantees uniqueness"

**If there is no separate eBL management page**:
- Run `npm run demo:once` in the terminal 
- Show the `cargoHash` and `EBL uniqueness verified` parts of the output

### Segment [1:15–2:00] AI Pricing Section
**Actions**:
1. At the top of the Dashboard, select the case: **Clean copper · Singapore → Shanghai**
2. Wait for the AI Pricing Console to expand (automatically, or click "Expand pricing details")
3. **Key shots**:
   - Each layer of the waterfall chart
   - The Data Sources section (emphasise the LME API, xAPI and Lixun data)
   - The comparison of the three financing options (FAST $0.80, BALANCED $0.85, SAFE $0.90)
4. Click the "⛓️ Mint RWA on-chain" button
5. Show the MetaMask pop-up (confirm the transaction)
6. Wait for the transaction to confirm and show the success state

### Segment [2:00–2:35] In-Transit Decision Section
**Actions**:
1. Switch to the Voyage Tracking page
2. The current case should show the "In Transit" status
3. **Key action**: click the "⚔️ Simulate Strait of Hormuz conflict escalation" button
4. **Key shots**:
   - The risk dimension cards turn red
   - The AI repricing process (expands automatically)
   - The new quote is shown: cargo value haircut -21%, risk 1410bps
   - The status changes to "PAUSED"
5. Scroll to the bottom and show the on-chain transaction hash
6. (If time allows) click the transaction hash link to jump to the Injective block explorer

**Fallback plan** (if the web page is unstable):
- Run `npm run demo:default` in the terminal
- Show the output for the three settlement outcomes
- Focus on the "war tail default" section

### Segment [2:35–3:00] Wrap-up
**Actions**:
1. Return to the Dashboard home page
2. Show the "Powered by Injective × ENI × Lixun Technology" badge at the bottom of the page
3. Last 5 seconds: show the tagline full screen (a slide or a simple full-screen caption works)

---

## 🎯 Official Tool Points That Must Be Emphasised (for scoring)

### 1. Use of Injective's Official Tools
**Times to emphasise**: at least 3
- [0:30] "A smart contract opens the offering automatically"
- [1:50] "Automatically creates the offering pool **on the Injective chain**"
- [2:25] "**Executes PAUSE on the Injective chain**"
- [2:45] "All smart contracts are deployed on the **Injective inEVM testnet**"

**Demo evidence**:
- The MetaMask connection shows Injective Testnet
- Transaction hashes point to the Injective block explorer
- Contract addresses can be traced on Injective

### 2. ENI Trusted Document Layer
**Times to emphasise**: at least 2
- [0:50] "**ENI trusted document layer**" (its own segment, 35 seconds)
- [2:45] "**The ENI trusted document layer** - uniqueness control for electronic bills of lading"

**Demo evidence**:
- Show the cargoHash field
- The "ENI uniqueness verified" status
- "Powered by ENI" clearly labelled in the documentation

### 3. Lixun Technology Logistics Scenario
**Times to emphasise**: at least 2
- [1:35] "Connects to the **Lixun Technology logistics system** to get the route's historical data"
- [2:50] "**The Lixun Technology logistics scenario** - real logistics data and industry customers"

**Demo evidence**:
- "Lixun logistics data" labelled among the AI pricing data sources
- The case description mentions "a real scenario provided by Lixun Technology"

---

## 🏆 Competitive Differentiators (why we can take first place)

### How We Fundamentally Differ from Other Entries

| Dimension | Typical AI × Blockchain project | AgentBL |
|------|--------------------------|---------|
| **Role of AI** | Chatbots, recommendation systems | **Underwriter + risk officer** - performs real financial functions |
| **Narrative** | "AI-assisted DeFi" | **"A Web3-native protocol that replaces the bank"** |
| **RWA type** | Real estate, art, loyalty points | **Electronic bills of lading** - the core document behind $5 trillion of global trade |
| **Degree of autonomy** | User triggers an AI response | **Event-driven + autonomous decisions + on-chain execution** |
| **Depth of official tool use** | Shallow integration (contract deployment only) | **Three pillars**: Injective (execution layer) + ENI (trust layer) + Lixun (scenario layer) |
| **Industry resources** | Purely on-chain demo | **Real logistics scenario + industry customers** |

### Mapping to the Judges' Scoring Criteria

| Scoring criterion (predicted) | AgentBL highlights |
|----------------|---------------|
| **Innovation** | ✅ Replaces the bank instead of serving it<br>✅ AI prices the cargo rather than a credit score<br>✅ Autonomous decisions + on-chain enforcement |
| **Technical implementation** | ✅ Complete smart contracts (5 contracts)<br>✅ 155 automated tests<br>✅ AI pricing engine + multi-agent system |
| **Use of official tools** | ✅ Injective inEVM deployment (verifiable)<br>✅ ENI uniqueness control (core feature)<br>✅ Lixun logistics data (real scenario) |
| **Commercial value** | ✅ Addresses the US$2.5 trillion gap<br>✅ Replaces traditional bank trade finance<br>✅ Already has an industry customer (Lixun) |
| **Demo completeness** | ✅ End-to-end loop (on-chain → pricing → in-transit decision → settlement)<br>✅ Extreme-scenario stress test (war)<br>✅ Traceable on-chain evidence |

---

## 🔤 Key Terms Glossary (for subtitling)

| Term | English |
|-----|---------|
| Electronic bill of lading | Electronic Bill of Lading (eBL) |
| Trade finance | Trade Finance |
| Document of title | Document of Title |
| Multiple bills for one shipment | Double Financing / Cargo Duplication Fraud |
| Cargo value estimate | Cargo Valuation |
| War premium | War Premium |
| War exclusion clause | War Exclusion Clause |
| Discounted issuance | Discounted Issuance |
| Target redemption price | Target Redemption Price |
| Risk basis points | Risk Basis Points (bps) |
| Autonomous decision | Autonomous Decision |
| On-chain execution | On-chain Enforcement |
| Trusted document layer | Trusted Document Layer |
| Uniqueness control | Uniqueness Control |

---

## 📊 Numbers Checklist (all numbers can be read out as-is; they come from real tests)

- **$2.5 trillion**: the global trade finance gap
- **30–45 days**: the payment cycle for traditional trade finance
- **$4.5 million**: the case cargo value (500 tonnes of copper)
- **$0.80 / $0.85 / $0.90**: the three issue prices (FAST / BALANCED / SAFE)
- **20% / 15% / 10%**: the corresponding discount rates
- **+25% / +17.9% / +11.1%**: target investor returns
- **21%**: cargo value haircut in the war scenario
- **1410 basis points**: risk score in the war scenario
- **< 3 seconds**: time for the AI to go from detecting the risk to executing on-chain

---

## 🎤 Recording Tips

### Pace and Rhythm
- **0:00–0:35 Opening**: slightly fast, grab attention
- **0:35–1:15 ENI section**: medium pace, emphasise the core technology
- **1:15–2:00 AI pricing**: medium pace, data-heavy so keep it clear
- **2:00–2:35 In-transit decision**: **slow down**, this is the climax
- **2:35–3:00 Wrap-up**: slightly fast, finish strong

### Tone and Emphasis
- **"Replacing the bank"**: stress it, this is the core narrative
- **"ENI trusted document layer"**: say it clearly, highlight the official tool
- **"Autonomous AI decision"**: stress it, this is the technical highlight
- **"Code decides everything"**: stress it, the Web3 spirit

### Backup Plans
If the web demo has problems:
1. **Plan B**: use terminal commands throughout
   - `npm run demo:once` (full end-to-end loop)
   - `npm run agent:value` (AI tool calls)
   - `npm run demo:default` (three settlement outcomes)
2. **Plan C**: explain with slides + the architecture diagram
   - Every core concept can be illustrated with a diagram
   - Numbers and evidence come from the test output

---

## 🎬 Final Checklist (before submission)

- [ ] Opening shows "Injective × Microsoft × Web3Labs Rising Star Program"
- [ ] "Injective" mentioned at least 3 times
- [ ] "ENI trusted document layer" mentioned at least 2 times
- [ ] "Lixun Technology" mentioned at least 2 times
- [ ] Demo shows the Injective Testnet connection
- [ ] Demo shows cargoHash uniqueness
- [ ] Demo shows the autonomous AI decision process
- [ ] Demo shows on-chain transaction hashes
- [ ] Length kept to 3 minutes ± 10 seconds
- [ ] English subtitles cover all key lines
- [ ] Last 5 seconds show the tagline full screen

---

## 💡 Key Lines (for social media / promotion)

**English**:
> AgentBL: Exporters tokenize eBLs. AI prices cargo risk. Global investors fund directly. No bank required.

> Traditional banks ask "Who are you?" AgentBL asks "How much is this cargo worth and how risky is this route?"

> The eBL is the collateral. The smart contract is the settlement. Code enforces everything.

> Powered by Injective × ENI × Lixun Technology: Execution Layer × Trust Layer × Real-World Scenario Layer.
