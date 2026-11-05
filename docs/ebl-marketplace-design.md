# eBL Taobao-Style Marketplace + AI Smart Recommendations

> **Design goal**: upgrade AgentBL's electronic bill of lading (eBL) browsing experience from a "lab toggle" into a "Taobao-style product marketplace" — card-based display, multi-dimensional filtering and natural-language AI recommendations, lowering the barrier to investment decisions.
>
> **Related challenge**: [Injective Nova Program gap analysis](./injective-hackathon-gap-analysis.md) — Direction 4 (productising supply chain finance), Direction 6 (frontend productisation), 5.3 (AI financing advisor), 5.4 (AI conversational interface)
>
> **Design date**: 2026-06-20

---

## 1. Problem and Opportunity

### 1.1 Current State

```
┌────────────────────────────────────────────────────────┐
│  [Copper·Singapore→Shanghai] [Copper·Shanghai→Hamburg] │
│  [Crude·Singapore→Ulsan] [War Crisis]                  │  ← top pill buttons, only one visible at a time
└────────────────────────────────────────────────────────┘
```

- Only 4 hard-coded cases, switched via the top `seg-btn`
- Users cannot browse all investable eBLs at once
- No filtering, sorting or comparison
- The AI assistant (popup-assistant) is a separate floating window, disconnected from case browsing

### 1.2 Target Experience

```
┌──────────────────────────────────────────────────────────────┐
│  🤖 "I want higher returns, ideally medium risk"  [Search]   │  ← AI natural-language search bar
├──────────────────────────────────────────────────────────────┤
│  Category: [All] [Copper] [Crude Oil] [Agricultural]         │
│  Risk: [🟢 Low] [🟡 Medium] [🟠 High]                        │  ← quick filter tags
│  Sort: Recommended | Yield↑ | Risk↓ | Amount↑                │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ 🚢 Copper  │ │ 🛢️ Crude   │ │ 🚢 Copper  │  ...           │  ← product card grid
│  │ Yield 8.5% │ │ Yield 6.2% │ │ Yield 12%  │                │
│  │ Risk 🟡 Med│ │ Risk 🟢 Low│ │ Risk 🔴 Hi │                │
│  │ $0.87/unit │ │ $0.93/unit │ │ $0.72/unit │                │
│  └────────────┘ └────────────┘ └────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Feature Design

### 2.1 AI Natural-Language Search Bar

**Interaction**:

```
┌──────────────────────────────────────────────────────┐
│  🤖  Describe your investment preferences…           │  ← main search bar
│  ─────────────────────────────────────────────────── │
│  💡 Try saying:                                      │
│  · "Higher returns, but not too much risk"           │
│  · "Only show copper bills of lading"                │
│  · "Under $2M, low risk"                             │
│  · "Recent routes departing Singapore"               │
└──────────────────────────────────────────────────────┘
```

**Processing flow**:

```
User enters an NL description
    │
    ▼
┌─────────────────────┐
│ DeepSeek Function   │  ← reuses the DeepSeekClient from popup-assistant.js
│ Calling             │
│                     │
│ tool: recommendEBL  │  ← new tool
│   preference: "..." │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Extract structured  │  AI extracts from the NL:
│ preferences         │  · risk_max: "MEDIUM"
│                     │  · yield_min: 5%
│                     │  · commodity: null
│                     │  · financing_max: null
│                     │  · sort_by: "risk_adjusted_yield"
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Score + rank each   │  For each case in state.cases:
│                     │  1. call /api/pricing/quote
│                     │  2. compute the "yield/risk ratio"
│                     │  3. filter by preference
│                     │  4. sort by score
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Return Top N + why  │  Render recommendation cards + AI explanation text
│                     │  "Recommend Copper·Singapore→Shanghai:
│                     │   yield 8.53%, risk MEDIUM,
│                     │   highest yield among medium-risk options"
└─────────────────────┘
```

### 2.2 Category Filter Bar

**Filter dimensions**:

| Filter | Interaction | Data field | Example |
|--------|---------|---------|------|
| Cargo type | Tag selection (multi-select) | `bill_of_lading.cargo` | Copper, crude oil, agricultural products |
| Risk level | Coloured tags (multi-select) | `risk_level` | 🟢LOW 🟡MEDIUM 🟠HIGH 🔴CRITICAL |
| Route region | Searchable dropdown | `port_of_loading` → `port_of_discharge` | Departing Singapore, arriving Shanghai |
| Yield range | Dual slider | `implied_gross_yield_bps` | 5% – 12% |
| Financing amount | Dual slider | `financing.requested_cash_usd` | $1M – $5M |
| Issue price range | Dual slider | `final_issue_price_usd` | $0.60 – $0.95 |
| Payout speed | Single-select tag | `payout_speed` | FAST / BALANCED / SAFE |

**Filter state management**:

```javascript
// Global filter state
const filterState = {
  commodity: [],          // cargo type multi-select
  riskLevel: [],          // risk level multi-select
  routeKeyword: '',       // route keyword
  yieldRange: [0, 15],    // yield range (%)
  financingRange: [0, 10000000], // financing amount range
  priceRange: [0, 1],     // issue price range
  payoutSpeed: null,      // payout speed
  sortBy: 'recommended',  // sort order
  aiPreference: '',       // AI natural-language preference (highest priority)
};
```

### 2.3 Product Card Design

```
┌───────────────────────────────────────────────┐
│                                               │
│  🚢 Copper · Singapore → Shanghai             │  ← title row
│  ───────────────────────────────────────────  │
│                                               │
│  📦 Copper cathode LME Grade A                │  ← cargo details
│     500 MT · EBL-2026-CU-04417                │
│                                               │
│  ┌──────────┬──────────┬──────────┐           │
│  │ Price    │ Exp.Yield│ Risk     │           │  ← three core metric columns
│  │ $0.87    │ 8.53%    │ 🟡 MEDIUM│           │
│  └──────────┴──────────┴──────────┘           │
│                                               │
│  💰 Financing $3,300,000 · ⚡ FAST payout     │  ← supporting info
│                                               │
│  ⭐ AI: best yield/risk ratio                 │  ← AI recommendation tag (if any)
│                                               │
│  [ View details ]    [ ⛓ One-click mint ]     │  ← action buttons
│                                               │
└───────────────────────────────────────────────┘
```

**Card state variants**:

| State | Visual difference | Trigger |
|------|---------|---------|
| Normal | Default style | Normally investable |
| AI recommended | Blue border + ⭐ corner badge | Ranked near the top of AI recommendation results |
| Paused | Grey overlay + pause icon | `pricing_action = PAUSE_OFFERING` |
| High risk | Orange border | `risk_level = CRITICAL` |
| Sold out | Semi-transparent | Subscription complete |

### 2.4 Sort Options

| Sort option | Calculation | Use case |
|---------|---------|---------|
| 🤖 Recommended first | AI composite score (default) | After the user enters an NL description |
| 📈 Yield high to low | `implied_gross_yield_bps DESC` | Seeking high returns |
| 🛡️ Risk low to high | `risk_score_bps ASC` | Conservative investors |
| 💰 Amount large to small | `requested_cash_usd DESC` | Preference for large tickets |
| 🏷️ Issue price low to high | `final_issue_price_usd ASC` | Bargain-hunting mindset |
| 📅 Newest | `issue_date DESC` | Looking for new listings |

---

## 3. Technical Implementation

### 3.1 New Files

```
AgentBL/
├── public/
│   ├── market.js          ← new: main logic for the eBL market page
│   ├── market.css          ← new: market page styles (or merged into styles.css)
│   ├── popup-assistant.js  ← modified: add the recommendEBL tool
│   └── app.js              ← modified: add View ⓪ route + market import
│
└── docs/
    └── ebl-marketplace-design.md  ← this document
```

### 3.2 market.js Core Structure

```javascript
// public/market.js — eBL Taobao-style marketplace

import { state } from './store.js';
import { $, el, clear, toast } from './dom.js';
import * as api from './api.js';
import * as f from './format.js';
import { t } from './i18n.js';

// ==================== Filter state ====================
const filter = {
  commodity: [],
  riskLevel: [],
  routeKeyword: '',
  yieldRange: [0, 15],
  financingRange: [0, 10_000_000],
  priceRange: [0, 1],
  payoutSpeed: null,
  sortBy: 'recommended',
  aiPreference: '',
};

// ==================== Data cache ====================
let allQuotes = [];     // { case, quote }[]
let filteredQuotes = [];

// ==================== Render functions ====================

/** Render the AI search bar */
function renderSearchBar(container) { /* ... */ }

/** Render category/filter tags */
function renderFilterBar(container) { /* ... */ }

/** Render the sort selector */
function renderSortSelector(container) { /* ... */ }

/** Render the product card grid */
function renderCardGrid(container, quotes) { /* ... */ }

/** Render a single eBL card */
function renderCard(container, item, index) { /* ... */ }

/** Render the AI recommendation banner */
function renderAiBanner(container, preference, results) { /* ... */ }

// ==================== Filter logic ====================

/** Apply all filter conditions */
function applyFilters() {
  let result = [...allQuotes];

  // Cargo type filter
  if (filter.commodity.length) {
    result = result.filter(item => {
      const cargo = item.case?.bill_of_lading?.cargo || '';
      return filter.commodity.some(c => cargo.toLowerCase().includes(c.toLowerCase()));
    });
  }

  // Risk level filter
  if (filter.riskLevel.length) {
    result = result.filter(item =>
      filter.riskLevel.includes(item.quote?.risk_level));
  }

  // Route keyword
  if (filter.routeKeyword) {
    const kw = filter.routeKeyword.toLowerCase();
    result = result.filter(item => {
      const route = item.case?.route || '';
      return route.toLowerCase().includes(kw);
    });
  }

  // Yield range
  result = result.filter(item => {
    const y = (item.quote?.implied_gross_yield_bps || 0) / 100;
    return y >= filter.yieldRange[0] && y <= filter.yieldRange[1];
  });

  // Financing amount range
  result = result.filter(item => {
    const amt = item.quote?.requested_cash_usd
             || item.quote?.expected_cash_to_exporter_usd || 0;
    return amt >= filter.financingRange[0] && amt <= filter.financingRange[1];
  });

  // Sort
  result.sort(getSortFn(filter.sortBy));

  filteredQuotes = result;
  return result;
}

/** Get the sort function */
function getSortFn(sortBy) {
  switch (sortBy) {
    case 'yield_desc':
      return (a, b) => (b.quote?.implied_gross_yield_bps || 0) - (a.quote?.implied_gross_yield_bps || 0);
    case 'risk_asc':
      return (a, b) => (a.quote?.risk_score_bps || 0) - (b.quote?.risk_score_bps || 0);
    case 'amount_desc':
      return (a, b) => (b.quote?.requested_cash_usd || 0) - (a.quote?.requested_cash_usd || 0);
    case 'price_asc':
      return (a, b) => (a.quote?.final_issue_price_usd || 0) - (b.quote?.final_issue_price_usd || 0);
    case 'recommended':
    default:
      // Default: sort by yield/risk ratio
      return (a, b) => {
        const scoreA = (a.quote?.implied_gross_yield_bps || 0) / Math.max(a.quote?.risk_score_bps || 1, 1);
        const scoreB = (b.quote?.implied_gross_yield_bps || 0) / Math.max(b.quote?.risk_score_bps || 1, 1);
        return scoreB - scoreA;
      };
  }
}

// ==================== AI recommendations ====================

/** Handle AI natural-language search */
async function handleAiSearch(preference) {
  if (!preference.trim()) return;

  filter.aiPreference = preference;

  // Option A: via the popup-assistant DeepSeek client
  // Option B: pure frontend keyword parsing (offline fallback)
  const parsed = parsePreferenceOffline(preference);
  applyParsedPreference(parsed);
  refreshMarket();

  // Fetch AI fine-grained ranking asynchronously
  try {
    const aiResults = await callAiRecommend(preference);
    if (aiResults) renderAiBanner($('#ai-banner'), preference, aiResults);
  } catch { /* fall back silently when AI is unavailable */ }
}

/** Offline keyword parsing (fallback when AI is unavailable) */
function parsePreferenceOffline(text) {
  const result = {};

  // Risk preference
  if (/low risk|low-risk|not too (?:much )?risk|steady|conservative/i.test(text)) result.riskMax = 'LOW';
  else if (/medium risk|moderate risk|not that risky/i.test(text)) result.riskMax = 'MEDIUM';
  else if (/high risk|high-risk|aggressive/i.test(text)) result.riskMax = 'HIGH';

  // Yield preference
  const yieldMatch = text.match(/(?:yield|return)\s*(?:above|over|>)?\s*(\d+)/i);
  if (yieldMatch) result.yieldMin = parseInt(yieldMatch[1]);
  else if (/high(?:er)? (?:yield|return)/i.test(text)) result.yieldMin = 7;

  // Cargo type
  if (/copper/i.test(text)) result.commodity = 'copper';
  else if (/crude|oil/i.test(text)) result.commodity = 'crude oil';
  else if (/agri|soybean|wheat/i.test(text)) result.commodity = 'agricultural';

  // Amount limit
  const amtMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m\b|million)/i);
  if (amtMatch) result.financingMax = parseFloat(amtMatch[1]) * 1_000_000;

  // Sort
  if (/yield|return/i.test(text) && !/risk/i.test(text)) result.sortBy = 'yield_desc';
  else if (/safe|conservative|steady/i.test(text)) result.sortBy = 'risk_asc';

  return result;
}

// ==================== Market initialisation ====================

/** Load pricing data for all eBLs */
async function loadAllQuotes() {
  if (!state.cases?.length) {
    state.cases = await api.getCases();
  }

  const results = await Promise.all(
    state.cases.map(async (c) => {
      try {
        const comp = await api.compareSpeeds(c.case);
        const quote = comp.quotes?.find(q => q.payout_speed === comp.recommended_payout_speed)
                   || comp.quotes?.[0];
        if (!quote) return null;
        return { case: c, quote, comparison: comp };
      } catch { return null; }
    })
  );

  allQuotes = results.filter(Boolean);
  return allQuotes;
}

/** Refresh the market view */
function refreshMarket() {
  const results = applyFilters();
  renderCardGrid($('#market-grid'), results);
  updateFilterCounts();
}

/** Initialise the market page */
export async function initMarket() {
  // TODO: render the page skeleton
}
```

### 3.3 popup-assistant.js Extension

Add the `recommendEBL` tool and its corresponding executor:

```javascript
// Append to the TOOLS array
{
  name: 'recommendEBL',
  description: 'Based on the user\'s investment preferences (yield, risk, cargo type, route, amount, etc.), intelligently recommend the best-matching eBLs from the available bills of lading. Returns a sorted and filtered recommendation list with the key metrics of each bill of lading.',
  parameters: {
    type: 'object',
    properties: {
      preference: {
        type: 'string',
        description: 'The user\'s natural-language preference description'
      },
      risk_max: {
        type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        description: 'Highest acceptable risk level'
      },
      yield_min: {
        type: 'number',
        description: 'Minimum expected yield (bps), e.g. 500 means 5%'
      },
      commodity: {
        type: 'string',
        description: 'Cargo type keyword'
      },
      financing_max: {
        type: 'number',
        description: 'Maximum financing amount (USD)'
      },
      sort_by: {
        type: 'string',
        enum: ['yield_desc', 'risk_asc', 'score'],
        description: 'Sort order'
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of results to return, default 3'
      }
    },
    required: ['preference']
  }
}
```

```javascript
// Add to toolExecutors
async recommendEBL(params) {
  if (!state.cases?.length) state.cases = await api.getCases();
  if (!state.cases?.length) return 'No bills of lading available yet.';

  // Fetch pricing for each case
  const scored = (await Promise.all(state.cases.map(async (c) => {
    try {
      const comp = await api.compareSpeeds(c.case);
      const rec = comp.quotes?.find(q => q.payout_speed === comp.recommended_payout_speed)
               || comp.quotes?.[0];
      if (!rec) return null;
      return {
        case: c,
        quote: rec,
        yieldBps: rec.implied_gross_yield_bps,
        riskBps: rec.risk_score_bps,
        riskLevel: rec.risk_level,
        price: rec.final_issue_price_usd,
        financingUsd: rec.expected_cash_to_exporter_usd || rec.requested_cash_usd,
        score: rec.implied_gross_yield_bps / Math.max(rec.risk_score_bps, 1)
      };
    } catch { return null; }
  }))).filter(Boolean);

  // Filter
  let results = scored;
  const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  if (params.risk_max) results = results.filter(r => riskOrder[r.riskLevel] <= riskOrder[params.risk_max]);
  if (params.yield_min) results = results.filter(r => r.yieldBps >= params.yield_min);
  if (params.commodity) {
    const kw = params.commodity.toLowerCase();
    results = results.filter(r =>
      (r.case.cargo || '').toLowerCase().includes(kw) ||
      (r.case.case?.bill_of_lading?.cargo || '').toLowerCase().includes(kw));
  }
  if (params.financing_max) results = results.filter(r => r.financingUsd <= params.financing_max);

  // Sort
  if (params.sort_by === 'yield_desc') results.sort((a, b) => b.yieldBps - a.yieldBps);
  else if (params.sort_by === 'risk_asc') results.sort((a, b) => a.riskBps - b.riskBps);
  else results.sort((a, b) => b.score - a.score);

  const top = results.slice(0, params.max_results || 3);
  if (!top.length) return 'No bills of lading match your criteria. Try relaxing the filters?';

  return top.map((r, i) => {
    const stars = i === 0 ? ' ⭐ Top pick' : '';
    return `${i + 1}. **${r.case.label}**${stars}
   - Issue price: $${Number(r.price).toFixed(2)} | Yield: ${(r.yieldBps / 100).toFixed(2)}%
   - Risk: ${r.riskLevel} (${r.riskBps} bps) | Yield/risk ratio: ${r.score.toFixed(2)}
   - Route: ${r.case.route} | Financing amount: $${(r.financingUsd / 1e6).toFixed(2)}M`;
  }).join('\n\n');
}
```

### 3.4 app.js Routing Extension

```javascript
// app.js: add the View ⓪ route

import { initMarket, renderMarket, refreshMarket } from './market.js';

// Append in setView()
function setView(name) {
  state.view = name;
  // ... existing logic ...

  $('#view-market').hidden = name !== 'market';
  $('#view-mint').hidden = name !== 'mint';
  $('#view-voyage').hidden = name !== 'voyage';

  if (name === 'market') renderMarket();
  // ...
}

// Append in boot()
async function boot() {
  // ... existing ...
  initMarket();     // preload market data
}
```

### 3.5 New View in index.html

```html
<!-- View ⓪ — eBL Market (new) -->
<section class="view" id="view-market">
  <!-- AI search banner -->
  <section class="panel market-search-panel">
    <div class="ai-search-bar">
      <span class="ai-search-icon">🤖</span>
      <input id="ai-search-input"
             class="ai-search-input"
             type="text"
             placeholder="Describe your investment preferences in plain language… e.g. higher returns, medium risk"
             data-i18n-ph="ai_search_ph" />
      <button id="ai-search-btn" class="btn ai-search-btn">AI Recommend</button>
    </div>
    <div class="ai-search-hints" id="ai-hints">
      <span class="hint-label">💡 Try:</span>
      <button class="hint-chip">High returns with controlled risk</button>
      <button class="hint-chip">Only copper bills of lading</button>
      <button class="hint-chip">Under $2M, low risk</button>
    </div>
    <div id="ai-banner" class="ai-banner" hidden></div>
  </section>

  <!-- Filter bar -->
  <section class="panel filter-panel">
    <div class="filter-row">
      <!-- Cargo type -->
      <div class="filter-group">
        <label>Cargo type</label>
        <div id="filter-commodity" class="chip-group"></div>
      </div>
      <!-- Risk level -->
      <div class="filter-group">
        <label>Risk level</label>
        <div id="filter-risk" class="chip-group"></div>
      </div>
      <!-- Payout speed -->
      <div class="filter-group">
        <label>Payout speed</label>
        <div id="filter-speed" class="chip-group"></div>
      </div>
      <!-- Sort -->
      <div class="filter-group">
        <label>Sort</label>
        <select id="filter-sort" class="filter-select"></select>
      </div>
    </div>
    <!-- Advanced filters (collapsible) -->
    <div class="filter-advanced" id="filter-advanced" hidden>
      <div class="range-group">
        <label>Yield range</label>
        <input type="range" id="range-yield-min" min="0" max="15" value="0" />
        <input type="range" id="range-yield-max" min="0" max="15" value="15" />
        <span id="range-yield-label">0% – 15%</span>
      </div>
      <div class="range-group">
        <label>Financing amount range</label>
        <input type="range" id="range-financing-min" min="0" max="10" step="0.5" value="0" />
        <input type="range" id="range-financing-max" min="0" max="10" step="0.5" value="10" />
        <span id="range-financing-label">$0M – $10M</span>
      </div>
    </div>
    <button id="filter-toggle" class="btn ghost sm">Advanced filters ▾</button>
  </section>

  <!-- Card grid -->
  <section class="panel market-grid-panel">
    <div class="market-stats">
      <span id="market-count">0 bills of lading</span>
      <button id="market-reset" class="btn ghost sm">Clear filters</button>
    </div>
    <div id="market-grid" class="market-grid"></div>
    <div id="market-empty" class="market-empty" hidden>
      <span class="empty-icon">📭</span>
      <p>No bills of lading match the criteria</p>
      <button class="btn ghost" onclick="resetAllFilters()">Clear all filters</button>
    </div>
  </section>
</section>
```

---

## 4. AI Recommendation Prompt Design

### 4.1 System Prompt Extension

Append market-recommendation instructions to `SYSTEM_PROMPT` in popup-assistant.js:

```
## eBL market recommendation capability
You can call the recommendEBL tool to recommend suitable bill of lading investments to the user.
When recommending, you should:
- Understand how the user expresses preferences (yield, risk, cargo, amount, etc.)
- Prioritise bills of lading with the best yield/risk ratio
- Give a clear reason for the recommendation (why this bill of lading suits the user)
- If the user has no explicit preference, default to recommending bills of lading with risk at or below MEDIUM and yield above 5%
- Highlight the key metrics when recommending: issue price, yield, risk level, financing amount
```

### 4.2 Example Recommendation Rationales

| User input | AI parse | Recommendation |
|---------|--------|---------|
| "Somewhat higher returns, not too much risk" | risk_max=MEDIUM, sort=score | Copper·Singapore→Shanghai (yield 8.5% / risk MEDIUM / highest yield-to-risk ratio) |
| "I only want copper" | commodity=copper | Two copper bills of lading, sorted by yield |
| "Under $2M, something safe" | financing_max=2M, risk_max=LOW | After filtering, recommend Crude·Singapore→Ulsan |
| "Best value for money" | sort=score (default) | Composite ranking Top 3 |

---

## 5. Implementation Plan

### 5.1 Step-by-Step Development

| Step | File | Content | Estimate |
|------|------|------|------|
| **Step 1** | `market.js` | Market page skeleton: card grid + basic filters + sorting | Half a day |
| **Step 2** | `styles.css` | Card styles + filter bar styles + AI search bar | Half a day |
| **Step 3** | `app.js` + `index.html` | View ⓪ route + HTML structure + new entry in the nav bar | Half a day |
| **Step 4** | `popup-assistant.js` | Add the `recommendEBL` tool + executor + prompt | 1 day |
| **Step 5** | `market.js` | AI search wiring: input → AI parse → filter → sort → render | Half a day |
| **Step 6** | `i18n.js` | Bilingual copy for the market page | Half a day |

**Total: about 2–3 days**

### 5.2 Relationship with Existing Features

```
                   ┌──────────────────────────────┐
                   │      View ⓪ eBL Market       │  ← new: browse + filter + AI recommend
                   └──────────────┬───────────────┘
                                  │ click "View details"
                                  ▼
                   ┌──────────────────────────────┐
                   │  View ① Pledge eBL · Mint    │  ← existing: details + pricing + minting
                   └──────────────┬───────────────┘
                                  │ click "Voyage tracking"
                                  ▼
                   ┌──────────────────────────────┐
                   │ View ② Voyage · Live Pricing │  ← existing: in-transit events + repricing
                   └──────────────────────────────┘

        ┌──────────────────────────────────────┐
        │      popup-assistant.js              │  ← existing + extended
        │  · getCases / selectCase / ...       │
        │  · recommendEBL  ← new               │
        └──────────────────────────────────────┘
```

---

## 6. Fit with the Injective Challenge

| Challenge direction | Direct contribution of this project |
|----------|---------------|
| **Direction 4 · 4.1 Multi-party roles** | The eBL market naturally serves the "investor" role, showing every investable asset |
| **Direction 4 · 4.2 Financing product matrix** | Each eBL card = one product; the card grid = the product shelf |
| **Direction 6 · 6.1 New pages** | View ⓪ "eBL Market" entry page, usable directly as the demo home page |
| **5.3 AI financing advisor** | NL → structured preferences → filter and sort → recommendation rationale, end to end |
| **5.4 AI conversational interface** | AI search bar embedded in the market page, aware of what is currently being browsed |
| **Direction 2 · Autonomous AI Agent** | Can later be extended to automatic Agent recommendations + periodic push notifications |

---

## 7. Future Extensions

1. **Personalisation**: record users' browsing/investment history for more accurate recommendations
2. **Comparison mode**: select 2-3 bills of lading and compare key metrics side by side
3. **Price trend chart**: embed a recent issue-price curve in each card
4. **Subscription alerts**: push a notification when a new eBL matching the criteria is listed
5. **Social proof**: a "N investors are watching" popularity tag
6. **AR display**: scan the bill of lading QR code to see the cargo's real-time location (works with the View ② shipping map)
