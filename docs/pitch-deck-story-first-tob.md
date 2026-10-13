# AgentBL 5-Minute Story-Driven To-B Pitch Outline

> Version: 2026-07-23
>
> Audience: Top 10 Demo Day / investors / industry partners.
>
> Goal: use one batch of real-world cargo to tell a complete story, use the demo to prove how finished the product is, then use industry resources and a To-B path to prove this is not a one-off hackathon project.

---

## 1. What this version is about

### 1.1 The single storyline

> **A shipment has already left port, but the exporter's money has not come back yet. AgentBL lets AI keep understanding the risk while the cargo is at sea, and turns it into a financing price and action recommendation that both businesses and capital providers can use.**

This is not a talk about the number of contracts, model parameters or Web3 jargon. The audience only needs to see:

```text
One batch of real cargo
→ One set of real trade documents
→ AI gives an explainable financing quote
→ Investors understand it and subscribe
→ Shipping risk changes
→ AI immediately reprices and pauses the risky deal
→ Businesses can embed this capability in their own operations
```

### 1.2 What the judges should remember

1. **AI × the real world**: the AI understands cargo, documents, insurance, logistics routes and world events; it does not just process on-chain tokens.
2. **Completeness**: a live demo of the full loop, from exporter financing to investor subscription to in-transit risk intervention.
3. **To-B ready**: logistics platforms, eBL providers, trade finance institutions, insurers and industrial capital can buy or integrate it directly.
4. **Industry resources**: the project is not searching for a use case from scratch; it bridges trusted documents, logistics customers, system integration and financial resources.
5. **Global infrastructure**: Microsoft Azure provides enterprise-grade AI and Injective provides globally accessible payment and settlement; compliance is handled by an institutional access layer, and we never use the phrase "bypassing regulation".

### 1.3 Closing slogan

```text
AgentBL turns every shipment into an AI-priced financial opportunity.
```

---

## 2. 5-minute structure

| Slide | Time | Content | Format |
|---|---:|---|---|
| 1 | 0:00–0:15 | One shipment's cash-flow squeeze | Story opening |
| 2 | 0:15–0:40 | Why today's system cannot solve it | Pain point + solution |
| 3 | 0:40–1:35 | Demo act 1: the exporter gets an AI quote | Live demo |
| 4 | 1:35–2:20 | Demo act 2: the investor understands and subscribes | Live demo |
| 5 | 2:20–3:05 | Demo act 3: risk shifts, the AI pauses the deal | Live demo |
| 6 | 3:05–3:50 | To B: why businesses will pay | Business value + x402 demo |
| 7 | 3:50–4:35 | Industry resources and go-to-market path | Resource flywheel + GTM |
| 8 | 4:35–5:00 | Expansion goals, partnership ask and close | Future + Ask |

Total: `300 seconds`.

> Slides 3–5 show the same deal continuously without returning to the slides. The deck only serves as chapter titles; the product interface is the star.

---

## 3. Slide-by-slide content and script

### Slide 1 | A ship has already left port, but the next deal is stuck

**Time: 0:00–0:15 | 15 seconds**

#### Screen shows only

```text
500 MT Copper Cathode
Singapore → Shanghai

The cargo has left port; the cash is still 30–45 days away.
```

Use a real cargo ship / port photo as the background, overlaid with a route from Singapore to Shanghai. Do not put an architecture diagram on the cover.

#### Script

> This is 500 tonnes of copper shipped from Singapore to Shanghai. The cargo has left port, but the exporter still has to wait 30 to 45 days to get paid, while the next purchase order and payroll are due today. The problem is not that he has no assets: millions of dollars of cargo are on the water right now. The problem is that nobody can understand this shipment's risk fast enough to give a credible financing price.

#### The question the audience should ask

"If the cargo, the bill of lading and the route can all be verified, why can't he get funded right now?"

---

### Slide 2 | Traditional systems look at corporate credit; AgentBL looks at this shipment

**Time: 0:15–0:40 | 25 seconds**

#### Screen content

Side-by-side comparison, only three rows:

| Traditional process | AgentBL |
|---|---|
| Manual cross-checking of many documents | AI cross-verifies the eBL, invoice and insurance |
| Company size decides whether you can be financed | Cargo, route and real-time risk decide the price |
| Manual tracking after risk changes | AI monitors in transit and triggers repricing / pausing |

One line at the bottom:

```text
The AI does not answer "Is this deal safe?"
The AI must answer "What is it worth today, how much can be financed, and should we keep going right now?"
```

#### Script

> Traditional trade finance first asks whether a company has enough credit history and scale, and real cargo has to go through a long manual review. AgentBL changes what is being judged: instead of labelling the company first, we continuously assess this shipment, this route and this set of documents. In the end the AI cannot just write a report; it has to produce a price, a limit and an action.

#### Transition

> Instead of explaining with slides, let's watch this copper get financed.

---

### Slide 3 | Demo act 1: three documents become one financing quote

**Time: 0:40–1:35 | 55 seconds**

#### Screen

Switch straight to the product's `Pricing & Mint` page, with the following preselected:

```text
Copper Cathode · Singapore → Shanghai, China (Yangshan Port)
EBL-2026-CU-04417
MV Marina Star · 500 MT
```

#### Click sequence

1. Point to the three inputs: eBL, commercial invoice and insurance policy. Do not open the file picker live.
2. Point to `AI-verified collateral value $6,531,250`.
3. Quickly sweep through the six risk categories: documents, insurance, commodity price, war, weather, port.
4. Stop at the three financing options: FAST `$0.800`, BALANCED `$0.848`, LOW_COST `$0.889`.
5. Select the AI-recommended BALANCED option: the exporter gets `$3.30M` now, at an issue price of `$0.848`.

#### Zoomed-in screen area

```text
Declared value          $6.875M
AI-verified collateral  $6.531M
Cash to exporter        $3.300M
AI-recommended price    $0.848
Action                  OPEN
```

#### Script

> The exporter submits the electronic bill of lading, the invoice and the insurance policy. AgentBL first checks that quantity, value, route and insurance are consistent with each other, then combines commodity prices, logistics and world risk. Here the AI conservatively verifies the declared value of $6.875 million as $6.531 million and offers three cash speeds. The faster the exporter needs the money, the more trade margin he gives up. The AI recommends the balanced option: $3.3 million now, with an RWA issue price of 0.848.

> We don't ask businesses to trust a one-line AI verdict. Every number can be traced back to documents, sources and risk evidence.

#### What this act proves

- The AI understands real business objects; it is not a general-purpose chat.
- The output feeds directly into a corporate financing decision, not a "for reference only" suggestion.
- The exporter understands the product through "cash speed" without having to understand Web3 first.

#### Do not demo

- Do not explain the pricing formula or the detailed basis-point algorithm.
- Do not upload files live, to avoid file dialogs and network hiccups breaking the rhythm.
- Do not show 20-plus cases; talk only about this copper shipment.

---

### Slide 4 | Demo act 2: the investor sees not a high yield, but the price of risk

**Time: 1:35–2:20 | 45 seconds**

#### Click sequence

1. Click `Investment Marketplace` at the top.
2. Keep the first copper deal card selected; do not browse other deals.
3. Point to `$0.848`, `17.9% implied gross upside`, `350 bps`, `$6.53M collateral value`.
4. Enter the preset amount `$260,000` on the right.
5. Click `Simulate subscription`.
6. Stop on the result card showing "expected RWA received / target redemption / target redemption is not guaranteed".

#### Script

> The capital provider sees the other side of the same deal: a 0.848 issue price, $6.53 million of collateral value, 350 basis points of risk, and the full set of risk sources. Invest $260,000 and the system calculates the matching share and target redemption. We deliberately put "not principal-protected" in the most visible spot: what the investor buys is not a promise, but a risk that has been priced by AI and is continuously monitored.

> Once this step is done, the funds enter a permissioned financing pool, the exporter gets cash early, and the investor receives the corresponding trade finance share.

#### The screen must make this visible

```text
Target redemption is not guaranteed.
It depends on importer payment, cargo settlement and insurance coverage.
```

#### What this act proves

- The product serves both the supply side and the capital side.
- Risk, return and collateral are shown in one decision interface.
- This is not "selling high-yield tokens to retail", but a permissioned asset workflow that institutions can understand.

---

### Slide 5 | Demo act 3: the cargo is still at sea, but the world has changed

**Time: 2:20–3:05 | 45 seconds**

#### Click sequence

1. On the first copper deal card, click `Track`; do not click `Open voyage view` at the bottom, which may be hidden.
2. Spend 5 seconds showing the virtual voyage progress and current status: `$0.848 / 350 bps / OPEN`.
3. Click `⚔ Strait of Hormuz escalation`.
4. Stop on the key changed results:

```text
Issue price   $0.848 → $0.792
Risk score    350 → 1,100 bps
Status        OPEN → PAUSED
New evidence  0x9966a785…
```

5. Point to `InTransit → Paused` in the status timeline.

#### Script

> Once the cargo leaves port, risk does not stop. Now we simulate an escalation of conflict: commodity prices may rise, but insurance, routing, sanctions and future recovery risk all deteriorate at the same time. An ordinary pricing system only sees "copper got more expensive"; AgentBL sees several layers of protection weakening together.

> The AI immediately raises the risk from 350 to 1,100 basis points, adjusts the price from 0.848 to 0.792, and pauses new subscriptions. It does not write the company a warning email; it stops more capital from flowing into a deal whose risk has changed.

#### This act is the climax of the pitch

The judges should understand here:

> **The value of AI is not just understanding the world, but changing what a business does at the right moment.**

#### Truthfulness rules

- Say explicitly "simulated conflict event" and "virtual voyage time".
- When the page shows an offline fixture, do not call it a live news feed.
- Do not go on to click a second risk event; one clear change is more powerful than a screen full of alerts.

---

### Slide 6 | To B: we don't sell a dashboard, we sell a business's risk-decision capability

**Time: 3:05–3:50 | 45 seconds**

#### Screen content

Use three columns, "customer — what they buy — business outcome", instead of generic personas:

| Who buys | What they buy | Why they pay |
|---|---|---|
| Logistics / freight forwarders / supply-chain platforms | eBL verification + AI financing module | Adds financial services and revenue for existing customers |
| eBL / trade digitisation platforms | Risk pricing API | Upgrades from "digitised documents" to "financeable documents" |
| Banks / factoring / industrial capital | AI pre-screening and continuous monitoring | Shortens manual due diligence and unifies the risk view |
| Insurers | Route, cargo and policy risk | Spots coverage gaps and major events early |
| Institutional investors | Explainable asset screening and evidence | Understand where the risk comes from before committing capital |

Bottom-right, three enterprise products:

```text
Embedded Risk API
White-label eBL Financing Module
Permissioned RWA Infrastructure
```

#### Script

> AgentBL's To-B advantage is that we don't ask businesses to replace their existing systems. Logistics platforms can embed our eBL verification and financing module, banks or factoring firms can use the AI as a pre-screening and in-transit monitoring layer, insurers can buy route and policy risk, and institutional capital gets a unified body of investment evidence.

> We sell risk judgement first, then take on financing transactions. A business can start with one API or one white-label module; it doesn't have to deploy a full RWA protocol on day one.

#### Accompanying 10–15 second business demo

At the bottom of the voyage detail, point to the three enterprise reports:

```text
Premium Risk Intelligence
Premium Cargo Valuation
Anti-Fraud Document Review
```

If Demo Mode has been verified as stable across repeated runs, click `Run Demo: Premium Risk Intelligence` once so the judges see:

```text
request → 402 payment required → USDC authorization → report unlocked
```

If the venue is in Live Mode or the network is unstable, only show the pre-prepared report and the testnet payment evidence; do not make an ad-hoc payment.

#### Business model, in order

1. **Enterprise licence / white-label module**: annual contracts or project-based, providing stable budgets and customer relationships.
2. **Usage-based risk API**: billed per document, per report, per monitoring event, growing with business volume.
3. **Financing protocol fee**: the permissioned pool charges based on successfully financed volume.

Do not present the testnet `0.001 USDC` as formal enterprise pricing; it only proves the machine-payment loop.

#### Core To-B advantages

- No change to the customer's front end or core ERP; it embeds only at the API / module layer.
- Decisions are explainable and replayable, which makes adoption easy for risk, audit and compliance teams.
- A deterministic fallback when the AI is unavailable, suitable for enterprise SLAs rather than a one-off demo.
- The same capability serves several budget owners: operations, risk, financing, insurance and investment.
- Every deal accumulates "document — risk — action — outcome" records, forming a data flywheel.

---

### Slide 7 | Industry resources: we are already standing next to real business entry points

**Time: 3:50–4:35 | 45 seconds**

#### Screen content

Don't just line up logos; draw the value each resource feeds into the product:

```text
Lixun Technology / logistics digitisation resources
Customer access · forwarder/supply-chain scenarios · system integration · business processes
                         ↓
ENI / trusted-document capability → AgentBL → bank, RWA and cross-border finance resources
Uniqueness · control      AI risk pricing      capital and compliance pilots
Tamper-proof · audit
                         ↓
             Microsoft Azure + Injective
             Enterprise AI · global payment and settlement
```

Central headline:

```text
Real documents + real logistics scenarios + real capital entry points
```

#### Script

> The hardest part of trade finance is not writing a model; it is getting three things at once: real documents, real logistics scenarios and real access to capital. Our industry resources cover exactly these three ends.

> On the Lixun Technology side, we get business scenarios and system-integration capability from logistics, freight-forwarding and supply-chain companies; on the ENI side, the uniqueness, control, integrity and audit capabilities an eBL needs; and the team's banking, RWA and cross-border finance resources carry the risk judgement into real capital pilots. Microsoft Azure brings this AI capability up to an enterprise standard that can be evaluated and traced, while Injective handles global machine payments and programmable settlement.

> So our advantage is not "one more model than everyone else", but being closer to the data entry point, the customer entry point and the transaction entry point.

#### Industry resources must be stated according to evidence level

| What evidence we have | Wording allowed on the slide |
|---|---|
| Signed contract / LOI / pilot | `Partner / joint pilot`, with the scope spelled out |
| Existing API schema / sandbox / sample ID | `Technical integration in progress / sandbox integration` |
| A named contact and a joint plan, but nothing signed | `Industry resources / co-design network / pilot pipeline` |
| Only a target list | `Next-stage target partners`; must not appear on the partner logo wall |

The current repo task list still marks formal evidence for `ENI / TradeGo / Lixun` as outstanding. If there is no LOI, API or sample document ID before the pitch, title this slide "**Industry resources and co-build path**" and do not say "already integrated in production".

#### To-B rollout path

```text
Step 1: Risk report API
Validate speed, accuracy and usage frequency inside the customer's existing document flow
        ↓
Step 2: eBL + AI pre-underwriting white-label module
Help logistics/eBL platforms add financing services
        ↓
Step 3: Permissioned financing pool
Licensed institutions, KYC/AML and qualified capital providers participate together
        ↓
Step 4: Cross-route risk intelligence network
Continuously calibrate risk prices with real settlement outcomes
```

This path shows that we enter with low-regulatory-friction To-B software with clear value, then gradually move into higher-value financial transactions.

---

### Slide 8 | Starting from one copper shipment, becoming the AI risk layer of global trade

**Time: 4:35–5:00 | 25 seconds**

#### Screen content

Left: only three outcomes for the next 12 months, no feature list.

```text
1–2 real logistics / eBL pilots
2–3 institutional risk-data customers
1 compliant permissioned financing corridor
```

Right, the Ask:

```text
We are looking for:
· Industry pilot partners
· Trade data and insurance partners
· Compliant capital providers
· [Funding amount] pre-seed / strategic round
```

Closing line at the bottom:

```text
Today: AI prices one shipment.
Tomorrow: AgentBL prices global trade risk.
```

#### Script

> We start with one copper shipment, but the goal is not to build yet another RWA marketplace; it is to become the AI risk layer of global trade. Over the next 12 months we will complete real eBL and logistics pilots, win our first institutional data customers, and validate a permissioned financing loop in one compliant trade corridor.

> We are looking for industry pilot partners, trade and insurance data partners, compliant capital providers, and strategic investment to support these three milestones. AgentBL: giving every shipment in transit a real-time, trusted, financeable risk price. Thank you.

---

## 4. Demo Day operating script

### 4.1 State before going on stage

1. Start `npm run dev` and confirm the page works without internet access.
2. Explicitly choose **Demo Mode** or **Live Mode**; never leave an ambiguous state where "the page says Live but the data is an offline fixture".
3. Use the Chinese UI (button names in this document are given as their English UI labels); select `Copper Cathode · Singapore → Shanghai`.
4. Click `Reset demo` and confirm the price is back to `$0.848`, risk `350 bps`, status `OPEN`.
5. Pre-scroll to the top of the `Pricing & Mint` page.
6. Fix browser zoom, window position and font size; turn off notifications, wallet auto-popups and unrelated tabs.
7. Pre-open a recent Injective testnet transaction as a backup; do not search for addresses on stage.
8. Prepare a 60–90 second screen recording as an offline fallback; its numbers must match the live script.

### 4.2 One-take click sheet

| Time | Action | Feedback that must appear |
|---:|---|---|
| 0:40 | Already on the Mint page | 500 MT, $6.531M, $0.848 |
| 1:05 | Point to BALANCED | $3.30M cash, AI recommended |
| 1:35 | Click `Investment Marketplace` | First copper deal card selected |
| 1:52 | Click `Simulate subscription` | RWA amount, target redemption, not-guaranteed notice |
| 2:20 | Click `Track` on the first copper card | Voyage detail modal |
| 2:35 | Click `⚔ Strait of Hormuz escalation` | $0.792, 1,100 bps, paused |
| 3:25 | Scroll to the x402 report section | Three types of To-B reports |
| 3:35 | Optional: run one demo report purchase | 402 → report unlocked |
| 3:50 | Switch back to the industry-resources slide | Start the To-B rollout segment |

### 4.3 Say only four numbers during the demo

```text
$6.531M   AI-verified collateral value
$3.300M   Cash the exporter wants now
$0.848    Initial AI issue price
1,100bps  Risk score after the conflict; deal paused
```

`$0.792` is only a visual change point; don't explain the yield formula again. The fewer the numbers, the easier the story is to remember.

### 4.4 Pitfalls to avoid on stage

- The home page figures `22 deals / $98.03M` are demo data, not actual GMV or customer traction.
- The current virtual voyage date differs from the real date; always say "virtual time".
- Offline / mock sources must be stated truthfully on screen and in the script.
- Do not connect an unfamiliar wallet live or make uncontrollable Live payments.
- Do not show Mystery Voyage, the MCP tool list, contract ABIs or full test logs within the 5 minutes.
- Do not describe "the x402 paid report" and "investing in the RWA" as the same transaction.
- Do not say "bypassing each country's regulations"; say instead "global distribution and payment, while keeping institutional KYC/AML and jurisdictional requirements".

---

## 5. Expressing To-B value

### 5.1 Don't sell features; sell measurable business outcomes

| Avoid saying | Say instead |
|---|---|
| We have document parsing | We turn manual pre-review of a multi-document shipment into a traceable structured judgement |
| We have a risk score | Every risk change maps to a price, limit or pause action |
| We have on-chain contracts | Customers and auditors can check which piece of evidence triggered which action |
| We support x402 | Businesses and agents can buy risk intelligence per call, without an account |
| We have MCP | Other companies' agents can call AgentBL as a standard tool |
| We have lots of cases | One product can cover multiple trade assets such as seaborne cargo and warehouse receipts |

### 5.2 KPIs the pilots should validate

Do not invent "80% cost reduction" without data. The first pilots should jointly measure:

```text
Quote turnaround time        Time from document submission to a financeable quote
Manual review workload       Fields and minutes of manual review needed per shipment
Document exception recall    Detection rate for insurance gaps, quantity mismatches, double pledging, etc.
Decision explainability      Whether risk staff can verify the risk sources and the action
Monitoring response time     Time from a risk event appearing to repricing/pausing
Report purchase conversion   Whether institutions are willing to pay for risk intelligence
Financing conversion         Share of qualified quotes that turn into real financing
Outcome calibration          Agreement between predicted risk and actual settlement/recovery outcomes
```

### 5.3 To-B moat

```text
Industry access
Logistics / eBL platforms bring business customers and workflows
    ↓
Proprietary data
Documents, routes, policies, exceptions, settlement and recovery outcomes
    ↓
Decision model
Prices, limits and actions for similar cargo and routes become ever more accurate
    ↓
Stronger product
Faster pre-review, lower manual cost, more trusted financing
    ↓
More industry access
```

Competitors can copy an interface or a contract, but it is hard to copy industry distribution, trusted documents, outcome data and financial-institution workflows all at once.

---

## 6. How to talk about Microsoft Azure and Injective

### 6.1 Microsoft Azure: talk about enterprise trust, not model brands

On the main stage, say just one sentence:

> Microsoft Azure gives AgentBL enterprise-grade AI inference, evaluation and call-chain tracing, so every risk judgement can be measured, replayed and governed.

Suggested on-stage evidence:

- The demo actually runs on the Azure provider;
- One clean trace screenshot: `document → risk → valuation → pricing → action`;
- One set of evaluation results: Task Completion, Tool Success, Groundedness;
- Do not show keys, complex consoles or model parameters.

If this run has no real Azure configuration, you may only say "supports an Azure provider and evaluation/tracing interfaces", not "this session is powered by Azure".

### 6.2 Injective: talk about global business capability, not on-chain jargon

On the main stage, say only:

> Injective lets institutions, investors and other AI agents complete machine payments, risk-evidence verification and programmable settlement on one shared global infrastructure.

Corresponding business value:

- Global customers can use a single USDC / wallet payment channel;
- AI risk reports can be bought per call by other agents;
- Key quotes, payments and status can be jointly verified by multiple parties;
- Businesses can still keep KYC/AML, qualified-investor and regional restrictions in the access layer.

Do not say "blockchain can bypass each country's regulations". Investors will hear that as an unsustainable regulatory risk.

---

## 7. Material the team must supply for the industry-resources slide

Industry resources are the core of this version of the pitch, but they must be verifiable. Before the pitch, prepare at least two of the following three types of material:

1. **One proof of partnership**: an LOI, confirmed meeting minutes, a joint pilot scope, or a contact at the partner who can be named publicly.
2. **One technical proof**: an ENI / TradeGo / Lixun API schema, sandbox screenshot, sample document ID or anonymised data flow.
3. **One customer proof**: a clear pilot company type, business volume, pain point and the KPIs they are willing to validate.

Under each logo, write only one real contribution:

```text
Lixun Technology: logistics customer scenarios and system integration
ENI: eBL trusted documents and international-standard capability
Team financial resources: bank / RWA / cross-border capital pilots
Microsoft Azure: enterprise AI evaluation and observability
Injective: global machine payments and programmable settlement
```

Without public authorisation, do not show the partner's logo; use the text "Industry resources / pilot discussions in progress" instead.

---

## 8. 15-second Q&A

### Why wouldn't a company build this itself?

> A company can plug in a model itself, but it is hard to cover trade-document semantics, dynamic pricing, in-transit monitoring, audit evidence and cross-border payment all at once. AgentBL embeds into existing systems as an API and white-label module; the customer keeps the business entry point, and we provide a continuously updated risk-decision layer.

### To-B sales cycles are long; how do you get started?

> We start with risk reports and AI pre-screening that don't touch real money, and prove value with clear KPIs; then expand to continuous monitoring and the eBL financing module; and only move into the permissioned financing pool once licensed partners, KYC/AML and qualified capital providers are in place.

### What is your relationship with logistics SaaS?

> We don't replace logistics SaaS. Logistics platforms own the customers, waybills and workflows; AgentBL helps them upgrade from "seeing where the cargo is" to "knowing what this shipment is worth right now, whether it can be financed, and what to do when risk changes".

### Do you compete or cooperate with banks?

> In our product vision, we reduce dependence on traditional manual credit approval; on the rollout path, banks, factoring firms and licensed institutions can be capital, compliance and distribution partners. The To-B version first helps institutions pre-screen faster and monitor continuously, rather than claiming to replace every bank from the start.

### Why is Web3 necessary?

> Because the buyers of risk reports, the providers of financing and the trade participants may come from different systems and regions. Injective provides unified payment, shared evidence and programmable settlement, so multiple parties don't have to rely on one centralised database, while access and compliance are still governed by institutional rules.

### Have the industry partnerships actually landed?

> Answer according to the actual evidence. If nothing is signed yet: we already have a clear co-build plan and resource mix, and the current goal is to firm this up into 1–2 real pilots through sandbox/API/LOI; we will not describe conversations and plans as production launches.

---

## 9. Final self-check

- [ ] The first 3 minutes all revolve around the same copper shipment, with no jump to a second story.
- [ ] The demo runs continuously through "quote → subscribe → risk escalation → pause".
- [ ] Page mode, data sources and script are consistent.
- [ ] Whether Azure is actually running or only supported is stated accurately.
- [ ] Industry partners are labelled by evidence level; no plan is presented as a signed partnership.
- [ ] The To-B slide talks about customer outcomes, not a list of API/contract features.
- [ ] Demo GMV, deal count or implied returns are not presented as real traction.
- [ ] None of these were used: "bypassing regulation", "guaranteed profit", "principal-protected", "every bank can be replaced".
- [ ] The close makes a clear industry-partnership and funding Ask.
- [ ] The whole pitch stays within 5 minutes, with a 90-second screen recording as a fallback.

