# 🎬 AgentBL · 3-Minute Video Script (Web Demo Version)

> **Goal**: Submission video for the Injective × Microsoft × Web3Labs Nova Program
>
> **Length**: 3 minutes (180 seconds)
>
> **Format**: Pure web demo + voice-over narration
>
> **Core message**: Web3-native trade finance + autonomous AI pricing + Microsoft Azure AI + Injective on-chain execution

---

## 🎯 Opening Title (5 seconds)

**[Full-screen caption]**
```
AgentBL
Web3-Native Trade Finance Protocol

Exporters put eBLs on-chain · AI prices the risk · Investors finance directly

Powered by: Injective × Microsoft Azure AI × ENI × Lixun Technology
```

---

## 📺 Video Script + Operating Guide

### [0:00–0:25] Opening: Pain Point + Solution

**[Visual]** 
- Browser opens the Dashboard home page
- Mouse rests on the page title

**[Voice-over]**
> Hi everyone, this is AgentBL.
>
> In international trade, after the goods are loaded onto the ship, it takes **30 to 45 days** for the exporter's money to come back. The global trade finance gap is as high as **2.5 trillion US dollars**.
>
> What AgentBL does is: **let exporters put electronic bills of lading on-chain, have AI price the risk in seconds, and let global investors subscribe directly. No bank approval needed.**
>
> We use **Microsoft Azure OpenAI** to power the AI pricing engine, and every decision is executed on the **Injective** chain. Over the next 3 minutes we'll demo the complete flow.

**[Actions]**
1. Open the browser and go to `http://localhost:3000`
2. Make sure the top of the page shows "● Connected to Injective Testnet"
3. Keep the mouse on the page without clicking so viewers can see the interface clearly

---

### [0:25–1:10] Demo ①: AI Pricing Engine + Data Sources

**[Visual]** 
- Select the case from the top dropdown: **"Clean copper · Singapore → Shanghai"**
- The AI Pricing Console expands automatically
- Show the waterfall chart and data source tags

**[Voice-over]**
> First, let's see how the AI prices. I'll pick a case: a Singapore exporter shipping 500 tonnes of copper cathodes to the port of Shanghai.
>
> **The AI automatically starts the workflow**:
> - Calls the real-time **LME copper price API** to value the cargo → 4.5 million US dollars
> - Cross-checks the electronic bill of lading, commercial invoice and insurance policy — checking whether quantities match, whether the insurance is sufficient, and whether the policy will expire
> - Pulls geopolitical, weather and route risk through the **xAPI protocol**
> - Connects to the **Lixun Technology logistics system** to get this route's historical on-time rate
>
> **The AI engine uses Microsoft Azure OpenAI's GPT-4 model** to extract risk factors from large volumes of real-time data, and then offers three financing options:
> - **FAST payout**: 20% discount, issue price $0.80
> - **BALANCED**: 15% discount, issue price $0.85  
> - **SAFE**: 10% discount, issue price $0.90
>
> Look here: every data point is labelled with its source — LME copper price, UN Comtrade, xAPI risk intelligence — **fully traceable and auditable**.

**[Actions]**
1. In the case dropdown at the top of the page, select **"Clean copper · Singapore → Shanghai"**
2. Wait for the AI Pricing Console to expand (about 2-3 seconds)
3. **Scroll slowly** through the waterfall chart so viewers can see each layer
4. **Point the mouse** at the tags in the "Data Sources" section (LME, xAPI, Lixun data)
5. **Point the mouse** at the three-tier issue price comparison ($0.80 / $0.85 / $0.90)

---

### [1:10–1:50] Demo ②: ENI Anti-Fraud + One-Click On-Chain

**[Visual]** 
- Switch the case to: **"Copper · Shanghai → Hamburg (insurance gap)"**
- Show the risk dimension cards (insurance item highlighted in red)
- Click the "⛓️ Mint RWA On-Chain" button
- MetaMask pop-up for signing

**[Voice-over]**
> Second demo: **anti-fraud and going on-chain**.
>
> I'll switch to another case — this cargo has an insurance problem. Look, the AI immediately detects: **the insured amount is below the cargo value, and the policy expires almost exactly on the day of arrival at port**.
>
> These are all risk points that a traditional bank's trade finance department has to review manually. AgentBL's AI does it automatically, converting each red flag into **risk basis points** that directly push down the issue price.
>
> And when the electronic bill of lading goes on-chain, we use the **ENI trusted document layer**. ENI generates a **cargoHash** for each shipment — a SHA-256 hash of the vessel name, voyage and cargo — registered on-chain. **The same cargo can only be registered once, preventing loan fraud with multiple bills for one cargo**.
>
> Now I click "Mint RWA On-Chain" — look, MetaMask pops up; this is a real **Injective Testnet** transaction. Once signed, this RWA is created on-chain and global investors can subscribe.

**[Actions]**
1. Switch the case at the top to **"Copper · Shanghai → Hamburg (insurance gap)"**
2. Wait for the page to refresh
3. **Scroll slowly** to the "AI Cargo Valuation & Route Risk" card
4. **Point the mouse** at the red-flagged insurance items (Insurance, Document Consistency)
5. **Scroll to the bottom** and click the **"⛓️ Mint RWA On-Chain"** button
6. **Wait for the MetaMask pop-up** (if the wallet is already connected)
7. **Show the pop-up** (don't sign immediately; let viewers see it clearly)
8. **Click confirm** to sign
9. **Wait for the transaction to confirm** (about 5-10 seconds)
10. **Show the success state** (displaying the transaction hash)

---

### [1:50–2:35] Demo ③: Autonomous In-Transit Decisions (Climax)

**[Visual]** 
- Switch to the "Voyage Tracking" page
- Click the "⚔️ Simulate Hormuz Conflict Escalation" button
- Risk dimensions turn red, the AI reprices, and the status changes to PAUSED

**[Voice-over]**
> The third demo, and the most hard-core move: **autonomous AI decisions while in transit**.
>
> We simulate an extreme scenario: this copper is sailing at sea when suddenly **conflict in the Strait of Hormuz escalates**.
>
> At this point copper prices are actually rising — if you only looked at price, you'd think "the collateral is worth more, so it's safer". **That's completely backwards.**
>
> I click this "conflict escalation" button, and look at how the AI reacts:
> - All risk dimensions turn red
> - **Microsoft Azure OpenAI** re-analyses the situation: importer default probability rises, insurance fails because of the "war exclusion" clause, and the cargo recovery rate drops
> - The AI **decides autonomously**: it applies a 21% haircut to the cargo value and pushes the risk score to **1410 basis points**
> - Most importantly — the AI directly **executes a PAUSE on the Injective chain**, stopping new investors from entering and keeping them out of the blow-up
>
> This decision, **from detecting the risk to executing on-chain, is fully automatic with no human intervention**. That is the fundamental difference between an AI Agent and an ordinary AI chatbot.

**[Actions]**
1. Click "Voyage Tracking" in the navigation bar
2. Confirm the current case shows the "In Transit" status
3. **Hold for 2 seconds** so viewers can see the interface clearly
4. **Click the "⚔️ Simulate Hormuz Conflict Escalation"** button
5. **Wait for the AI to reprice** (about 3-5 seconds)
6. **Scroll slowly** to show:
   - Risk dimension cards turning red
   - New quote: cargo value -21%, risk 1410bps
   - Status changes to **"PAUSED"**
7. **Scroll to the bottom** to show the on-chain transaction hash
8. **(Optional) Click the transaction hash** to jump to the Injective block explorer

---

### [2:35–3:00] Wrap-Up: Tech Stack + Core Value

**[Visual]** 
- Return to the Dashboard home page
- Show the "Powered by" badge at the bottom of the page
- Last 5 seconds: full-screen tagline

**[Voice-over]**
> To sum up, AgentBL is a **Web3-native trade finance protocol**.
>
> On the tech stack:
> - **Microsoft Azure OpenAI**: powers the AI pricing engine, supporting GPT-4 tool calling and structured output
> - **Injective**: all smart contracts are deployed on the Injective inEVM testnet, and every AI decision is enforced on-chain
> - **ENI trusted document layer**: uniqueness control and tamper-resistance for electronic bills of lading
> - **Lixun Technology**: real logistics data and industry customer scenarios
>
> **Core value: replacing the bank**. Exporters don't need bank credit lines, investors don't need bank accounts, and AI plus smart contracts replace the bank's risk control, lending and clearing departments.
>
> **Code decides everything.** Thank you.

**[Actions]**
1. Return to the home page (click the logo in the top-left corner)
2. Scroll to the bottom of the page and show the "Powered by" badge
3. **Last 5 seconds**: switch to the full-screen caption

**[Full-screen caption]**
```
AgentBL
Web3-Native Trade Finance Protocol

AI pricing powered by Microsoft Azure OpenAI
Decisions executed on Injective
ENI anti-fraud, Lixun logistics scenarios

No bank. No intermediary.
The AI prices. The chain enforces.
```

---

## 🎯 Key Points to Emphasise (Mapped to Judging Criteria)

### ① Use of Microsoft Azure AI (mention at least 3 times)

| Timestamp | What is mentioned |
|--------|---------|
| [0:20] | "We use **Microsoft Azure OpenAI** to power the AI pricing engine" |
| [1:00] | "The AI engine uses **Microsoft Azure OpenAI's GPT-4 model**" |
| [2:15] | "**Microsoft Azure OpenAI** re-analyses the situation" |
| [2:45] | "**Microsoft Azure OpenAI**: powers the AI pricing engine, supporting tool calling" |

**Demo evidence**:
- `openaiCompatClient.js` in the code supports the Azure provider
- The explanation text in the AI pricing output (generated by GPT-4)
- The documentation explicitly notes the Azure OpenAI integration

### ② Use of Injective (at least 3 times)

| Timestamp | What is mentioned |
|--------|---------|
| [0:20] | "Every decision is executed on the **Injective** chain" |
| [1:35] | "This is a real **Injective Testnet** transaction" |
| [2:25] | "The AI directly **executes a PAUSE on the Injective chain**" |
| [2:45] | "All smart contracts are deployed on the **Injective inEVM testnet**" |

**Demo evidence**:
- MetaMask shows Injective Testnet (Chain ID 1439)
- The transaction hash links to the Injective block explorer
- The top of the page shows "● Connected to Injective Testnet"

### ③ ENI Trusted Document Layer (at least 2 times)

| Timestamp | What is mentioned |
|--------|---------|
| [1:25] | "We use the **ENI trusted document layer**" |
| [1:30] | "ENI generates a **cargoHash** for each shipment, preventing multiple bills for one cargo" |
| [2:45] | "**ENI trusted document layer**: uniqueness control" |

### ④ Lixun Technology Logistics Scenarios (at least 2 times)

| Timestamp | What is mentioned |
|--------|---------|
| [0:50] | "Connects to the **Lixun Technology logistics system** to get the route's historical data" |
| [2:50] | "**Lixun Technology**: real logistics data and industry customer scenarios" |

---

## 🎬 Recording Technical Notes

### Browser Settings
- **Resolution**: 1920×1080 or 1280×720
- **Zoom**: 100% (don't zoom, to keep it sharp)
- **Full-screen mode**: F11 full screen, hide the browser tab bar
- **Disable notifications**: avoid pop-ups interfering with the recording

### Mouse Handling
- **Move slowly**: let viewers keep up
- **Point clearly**: pause for 1-2 seconds when pointing at important information
- **Scroll smoothly**: no jumpy scrolling

### Backup Plans (if the web page is unstable)

**Plan B: Terminal demo**
```bash
# Complete end-to-end demo
npm run demo:once

# Three settlement outcomes
npm run demo:default

# AI tool-call trace
npm run agent:value
```

**Plan C: Screenshots + PPT**
- Capture the key screens in advance
- Present them in a PPT with voice-over narration
- Numbers and evidence come from the test output

---

## ⏱️ Time Allocation Summary

| Timestamp | Content | Duration |
|-------|------|------|
| 0:00-0:25 | Opening + pain point + tech stack | 25 seconds |
| 0:25-1:10 | AI pricing engine demo | 45 seconds |
| 1:10-1:50 | ENI anti-fraud + on-chain | 40 seconds |
| 1:50-2:35 | Autonomous in-transit decisions (climax) | 45 seconds |
| 2:35-3:00 | Wrap-up + tech stack summary | 25 seconds |
| **Total** | | **180 seconds** |

---

## 📋 Pre-Submission Checklist

- [ ] Mention "Microsoft Azure OpenAI" at least 3 times
- [ ] Mention "Injective" at least 3 times
- [ ] Mention "ENI" at least 2 times
- [ ] Mention "Lixun Technology" at least 2 times
- [ ] Demo MetaMask connecting to Injective Testnet
- [ ] Demo the complete AI pricing flow
- [ ] Demo the cargoHash anti-fraud mechanism
- [ ] Demo autonomous in-transit decisions (war scenario)
- [ ] Show the on-chain transaction hash
- [ ] Keep the length to 3 minutes ± 10 seconds
- [ ] Show the full tagline in the opening and closing titles

---

## 💡 One-Line Summary (for Social Media)

> AgentBL: Exporters tokenize eBLs. Microsoft Azure AI prices risk. Injective enforces decisions. Global investors fund directly. No bank required.
