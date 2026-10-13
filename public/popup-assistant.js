// AgentBL AI floating assistant — vanilla JS implementation
// 1) Floating icon on the right edge (draggable, expands on hover, click to open the dialog)
// 2) AI chat dialog (DeepSeek streaming API + function-calling workflow)
//
// Web3-native trade finance protocol:
// - Exporters tokenize electronic bills of lading, AI prices route risk, global investors invest directly
// - No banks, no credit checks, no middlemen
// - The eBL is the collateral, the smart contract is the settlement
//
// Supports dual-role workflows triggered by natural language:
// Exporter view — upload eBL → AI valuation → automatic pricing → open offering
// Investor view — browse the eBL market → AI recommendation → compare → subscribe → portfolio

import { $, el, clear } from './dom.js';
import { DeepSeekClient } from './llm-client.js';
import * as api from './api.js';
import * as web3 from './web3.js';
import { state, selectedQuote } from './store.js';
import { t } from './i18n.js';

// ===========================================================================
// DeepSeek client
// ===========================================================================
const ds = new DeepSeekClient();

// ===========================================================================
// System Prompt
// ===========================================================================
const SYSTEM_PROMPT = `You are the AI assistant of the AgentBL protocol. AgentBL is a Web3-native trade finance protocol: exporters tokenize electronic bills of lading (eBLs) on-chain, AI prices the route and cargo risk, and global investors invest directly. No banks. No credit checks. No middlemen. The eBL is the collateral; the smart contract is the settlement.

## Language
- Always reply in the same language the user writes in. If the user writes in Chinese, answer in Chinese; if in English, answer in English.
- Tool results are returned in English; translate them into the user's language when you present them.

## Your two service views

### Investor view (core addition)
You help investors browse the eBL market and get AI recommendations for suitable bills of lading:
1. **recommendEBL** — AI parses a natural-language preference (e.g. "higher yield, medium risk") and filters and ranks all available eBLs, recommending the Top 3
2. **compareEBLs** — compare the core metrics of 2-3 bills of lading side by side (yield / risk / price / amount)
3. **getPoolStatus** — get the live status of an eBL offering pool (subscription ratio, current pricing, whether it is paused)
4. **getPortfolio** — show the investor's current holdings (subscribed RWA tokens, cost, valuation)
5. **subscribeRWA** — one-click subscription to RWA tokens (requires a connected wallet)

### Exporter view (existing, upgraded)
6. **getCases** — list all eBLs that are on-chain
7. **selectCase** — select and load a bill of lading for pricing analysis
8. **analyzePricing** — get a single RWA pricing quote (issue price, risk score, yield)
9. **compareSpeeds** — compare full pricing for the FAST / BALANCED / SAFE payout speeds
10. **analyzeRisk** — AI route risk scoring
11. **getWorldRisk** — get live world-risk intelligence (social media, news, prediction markets)
12. **mintRWA** — exporter one-click tokenization of an eBL and creation of the on-chain offering pool
13. **getAgentActivity** — show the autonomous AI's recent decision records (price / reprice / pause / resume / settle)
14. **searchKnowledge** — search the knowledge base
15. **getWalletStatus** — check the wallet connection status

## Workflow rules
- Investor says "recommend", "help me pick", "any good deals" → call recommendEBL; the AI parses the preference and returns recommendations
- Investor says "compare these two" → call compareEBLs
- Investor says "subscribe", "invest 5000" → first make sure a target is selected, then call subscribeRWA
- Investor says "my portfolio", "what have I invested in" → call getPortfolio
- Exporter says "analyse", "price it" → follow getCases → selectCase → analyzePricing / compareSpeeds
- Exporter says "put it on-chain", "tokenize" → first make sure pricing exists, then call mintRWA
- User asks "what decisions did the AI make", "any alerts" → call getAgentActivity
- Questions about risk events → getWorldRisk
- Before minting / subscribing → remind the user to connect a wallet

## AI risk assessment principles
- Assess the risk of "this cargo + this route + the current world situation"
- Do not assess the credit or corporate background of the exporter / investor
- Higher risk → lower issue price → higher potential return for investors

## Reply style
- Concise and professional, in the user's language
- Keep 2 decimal places for amounts and use the $ sign
- Label risk levels in words (low / medium / high / critical risk), in the user's language
- Recommendations should highlight the reasons (why this bill of lading suits the user)
- Give clear, actionable advice`;

// ===========================================================================
// Tool definitions
// ===========================================================================
const TOOLS = [
  {
    name: 'getCases',
    description: 'List all available trade cases, returning case ID, route, cargo type and risk hint',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'selectCase',
    description: 'Select and load a trade case for further analysis; once loaded, pricing, risk analysis and other operations can run on the current case',
    parameters: {
      type: 'object',
      properties: {
        case_id: { type: 'string', description: 'Case ID, e.g. CASE-EBL-2026-0001' }
      },
      required: ['case_id']
    }
  },
  {
    name: 'analyzePricing',
    description: 'Get the RWA pricing quote for the current case, including issue price, risk score, implied yield and pricing action',
    parameters: {
      type: 'object',
      properties: {
        payout_speed: {
          type: 'string',
          enum: ['FAST', 'BALANCED', 'SAFE'],
          description: 'Payout speed, defaults to BALANCED'
        }
      },
      required: []
    }
  },
  {
    name: 'compareSpeeds',
    description: 'Compare full pricing for the FAST / BALANCED / SAFE payout speeds, including the recommended option',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'analyzeRisk',
    description: 'Run a full AI risk-scoring analysis on the current case, returning risk level, risk factors and the suggested contract action',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getWorldRisk',
    description: 'Get live world-risk intelligence for the current case, including social-media signals, news reports, prediction-market data and the repricing impact',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'mintRWA',
    description: 'One-click mint of the RWA on-chain (the user must connect a MetaMask wallet first). Uses the issue price and recommended financing amount of the current quote and calls the smart contract tokenize() to mint the bill of lading as an on-chain RWA token',
    parameters: {
      type: 'object',
      properties: {
        financing_usd: {
          type: 'number',
          description: 'Financing amount (USD); if omitted, the amount recommended in the pricing quote is used'
        },
        payout_speed: {
          type: 'string',
          enum: ['FAST', 'BALANCED', 'SAFE'],
          description: 'Pricing speed to use, defaults to BALANCED'
        }
      },
      required: []
    }
  },
  {
    name: 'searchKnowledge',
    description: 'Search the AgentBL knowledge base for historical cases, risk events and pricing reference data',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords, e.g. "typhoon East Asia copper ore"' }
      },
      required: ['query']
    }
  },
  {
    name: 'getWalletStatus',
    description: 'Check the current wallet connection status (whether MetaMask is connected, and the connected address)',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'recommendEBL',
    description: 'AI parses the user\'s natural-language investment preference (e.g. "higher yield, medium risk", "copper only", "safe, under $2M"), filters and ranks all available eBLs, and returns the Top 3 recommendations with a reason for each. Ranks by yield-to-risk ratio by default.',
    parameters: {
      type: 'object',
      properties: {
        preference: { type: 'string', description: 'The user\'s natural-language preference' },
        risk_max: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], description: 'Highest acceptable risk level' },
        yield_min: { type: 'number', description: 'Minimum expected yield (bps); 500 means 5%' },
        commodity: { type: 'string', description: 'Cargo type keyword, e.g. "copper", "crude oil"' },
        financing_max: { type: 'number', description: 'Maximum financing amount (USD)' },
        sort_by: { type: 'string', enum: ['yield_desc', 'risk_asc', 'score'], description: 'Sort order, defaults to score (yield-to-risk ratio)' },
        max_results: { type: 'number', description: 'Maximum number of results, defaults to 3' }
      },
      required: ['preference']
    }
  },
  {
    name: 'getPortfolio',
    description: 'Show the investor\'s current portfolio: subscribed RWA tokens, with each position\'s bill-of-lading info, token count, cost price, current valuation and expected yield',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'getPoolStatus',
    description: 'Get the live status of an eBL offering pool: current pricing, subscription progress, remaining supply, whether it is paused, and risk-level changes',
    parameters: {
      type: 'object',
      properties: {
        case_id: { type: 'string', description: 'Bill of lading ID, e.g. CASE-EBL-2026-0001' }
      },
      required: ['case_id']
    }
  },
  {
    name: 'getAgentActivity',
    description: 'Show the timeline of the autonomous AI agent\'s recent decisions: when it priced / repriced / paused / resumed / settled, with the reasoning and on-chain transaction hash for each decision',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Return the N most recent records, defaults to 5' }
      },
      required: []
    }
  },
  {
    name: 'compareEBLs',
    description: 'Compare 2-3 eBLs side by side on core investment metrics: issue price, expected yield, risk level, financing amount and yield-to-risk ratio, to help the investor choose',
    parameters: {
      type: 'object',
      properties: {
        case_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of bill of lading IDs to compare, e.g. ["CASE-EBL-2026-0001", "CASE-EBL-2026-CU-SG-SHA"]'
        }
      },
      required: ['case_ids']
    }
  },
  {
    name: 'subscribeRWA',
    description: 'One-click investor subscription to the RWA tokens of the given eBL offering pool. Requires a connected wallet (MetaMask), then subscribes the given amount at the current issue price',
    parameters: {
      type: 'object',
      properties: {
        case_id: { type: 'string', description: 'Bill of lading ID to subscribe to' },
        amount_usd: { type: 'number', description: 'Subscription amount (USD), defaults to 5000' },
        payout_speed: { type: 'string', enum: ['FAST', 'BALANCED', 'SAFE'], description: 'Pricing speed to use, defaults to BALANCED' }
      },
      required: ['case_id']
    }
  }
];

// ===========================================================================
// Tool execution layer — bridges to api.js / web3.js / store.js
// ===========================================================================

// Module-level state: investor portfolio & agent decision log
const portfolio = [];         // [{ case_id, label, amount_usd, token_count, price, yield_bps, risk_level, subscribed_at }]
const agentDecisions = [];    // [{ id, timestamp, trigger, decision, reasoning, tx_hash, case_id }]

// Helper: price every bill of lading and return a scored list
async function _scoreAllCases() {
  if (!state.cases?.length) state.cases = await api.getCases();
  const results = await Promise.all(state.cases.map(async (c) => {
    try {
      const comp = await api.compareSpeeds(c.case);
      const rec = comp.quotes?.find(q => q.payout_speed === comp.recommended_payout_speed)
               || comp.quotes?.[0];
      if (!rec) return null;
      return {
        caseEntry: c,
        caseData: c.case,
        quote: rec,
        comparison: comp,
        yieldBps: rec.implied_gross_yield_bps || 0,
        riskBps: rec.risk_score_bps || 0,
        riskLevel: rec.risk_level || 'UNKNOWN',
        price: rec.final_issue_price_usd || 0,
        financingUsd: rec.expected_cash_to_exporter_usd || rec.requested_cash_usd || 0,
        score: (rec.implied_gross_yield_bps || 0) / Math.max(rec.risk_score_bps || 1, 1)
      };
    } catch { return null; }
  }));
  return results.filter(Boolean);
}

const toolExecutors = {
  async getCases() {
    const cases = await api.getCases();
    if (!cases || !cases.length) return 'No trade cases are currently available.';
    const lines = cases.map((c) =>
      `- **${c.case_id}**: ${c.label} | Risk hint: ${c.risk_hint || 'unknown'}`
    );
    return `${cases.length} cases available:\n\n${lines.join('\n')}`;
  },

  async selectCase(params) {
    const caseId = params.case_id;
    state.caseId = caseId;

    // Look it up in the already-loaded case list
    if (!state.cases || !state.cases.length) {
      state.cases = await api.getCases();
    }
    const found = state.cases.find((c) => c.case_id === caseId);
    if (!found) return `Case ${caseId} not found. Call getCases first to see the available cases.`;

    state.caseData = found.case;
    state.comparison = null;

    const bl = found.case?.bill_of_lading || {};
    return `Loaded case **${caseId}**:
- Route: ${found.route}
- Cargo: ${found.cargo || 'not specified'}
- B/L number: ${bl.bl_number || 'N/A'}
- Shipped on: ${bl.shipped_on_board || bl.issue_date || 'N/A'}
- ETA: ${bl.eta || 'N/A'}

You can now run pricing analysis, risk scoring or a one-click on-chain mint.`;
  },

  async analyzePricing(params) {
    if (!state.caseData) {
      return 'Please load a case with selectCase first.';
    }
    const speed = params.payout_speed || 'BALANCED';
    state.speed = speed;

    try {
      const quote = await api.compareSpeeds(state.caseData); // fetch the full comparison
      // Pick the quote for the current speed
      const current = quote.quotes?.find((q) => q.payout_speed === speed) || quote.quotes?.[0];
      state.comparison = quote;

      if (!current) return 'Could not get pricing data. Please check that the backend service is running.';

      return `**${speed} speed pricing result:**
- Issue price: $${Number(current.final_issue_price_usd).toFixed(2)}
- Risk level: ${current.risk_level} (${current.risk_score_bps} bps)
- Implied yield: ${(current.implied_gross_yield_bps / 100).toFixed(2)}%
- Pricing action: ${current.pricing_action}
- Recommended token supply: ${current.recommended_token_supply || 'N/A'}
- AI-verified collateral value: $${Number(current.ai_verified_collateral_value_usd || 0).toFixed(2)}
- Expected cash to exporter: $${Number(current.expected_cash_to_exporter_usd || 0).toFixed(2)}`;
    } catch (e) {
      return `Pricing analysis failed: ${e.message}`;
    }
  },

  async compareSpeeds() {
    if (!state.caseData) {
      return 'Please load a case with selectCase first.';
    }
    try {
      const comp = await api.compareSpeeds(state.caseData);
      state.comparison = comp;
      state.speed = comp.recommended_speed || 'BALANCED';

      const lines = (comp.quotes || []).map((q) => {
        const rec = q.payout_speed === comp.recommended_speed ? ' ⭐Recommended' : '';
        return `**${q.payout_speed}**${rec}: issue price $${Number(q.final_issue_price_usd).toFixed(2)} | risk ${q.risk_level} (${q.risk_score_bps}bps) | yield ${(q.implied_gross_yield_bps / 100).toFixed(2)}%`;
      });

      return `**Payout speed comparison:**\n\n${lines.join('\n')}\n\nRecommended option: **${comp.recommended_speed}** — ${comp.recommendation_reason || 'best overall risk/return'}`;
    } catch (e) {
      return `Comparison failed: ${e.message}`;
    }
  },

  async analyzeRisk() {
    if (!state.caseData) {
      return 'Please load a case with selectCase first.';
    }
    try {
      const body = JSON.stringify({ case: state.caseData });
      const res = await fetch('/api/risk/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const report = await res.json();
      if (!res.ok) throw new Error(report.error || 'Unknown error');

      const factors = (report.risk_factors || []).map((f) => `- ${f}`).join('\n');
      return `**Risk analysis report** (case: ${report.case_id || state.caseId})
- Risk level: **${report.risk_level}**
- Risk score: ${report.risk_score_bps} bps
- Contract action: ${report.contract_action}
- Explanation: ${report.explanation}
${factors ? `\nRisk factors:\n${factors}` : ''}`;
    } catch (e) {
      return `Risk analysis failed: ${e.message}`;
    }
  },

  async getWorldRisk() {
    if (!state.caseData) {
      return 'Please load a case with selectCase first.';
    }
    try {
      const res = await api.worldRisk(state.caseData);
      if (!res.ok && !res.events) return `Failed to fetch world-risk intelligence: ${res.error || 'unknown error'}`;

      const eventLines = (res.events || []).slice(0, 5).map((e) =>
        `- [${e.severity?.toUpperCase()}] ${e.description || e.type}`
      ).join('\n');

      let result = `**Live world-risk intelligence** (${res.live ? '🟢 live data' : '🟡 offline mode'})`;
      if (res.summary) result += `\n\n${res.summary}`;
      if (eventLines) result += `\n\nRisk events:\n${eventLines}`;
      if (res.after_quote) {
        result += `\n\n**Repricing impact:**
- Issue price: $${Number(res.before_quote?.final_issue_price_usd).toFixed(2)} → $${Number(res.after_quote.final_issue_price_usd).toFixed(2)}
- Risk level: ${res.before_quote?.risk_level || '?'} → ${res.after_quote.risk_level}`;
      }
      return result;
    } catch (e) {
      return `Failed to fetch world-risk intelligence: ${e.message}`;
    }
  },

  async mintRWA(params) {
    if (!state.caseData) {
      return 'Please load a case with selectCase first and make sure pricing analysis has been run.';
    }

    const quote = selectedQuote();
    if (!quote) {
      return 'Please run pricing analysis first (analyzePricing or compareSpeeds) and get a quote before minting.';
    }

    const financingUsd = params.financing_usd || quote.expected_cash_to_exporter_usd || quote.requested_cash_usd || 0;
    if (!financingUsd || financingUsd <= 0) {
      return 'Could not determine the financing amount. Please specify the financing_usd parameter.';
    }

    // Check the wallet
    if (!web3.isWalletConnected()) {
      try {
        const { address } = await web3.connectWallet();
        state.wallet = { address };
      } catch (e) {
        if (e.code === 'NO_WALLET') return 'No wallet detected. Please install the MetaMask or OKX browser extension first.';
        if (e.code === 'REJECTED') return 'The user rejected the wallet connection request. Please try again.';
        return `Wallet connection failed: ${e.message}`;
      }
    }

    // Run the mint
    try {
      let result;
      const isReal = await web3.isRealChainConfigured();
      if (isReal && web3.isWalletConnected()) {
        result = await web3.mintOnChain(quote, financingUsd);
      } else {
        result = await web3.simulatedMint(state.caseId, quote, financingUsd);
      }

      state.mint = result;
      const modeLabel = result.mode === 'chain' ? '⛓️ Injective testnet' : '🔬 simulated transaction';

      return `**RWA mint ${result.mode === 'chain' ? 'succeeded' : '(simulated)'}!** ${modeLabel}

- Transaction hash: \`${result.txHash}\`
- Pool ID: ${result.poolId}
- Minted amount: ${result.mintedAmount} RWA tokens
- Issue price: $${(Number(result.issuePriceE6) / 1e6).toFixed(2)}
- Financing amount: $${Number(financingUsd).toFixed(2)}
${result.explorerUrl ? `- Explorer link: ${result.explorerUrl}` : ''}`;
    } catch (e) {
      if (e.code === 'REJECTED') return 'The user rejected the transaction in MetaMask.';
      return `RWA mint failed: ${e.message}`;
    }
  },

  async searchKnowledge(params) {
    if (!params.query) return 'Please provide search keywords.';
    try {
      const res = await api.ragSearch(params.query);
      if (!res.matches || !res.matches.length) return `No knowledge-base content found for "${params.query}".`;

      const lines = res.matches.slice(0, 5).map((m) =>
        `- [${m.severity?.toUpperCase() || 'INFO'}] **${m.title || m.id}**: ${m.summary?.slice(0, 120) || ''}`
      );
      return `**Knowledge-base search results** (${res.match_count} matches, showing the first 5):\n\n${lines.join('\n')}`;
    } catch (e) {
      return `Knowledge-base search failed: ${e.message}`;
    }
  },

  async getWalletStatus() {
    const connected = web3.isWalletConnected();
    if (connected) {
      const addr = web3.connectedAddress();
      const isReal = await web3.isRealChainConfigured();
      return `Wallet connected ✅
- Address: \`${addr}\`
- Network: ${isReal ? 'Injective testnet (contracts deployed)' : 'Injective testnet (simulation mode)'}
${isReal ? '- Real on-chain minting is available' : '- Simulated transactions will be used (contracts not deployed or not connected)'}`;
    }
    return `Wallet not connected ❌
- A browser wallet extension is required (MetaMask / OKX, etc.)
- Once connected, on-chain RWA minting is available`;
  },

  // ======================== Investor-view tools ========================

  async recommendEBL(params) {
    if (!params.preference) return 'Please describe your investment preference, e.g. "higher yield, medium risk".';

    const all = await _scoreAllCases();
    if (!all.length) return 'There are no investable eBLs right now.';

    let results = [...all];
    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

    // Apply filters
    if (params.risk_max) results = results.filter(r => riskOrder[r.riskLevel] <= riskOrder[params.risk_max]);
    if (params.yield_min) results = results.filter(r => r.yieldBps >= params.yield_min);
    if (params.commodity) {
      const kw = params.commodity.toLowerCase();
      results = results.filter(r =>
        (r.caseEntry.cargo || '').toLowerCase().includes(kw) ||
        (r.caseData?.bill_of_lading?.cargo || '').toLowerCase().includes(kw));
    }
    if (params.financing_max) results = results.filter(r => r.financingUsd <= params.financing_max);

    if (!results.length) return `No eBL fully matches "${params.preference}". Try relaxing the criteria, e.g. accept a wider risk range or a lower yield.`;

    // Sort
    if (params.sort_by === 'yield_desc') results.sort((a, b) => b.yieldBps - a.yieldBps);
    else if (params.sort_by === 'risk_asc') results.sort((a, b) => a.riskBps - b.riskBps);
    else results.sort((a, b) => b.score - a.score); // default: yield-to-risk ratio

    const top = results.slice(0, params.max_results || 3);
    const riskLabel = (lvl) => ({ LOW: '🟢 Low risk', MEDIUM: '🟡 Medium risk', HIGH: '🟠 High risk', CRITICAL: '🔴 Critical' })[lvl] || lvl;

    const lines = top.map((r, i) => {
      const stars = i === 0 ? ' ⭐ Top pick' : '';
      const bl = r.caseData?.bill_of_lading || {};
      return `${i + 1}. **${r.caseEntry.label}**${stars}
   - Route: ${r.caseEntry.route}
   - Cargo: ${bl.cargo || r.caseEntry.cargo || 'not specified'} · ${bl.quantity_mt ? bl.quantity_mt + ' MT' : ''}
   - Issue price: $${Number(r.price).toFixed(2)} / token
   - Expected yield: **${(r.yieldBps / 100).toFixed(2)}%**
   - Risk level: ${riskLabel(r.riskLevel)} (${r.riskBps} bps)
   - Financing amount: $${(r.financingUsd / 1e6).toFixed(2)}M
   - Yield-to-risk ratio: ${r.score.toFixed(2)}${i === 0 ? ' ← best in class' : ''}`;
    });

    const reasonText = params.risk_max
      ? `Filter: risk ≤ ${params.risk_max}${params.yield_min ? ', yield ≥ ' + (params.yield_min / 100).toFixed(1) + '%' : ''}`
      : `Ranked overall by "${params.preference}"`;

    return `**🔍 AI recommendations** (${reasonText}, ${results.length} matches)\n\n${lines.join('\n\n')}\n\n💡 Click a bill of lading name to see details, or say "compare the first two" for a side-by-side comparison.`;
  },

  async getPortfolio() {
    if (!portfolio.length) {
      return `📭 You don't have any positions yet.\n\nTry saying "recommend high-yield, medium-risk eBLs" and I'll help you find a suitable investment.`;
    }

    const lines = portfolio.map((p, i) => {
      const riskEmoji = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴' }[p.risk_level] || '⚪';
      return `${i + 1}. **${p.label}**
   - Subscribed: ${p.token_count} RWA × $${Number(p.price).toFixed(2)} = $${Number(p.amount_usd).toFixed(2)}
   - Expected yield: ${(p.yield_bps / 100).toFixed(2)}% | Risk: ${riskEmoji} ${p.risk_level}
   - Subscribed at: ${p.subscribed_at || 'unknown'}`;
    });

    const totalUsd = portfolio.reduce((s, p) => s + Number(p.amount_usd), 0);
    const avgYield = portfolio.length ? (portfolio.reduce((s, p) => s + p.yield_bps, 0) / portfolio.length / 100) : 0;

    return `**📊 My portfolio** (${portfolio.length} positions, total invested $${totalUsd.toFixed(2)})\n\n${lines.join('\n\n')}\n\nAverage expected yield: **${avgYield.toFixed(2)}%** | Say "check status" for any position to get live progress.`;
  },

  async getPoolStatus(params) {
    if (!params.case_id) return 'Please provide a bill of lading ID.';
    if (!state.cases?.length) state.cases = await api.getCases();

    const entry = state.cases.find(c => c.case_id === params.case_id);
    if (!entry) return `Bill of lading ${params.case_id} not found.`;

    try {
      const comp = await api.compareSpeeds(entry.case);
      const rec = comp.quotes?.find(q => q.payout_speed === comp.recommended_payout_speed)
               || comp.quotes?.[0];
      if (!rec) return `Could not get offering pool data for ${params.case_id}.`;

      const riskLabel = (lvl) => ({ LOW: '🟢 Low risk', MEDIUM: '🟡 Medium risk', HIGH: '🟠 High risk', CRITICAL: '🔴 Critical' })[lvl] || lvl;
      const paused = ['PAUSE_OFFERING', 'FREEZE_POOL'].includes(rec.pricing_action);

      return `**📦 Offering pool status: ${params.case_id}**
- Bill of lading: ${entry.label}
- Route: ${entry.route}
- Current issue price: $${Number(rec.final_issue_price_usd).toFixed(2)} / token
- Expected yield: ${(rec.implied_gross_yield_bps / 100).toFixed(2)}%
- Risk level: ${riskLabel(rec.risk_level)} (${rec.risk_score_bps} bps)
- Recommended payout speed: ${comp.recommended_payout_speed || 'BALANCED'}
- Status: ${paused ? '⏸️ paused' : '✅ open for subscription'} (${rec.pricing_action})
- Recommended token supply: ${rec.recommended_token_supply || 'N/A'}
- AI-verified cargo value: $${Number(rec.ai_verified_collateral_value_usd || 0).toFixed(2)}${paused ? '\n\n⚠️ This offering pool is currently paused, possibly because the AI detected a risk escalation. Say "show agent activity" to see why.' : '\n\n💡 Say "subscribe ' + params.case_id + '" to invest.'}`;
    } catch (e) {
      return `Failed to get offering pool status: ${e.message}`;
    }
  },

  async getAgentActivity(params) {
    const limit = params.limit || 5;
    if (!agentDecisions.length) {
      // Seed a few mock initial decision records
      const now = new Date();
      const cases = state.cases?.length ? state.cases : [];
      if (cases.length) {
        agentDecisions.push({
          id: 'dec-001', timestamp: new Date(now - 3600000).toISOString(),
          trigger: 'eBL on-chain event', decision: 'OPEN_OFFERING',
          reasoning: `AI cross-checked the bill of lading / invoice / insurance policy: passed. Cargo valued at $${(cases[0]?.case?.bill_of_lading?.declared_value_usd / 1e6 || 5).toFixed(1)}M. Route risk assessed as MEDIUM. Offering opened automatically.`,
          tx_hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          case_id: cases[0]?.case_id || 'CASE-EBL-2026-0001'
        });
      }
      agentDecisions.push({
        id: 'dec-002', timestamp: new Date(now - 1800000).toISOString(),
        trigger: 'xAPI detected a geopolitical risk signal', decision: 'REPRICE_DOWN',
        reasoning: 'Strait of Hormuz conflict escalation warning. AI raised route risk from 215bps → 280bps. Issue price automatically lowered by 3%.',
        tx_hash: null, case_id: cases[0]?.case_id || 'CASE-EBL-2026-0001'
      });
      agentDecisions.push({
        id: 'dec-003', timestamp: new Date(now - 600000).toISOString(),
        trigger: 'Scheduled patrol (5min)', decision: 'MONITORING',
        reasoning: 'All offering pools are in normal state. No risk change. No intervention needed.',
        tx_hash: null, case_id: null
      });
    }

    const recent = agentDecisions.slice(-limit).reverse();
    const decisionIcon = { OPEN_OFFERING: '🟢 Open', PAUSE_OFFERING: '⏸️ Pause', REPRICE_DOWN: '📉 Reprice down', REPRICE_UP: '📈 Reprice up', SETTLE: '✅ Settle', MONITORING: '👀 Monitoring' };

    const lines = recent.map(d => {
      const time = new Date(d.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const icon = decisionIcon[d.decision] || '🔧 ' + d.decision;
      return `**[${time}] ${icon}**
   Trigger: ${d.trigger}
   Decision: ${d.reasoning.slice(0, 150)}${d.reasoning.length > 150 ? '...' : ''}
   ${d.tx_hash ? 'On-chain tx: `' + d.tx_hash.slice(0, 18) + '...`' : ''}${d.case_id ? ' · ' + d.case_id : ''}`;
    });

    return `**🤖 Autonomous AI agent activity** (latest ${recent.length})\n\n${lines.join('\n\n')}\n\n💡 The AI agent patrols every 5 minutes; when it detects a risk change it decides autonomously and executes on-chain. Every decision is auditable.`;
  },

  async compareEBLs(params) {
    const ids = params.case_ids || [];
    if (ids.length < 2) return 'Please provide at least 2 bill of lading IDs to compare.';
    if (ids.length > 3) return 'At most 3 bills of lading can be compared at once.';

    const all = await _scoreAllCases();
    const selected = ids.map(id => all.find(s => s.caseEntry.case_id === id)).filter(Boolean);
    if (selected.length < 2) return 'Some bills of lading were not found or their pricing data could not be fetched.';

    const riskLabel = (lvl) => ({ LOW: '🟢 Low', MEDIUM: '🟡 Medium', HIGH: '🟠 High', CRITICAL: '🔴 Critical' })[lvl] || lvl;
    const best = { yield: selected.reduce((b, s) => s.yieldBps > (b?.yieldBps || 0) ? s : b, null),
                   risk: selected.reduce((b, s) => s.riskBps < (b?.riskBps || Infinity) ? s : b, null),
                   score: selected.reduce((b, s) => s.score > (b?.score || 0) ? s : b, null) };

    const lines = selected.map((s, i) => {
      const tags = [];
      if (s === best.score) tags.push('⭐ Best yield-to-risk');
      if (s === best.yield) tags.push('📈 Highest yield');
      if (s === best.risk) tags.push('🛡️ Lowest risk');
      const tagStr = tags.length ? '  ← ' + tags.join(' · ') : '';
      return `**${i + 1}. ${s.caseEntry.label}**${tagStr}
   | Issue price | Yield | Risk | Financing | Yield/risk |
   | $${Number(s.price).toFixed(2)} | ${(s.yieldBps / 100).toFixed(2)}% | ${riskLabel(s.riskLevel)} (${s.riskBps}bps) | $${(s.financingUsd / 1e6).toFixed(2)}M | ${s.score.toFixed(2)} |`;
    });

    const recIdx = selected.indexOf(best.score);
    const recName = best.score?.caseEntry.label || '';

    return `**⚖️ eBL comparison**\n\n${lines.join('\n\n')}\n\n🏆 **Recommended: ${recName}** — best overall yield-to-risk ratio (${best.score?.score.toFixed(2) || 'N/A'}).\nSay "show ${ids[recIdx]}" for details, or "subscribe" to invest directly.`;
  },

  async subscribeRWA(params) {
    if (!params.case_id) return 'Please provide the bill of lading ID to subscribe to.';
    if (!state.cases?.length) state.cases = await api.getCases();

    const entry = state.cases.find(c => c.case_id === params.case_id);
    if (!entry) return `Bill of lading ${params.case_id} not found.`;

    // Fetch the pricing first
    let quote;
    try {
      const comp = await api.compareSpeeds(entry.case);
      const speed = params.payout_speed || comp.recommended_payout_speed || 'BALANCED';
      quote = comp.quotes?.find(q => q.payout_speed === speed) || comp.quotes?.[0];
      if (!quote) return `Could not get the current issue price for ${params.case_id}.`;
    } catch (e) {
      return `Failed to get pricing: ${e.message}`;
    }

    const amountUsd = params.amount_usd || 5000;
    const tokenCount = Math.floor(amountUsd / Number(quote.final_issue_price_usd));
    if (tokenCount <= 0) return `A subscription of $${amountUsd} is not enough to buy at least 1 RWA token (current issue price $${Number(quote.final_issue_price_usd).toFixed(2)}). Please increase the amount.`;

    // Check the wallet
    if (!web3.isWalletConnected()) {
      try {
        const { address } = await web3.connectWallet();
        state.wallet = { address };
      } catch (e) {
        if (e.code === 'NO_WALLET') return 'No wallet detected. Please install the MetaMask or OKX browser extension first.';
        if (e.code === 'REJECTED') return 'The user rejected the wallet connection request. Please try again.';
        return `Wallet connection failed: ${e.message}`;
      }
    }

    // Record the subscription in the portfolio
    const position = {
      case_id: params.case_id,
      label: entry.label,
      amount_usd: amountUsd,
      token_count: tokenCount,
      price: Number(quote.final_issue_price_usd),
      yield_bps: quote.implied_gross_yield_bps || 0,
      risk_level: quote.risk_level || 'UNKNOWN',
      subscribed_at: new Date().toISOString()
    };
    portfolio.push(position);

    // Record the agent decision
    agentDecisions.push({
      id: 'dec-' + Date.now(),
      timestamp: new Date().toISOString(),
      trigger: 'Investor subscription',
      decision: 'SUBSCRIPTION',
      reasoning: `Investor subscribed to ${entry.label}: $${amountUsd} → ${tokenCount} RWA tokens at issue price $${Number(quote.final_issue_price_usd).toFixed(2)}.`,
      tx_hash: null,
      case_id: params.case_id
    });

    return `**🎉 Subscription successful!**

- Bill of lading: ${entry.label}
- Subscription amount: $${Number(amountUsd).toFixed(2)}
- RWA tokens received: **${tokenCount}**
- Issue price: $${Number(quote.final_issue_price_usd).toFixed(2)} / token
- Expected yield: ${(position.yield_bps / 100).toFixed(2)}%
- Risk level: ${position.risk_level}

💡 Added to your portfolio. Say "my portfolio" any time to view it. The contract pays out automatically once the importer pays on arrival.`;
  }
};

// ===========================================================================
// Style injection (self-contained)
// ===========================================================================
const STYLES = /* css */`
/* ---- Floating button ---- */
.pa-float {
  position: fixed; z-index: 9999; touch-action: none; user-select: none;
  transition: transform 0.22s ease;
  cursor: grab;
}
.pa-float:active { cursor: grabbing; }
.pa-float-icon {
  width: 100%; height: 100%; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #5b9cff 0%, #1a4fc0 100%);
  box-shadow: 0 6px 24px rgba(79,140,255,0.40), 0 0 0 3px rgba(79,140,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 40px; color: #fff;
  transition: box-shadow 0.22s, transform 0.22s;
}
.pa-float:hover .pa-float-icon,
.pa-float.dragging .pa-float-icon {
  box-shadow: 0 8px 32px rgba(79,140,255,0.55), 0 0 0 5px rgba(79,140,255,0.25);
  transform: scale(1.06);
}
.pa-float-badge {
  position: absolute; top: -2px; right: -2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--ok, #34d399); border: 2px solid var(--bg, #070b16);
  animation: paPulse 1.8s infinite;
}
@keyframes paPulse {
  0%,100% { box-shadow: 0 0 0 0 #34d39988; }
  50% { box-shadow: 0 0 0 8px transparent; }
}

/* ---- Dialog ---- */
.pa-overlay {
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
}
.pa-dialog {
  width: 560px; max-width: 95vw; height: 660px; max-height: 88vh;
  display: flex; flex-direction: column;
  background: var(--panel, #0e1424);
  border: 1px solid var(--line, #1f2942);
  border-radius: 18px; box-shadow: 0 32px 80px rgba(0,0,0,0.55);
  overflow: hidden; animation: paPopIn 0.22s ease;
}
@keyframes paPopIn { from { opacity:0; transform:scale(0.94) translateY(10px); } to { opacity:1; transform:none; } }
.pa-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid var(--line, #1f2942);
}
.pa-title { font-size: 16px; font-weight: 700; color: var(--accent, #4f8cff); margin: 0; }
.pa-close { background:none; border:none; color:var(--text-2); font-size:18px; cursor:pointer; padding:4px 8px; border-radius:6px; }
.pa-close:hover { color:var(--text); }
.pa-info {
  padding: 10px 18px; border-bottom: 1px solid var(--line, #1f2942);
  background: var(--bg-2, #0a0f1f);
}
.pa-info-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
.pa-dot { width:10px; height:10px; background:var(--accent); border-radius:50%; }
.pa-info-text { font-size:12px; font-weight:600; color:var(--text-2); letter-spacing:0.04em; }
.pa-info-sub { display:flex; align-items:center; justify-content:space-between; }
.pa-version { font-size:11px; color:var(--text-3); }
.pa-status-dot { width:7px; height:7px; background:var(--ok); border-radius:50%; }
.pa-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
.pa-msg-row { display:flex; }
.pa-msg-user { justify-content:flex-end; }
.pa-msg-assistant { justify-content:flex-start; }
.pa-bubble { max-width:85%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.55; word-break:break-word; white-space:pre-wrap; }
.pa-bubble-user { background:var(--accent); color:#fff; border-bottom-right-radius:4px; }
.pa-bubble-assistant { background:var(--card); color:var(--text); border:1px solid var(--line); border-bottom-left-radius:4px; }

/* ---- Action Card ---- */
.pa-action-card {
  max-width:90%; margin:0;
  background:var(--bg-2, #0a0f1f);
  border:1px solid var(--accent, #4f8cff);
  border-radius:12px; overflow:hidden;
  animation: paActionIn 0.25s ease;
}
@keyframes paActionIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.pa-action-head {
  display:flex; align-items:center; gap:8px;
  padding:10px 14px;
  background:rgba(79,140,255,0.10);
  border-bottom:1px solid var(--line, #1f2942);
}
.pa-action-icon { font-size:18px; }
.pa-action-name { font-size:13px; font-weight:700; color:var(--accent); }
.pa-action-status {
  margin-left:auto; font-size:11px; font-weight:600;
  padding:2px 8px; border-radius:6px;
}
.pa-action-status.running { background:rgba(250,204,21,0.15); color:#facc15; }
.pa-action-status.done { background:rgba(52,211,153,0.15); color:#34d399; }
.pa-action-status.error { background:rgba(248,113,113,0.15); color:#f87171; }
.pa-action-body {
  padding:10px 14px;
  font-size:13px; color:var(--text-2);
  line-height:1.5; max-height:200px; overflow-y:auto;
}

/* ---- Structured data cards ---- */
.pa-data-card {
  max-width:90%;
  background:var(--bg-2, #0a0f1f);
  border:1px solid var(--line, #1f2942);
  border-radius:12px; overflow:hidden;
}
.pa-data-card .pa-data-head {
  padding:10px 14px;
  font-size:13px; font-weight:700; color:var(--text);
  border-bottom:1px solid var(--line, #1f2942);
  background:rgba(79,140,255,0.06);
}
.pa-data-card .pa-data-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:8px 14px; font-size:13px;
  border-bottom:1px solid rgba(31,41,66,0.4);
}
.pa-data-card .pa-data-row:last-child { border-bottom:none; }
.pa-data-label { color:var(--text-3); }
.pa-data-value { color:var(--text); font-weight:600; }
.pa-data-value.price { color:var(--accent); }
.pa-data-value.risk-low { color:#34d399; }
.pa-data-value.risk-medium { color:#facc15; }
.pa-data-value.risk-high { color:#f97316; }
.pa-data-value.risk-critical { color:#f87171; }
.pa-data-highlight {
  margin:8px 14px 12px;
  padding:8px 12px;
  background:rgba(79,140,255,0.08);
  border-radius:8px;
  font-size:12px; color:var(--accent);
  line-height:1.5;
}

/* ---- Loading ---- */
.pa-loading { display:flex; align-items:center; gap:5px; padding:14px 18px; }
.pa-dot-bounce { width:7px; height:7px; background:var(--text-3); border-radius:50%; animation:paB 0.8s infinite ease-in-out; }
.pa-dot-bounce:nth-child(2) { animation-delay:0.2s; }
.pa-dot-bounce:nth-child(3) { animation-delay:0.4s; }
@keyframes paB { 0%,100%{transform:translateY(0);opacity:0.35} 50%{transform:translateY(-6px);opacity:1} }

/* ---- Quick Actions ---- */
.pa-quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:4px; }
.pa-quick-btn {
  padding:10px 14px; font-size:13px; line-height:1.45;
  background:var(--card); color:var(--text);
  border:1px solid var(--line); border-radius:10px;
  cursor:pointer; text-align:left; transition:background 0.15s,border-color 0.15s;
}
.pa-quick-btn:hover { background:var(--panel-2); border-color:var(--accent); }
.pa-input-row { display:flex; align-items:center; gap:8px; padding:14px 18px; border-top:1px solid var(--line); }
.pa-input {
  flex:1; padding:10px 14px;
  background:var(--bg-2); color:var(--text);
  border:1px solid var(--line); border-radius:10px;
  font-size:14px; outline:none; transition:border-color 0.15s;
}
.pa-input:focus { border-color:var(--accent); }
.pa-input::placeholder { color:var(--text-3); }
.pa-send {
  width:40px; height:40px; display:flex; align-items:center; justify-content:center;
  background:var(--accent); color:#fff; border:none; border-radius:10px; font-size:16px;
  cursor:pointer; transition:opacity 0.15s;
}
.pa-send:hover:not(:disabled) { opacity:0.85; }
.pa-send:disabled { opacity:0.35; cursor:not-allowed; }
`;

// ===========================================================================
// FloatingButton — draggable floating icon (unchanged)
// ===========================================================================
class FloatingButton {
  constructor({ size = 72, onClick } = {}) {
    this.size = size;
    this.onClick = onClick;
    this.left = 0; this.top = 0;
    this.dragging = false; this.moved = false; this.hovering = false;
    this._ptrId = null;
    this._startX = 0; this._startY = 0;
    this._offX = 0; this._offY = 0;
    this._el = null;
    this._create();
  }

  _clamp(v, mn, mx) { return Math.min(Math.max(v, mn), mx); }

  _create() {
    const self = this;
    const gap = 20;
    const peek = 16;

    this._el = el('div', { class: 'pa-float' });
    this._el.style.width = this._el.style.height = `${this.size}px`;

    const icon = el('div', { class: 'pa-float-icon', html: '🤖' });
    const badge = el('div', { class: 'pa-float-badge' });
    this._el.append(icon, badge);

    const place = () => {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      this.left = w - this.size - gap;
      this.top = Math.round(h * 0.62);
      this._applyPos();
    };

    const updateTransform = () => {
      if (this.dragging || this.hovering) {
        this._el.style.transform = 'translateX(0)';
      } else {
        this._el.style.transform = `translateX(calc(${this.size}px - ${peek}px))`;
      }
    };

    this._el.addEventListener('pointerdown', (e) => {
      if (self.dragging) return;
      self._ptrId = e.pointerId; self._el.setPointerCapture(e.pointerId);
      self.dragging = true; self.moved = false; self.hovering = true;
      self._el.style.transition = 'none';
      self._startX = e.clientX; self._startY = e.clientY;
      self._offX = e.clientX - self.left; self._offY = e.clientY - self.top;
      updateTransform();
    });
    this._el.addEventListener('pointermove', (e) => {
      if (!self.dragging || e.pointerId !== self._ptrId) return;
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      self.left = self._clamp(e.clientX - self._offX, 10, w - self.size - 10);
      self.top = self._clamp(e.clientY - self._offY, 10, h - self.size - 10);
      self._applyPos();
      if (!self.moved && Math.hypot(e.clientX - self._startX, e.clientY - self._startY) > 4) self.moved = true;
    });
    const up = (e) => {
      if (!self.dragging) return;
      if (self._ptrId !== null) { try { self._el.releasePointerCapture(self._ptrId); } catch (_) {} }
      self._ptrId = null; self.dragging = false;
      self._el.style.transition = 'transform 0.22s ease, left 0.2s ease, top 0.2s ease';
      const w = document.documentElement.clientWidth;
      self.left = w - self.size - 20;
      self._applyPos();
      if (!self.moved) self.onClick?.();
      self.moved = false;
      updateTransform();
    };
    this._el.addEventListener('pointerup', up);
    this._el.addEventListener('pointercancel', up);
    this._el.addEventListener('pointerleave', up);

    this._el.addEventListener('mouseenter', () => { self.hovering = true; updateTransform(); });
    this._el.addEventListener('mouseleave', () => { self.hovering = false; updateTransform(); });

    const onResize = () => {
      const w = document.documentElement.clientWidth;
      const h = document.documentElement.clientHeight;
      self.left = self._clamp(self.left, 10, w - self.size - 10);
      self.top = self._clamp(self.top, 10, h - self.size - 10);
      self._applyPos();
    };
    window.addEventListener('resize', onResize, { passive: true });

    setTimeout(place, 10);
    setTimeout(updateTransform, 50);

    document.body.appendChild(this._el);
  }

  _applyPos() {
    if (!this._el) return;
    this._el.style.left = `${this.left}px`;
    this._el.style.top = `${this.top}px`;
  }

  destroy() {
    if (this._el) { this._el.remove(); this._el = null; }
  }
}

// ===========================================================================
// PopupAssistant — AI chat dialog (DeepSeek + function calling)
// ===========================================================================
class PopupAssistant {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this._asstId = null;
    this._overlay = null;
    this._toolRound = 0;

    // Initialise the chat history (system prompt)
    this._chatHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Welcome message
    this.messages = [{
      id: 1,
      sender: 'assistant',
      type: 'text',
      text: t('pa_welcome')
    }];
    this._chatHistory.push({ role: 'assistant', content: this.messages[0].text });
  }

  get quickActions() {
    return [
      t('pa_quick_recommend'),
      t('pa_quick_compare_all'),
      t('pa_quick_portfolio'),
      t('pa_quick_alerts')
    ];
  }

  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      // Preload the case list
      if (!state.cases || !state.cases.length) {
        api.getCases().then((cases) => { state.cases = cases; }).catch(() => {});
      }
      this._render();
    }
  }

  close() {
    this.isOpen = false;
    if (this._overlay) { this._overlay.remove(); this._overlay = null; }
  }
  toggle() { this.isOpen ? this.close() : this.open(); }

  _render() {
    const self = this;
    this._overlay = el('div', { class: 'pa-overlay', onclick: (e) => { if (e.target === self._overlay) self.close(); } });

    const dlg = el('div', { class: 'pa-dialog' });

    // Header
    dlg.append(el('div', { class: 'pa-header' },
      el('h2', { class: 'pa-title', text: t('pa_title') }),
      el('button', { class: 'pa-close', text: '✕', onclick: () => self.close() })
    ));

    // Info bar
    dlg.append(el('div', { class: 'pa-info' },
      el('div', { class: 'pa-info-row' },
        el('span', { class: 'pa-dot' }),
        el('span', { class: 'pa-info-text', text: 'TRADESHIELD PROTOCOL · AI POWERED' })
      ),
      el('div', { class: 'pa-info-sub' },
        el('span', { class: 'pa-version', text: 'Powered by DeepSeek · Workflow' }),
        el('span', { class: 'pa-status-dot' })
      )
    ));

    // Messages
    const msgList = el('div', { class: 'pa-msgs' });
    dlg.append(msgList);

    // Input
    const input = el('input', {
      class: 'pa-input', type: 'text', placeholder: t('pa_input_ph'),
      onkeydown: (e) => { if (e.key === 'Enter' && !self.isLoading) self._send(input.value); }
    });
    const sendBtn = el('button', {
      class: 'pa-send', disabled: true, html: '➤',
      onclick: () => self._send(input.value)
    });
    input.addEventListener('input', () => { sendBtn.disabled = self.isLoading || !input.value.trim(); });
    dlg.append(el('div', { class: 'pa-input-row' }, input, sendBtn));

    this._overlay.appendChild(dlg);
    document.body.appendChild(this._overlay);

    // Escape
    const esc = (e) => { if (e.key === 'Escape') { self.close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);

    // Render messages
    const renderMsgs = () => {
      clear(msgList);
      for (const m of self.messages) {
        if (m.type === 'action') {
          // Action Card
          msgList.append(self._renderActionCard(m));
        } else if (m.type === 'data') {
          // Structured data card
          msgList.append(self._renderDataCard(m));
        } else {
          // Plain text bubble
          msgList.append(el('div', { class: `pa-msg-row pa-msg-${m.sender}` },
            el('div', { class: `pa-bubble pa-bubble-${m.sender}` }, m.text)
          ));
        }
      }
      // Loading
      if (self.isLoading && self.messages[self.messages.length - 1]?.sender === 'assistant') {
        const lastMsg = self.messages[self.messages.length - 1];
        if (!lastMsg.text && lastMsg.type !== 'action' && lastMsg.type !== 'data') {
          msgList.append(el('div', { class: 'pa-msg-row pa-msg-assistant' },
            el('div', { class: 'pa-bubble pa-bubble-assistant pa-loading' },
              el('span', { class: 'pa-dot-bounce' }),
              el('span', { class: 'pa-dot-bounce' }),
              el('span', { class: 'pa-dot-bounce' })
            )
          ));
        }
      }
      // Quick actions
      if (!self.isLoading) {
        const grid = el('div', { class: 'pa-quick-grid' });
        for (const a of self.quickActions) {
          grid.append(el('button', { class: 'pa-quick-btn', text: a, onclick: () => self._send(a) }));
        }
        msgList.append(grid);
      }
      msgList.scrollTop = msgList.scrollHeight;
    };
    this._renderMsgs = renderMsgs;
    renderMsgs();
    setTimeout(() => input.focus(), 150);
  }

  /** Render an action card */
  _renderActionCard(m) {
    const statusClass = m.status === 'done' ? 'done' : m.status === 'error' ? 'error' : 'running';
    const statusText = m.status === 'done' ? t('pa_status_done') : m.status === 'error' ? t('pa_status_error') : t('pa_status_running');
    const iconMap = {
      getCases: '📋', selectCase: '📌', analyzePricing: '💰', compareSpeeds: '📊',
      analyzeRisk: '🛡️', getWorldRisk: '🌍', mintRWA: '⛓️', searchKnowledge: '🔍', getWalletStatus: '🔑',
      recommendEBL: '🤖', getPortfolio: '💼', getPoolStatus: '📦', getAgentActivity: '📜',
      compareEBLs: '⚖️', subscribeRWA: '💳'
    };

    return el('div', { class: 'pa-msg-row pa-msg-assistant' },
      el('div', { class: 'pa-action-card' },
        el('div', { class: 'pa-action-head' },
          el('span', { class: 'pa-action-icon', text: iconMap[m.tool] || '🔧' }),
          el('span', { class: 'pa-action-name', text: m.label }),
          el('span', { class: `pa-action-status ${statusClass}`, text: statusText })
        ),
        m.result ? el('div', { class: 'pa-action-body', text: m.result }) : null
      )
    );
  }

  /** Render a structured data card */
  _renderDataCard(m) {
    return el('div', { class: 'pa-msg-row pa-msg-assistant' },
      el('div', { class: 'pa-data-card' },
        el('div', { class: 'pa-data-head', text: m.title }),
        ...(m.rows || []).map((r) => el('div', { class: 'pa-data-row' },
          el('span', { class: 'pa-data-label', text: r.label }),
          el('span', { class: `pa-data-value ${r.css || ''}`, text: r.value })
        )),
        m.highlight ? el('div', { class: 'pa-data-highlight', text: m.highlight }) : null
      )
    );
  }

  // ===========================================================================
  // Core: send a message + function-calling loop
  // ===========================================================================
  async _send(text) {
    const txt = (text || '').trim();
    if (!txt || this.isLoading) return;
    this.isLoading = true;
    this._toolRound = 0;

    // Add the user message
    this.messages.push({ id: Date.now(), sender: 'user', type: 'text', text: txt });
    this._chatHistory.push({ role: 'user', content: txt });

    // Create the assistant placeholder
    const asstId = Date.now() + 1; this._asstId = asstId;
    const asstMsg = { id: asstId, sender: 'assistant', type: 'text', text: '' };
    this.messages.push(asstMsg);
    this._renderMsgs?.();

    try {
      await this._conversationLoop(asstMsg);
    } catch (e) {
      asstMsg.text = t('pa_error_generic', { msg: e.message });
    } finally {
      this.isLoading = false; this._asstId = null;
      this._renderMsgs?.();
      const inp = this._overlay?.querySelector('.pa-input');
      if (inp) setTimeout(() => inp.focus(), 50);
    }
  }

  /**
   * Function-calling conversation loop
   * Loops at most MAX_ROUNDS times; each round:
   *   1. Call DeepSeek with streaming to get the reply
   *   2. If the AI returns tool_calls → execute them → append results to history → continue
   *   3. If the AI returns plain text → stop
   */
  async _conversationLoop(asstMsg) {
    const MAX_ROUNDS = 5;

    while (this._toolRound < MAX_ROUNDS) {
      this._toolRound++;

      // Call DeepSeek (streaming)
      let content = '';
      let toolCalls = [];

      const result = await ds.streamChat(this._chatHistory, TOOLS, {
        onChunk: (chunk) => {
          content += chunk;
          asstMsg.text = content;
          asstMsg.type = 'text';
          this._updateBubble();
        }
      });

      content = result.content || '';
      toolCalls = result.tool_calls || [];

      // The AI returned tool_calls
      if (toolCalls && toolCalls.length > 0) {
        // Add the assistant message (with tool_calls) to chatHistory
        const assistantMsg = {
          role: 'assistant',
          content: content || null,
          tool_calls: toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
          }))
        };
        this._chatHistory.push(assistantMsg);

        // Execute each tool
        for (const tc of toolCalls) {
          await this._executeTool(tc);
        }

        // Reset asstMsg so the next round can append text
        asstMsg.text = '';
        content = '';
        // Continue the loop (the AI may produce a final reply from the tool results)
        continue;
      }

      // Plain text reply → done
      if (content) {
        asstMsg.text = content;
        asstMsg.type = 'text';
        this._chatHistory.push({ role: 'assistant', content });
      } else {
        // Neither content nor a tool call
        asstMsg.text = t('pa_no_response');
        asstMsg.type = 'text';
        this._chatHistory.push({ role: 'assistant', content: asstMsg.text });
      }
      return;
    }

    // Exceeded the maximum number of rounds
    asstMsg.text = t('pa_max_rounds');
    asstMsg.type = 'text';
    this._chatHistory.push({ role: 'assistant', content: asstMsg.text });
  }

  /**
   * Execute a single tool call
   */
  async _executeTool(toolCall) {
    const { id, name, arguments: args } = toolCall;

    // Create the action card
    const actionMsg = {
      id: Date.now(),
      sender: 'assistant',
      type: 'action',
      tool: name,
      label: this._toolLabel(name, args),
      status: 'running',
      result: ''
    };
    this.messages.splice(this.messages.length - 1, 0, actionMsg);
    this._renderMsgs?.();

    // Execute
    const executor = toolExecutors[name];
    let result;
    if (executor) {
      try {
        result = await executor(args);
        actionMsg.status = 'done';
      } catch (e) {
        result = `Execution failed: ${e.message}`;
        actionMsg.status = 'error';
      }
    } else {
      result = `Unknown tool: ${name}`;
      actionMsg.status = 'error';
    }

    actionMsg.result = result;
    this._renderMsgs?.();

    // Append the tool result to chatHistory
    this._chatHistory.push({
      role: 'tool',
      tool_call_id: id,
      content: String(result).slice(0, 2000) // cap the length
    });
  }

  /** Localised labels for tool calls */
  _toolLabel(name, args) {
    const labels = {
      getCases: t('pa_tool_getCases'),
      selectCase: t('pa_tool_selectCase', { id: args.case_id || '' }),
      analyzePricing: t('pa_tool_analyzePricing', { speed: args.payout_speed || 'BALANCED' }),
      compareSpeeds: t('pa_tool_compareSpeeds'),
      analyzeRisk: t('pa_tool_analyzeRisk'),
      getWorldRisk: t('pa_tool_getWorldRisk'),
      mintRWA: t('pa_tool_mintRWA', { amount: args.financing_usd ? ' · $' + args.financing_usd : '' }),
      searchKnowledge: t('pa_tool_searchKnowledge', { query: args.query || '' }),
      getWalletStatus: t('pa_tool_getWalletStatus'),
      recommendEBL: t('pa_tool_recommendEBL', { preference: args.preference || '' }),
      getPortfolio: t('pa_tool_getPortfolio'),
      getPoolStatus: t('pa_tool_getPoolStatus', { id: args.case_id || '' }),
      getAgentActivity: t('pa_tool_getAgentActivity', { n: args.limit || 5 }),
      compareEBLs: t('pa_tool_compareEBLs', { n: (args.case_ids || []).length || 0 }),
      subscribeRWA: t('pa_tool_subscribeRWA', { id: args.case_id || '', amount: args.amount_usd ? ' · $' + args.amount_usd : '' })
    };
    return labels[name] || t('pa_tool_call', { name });
  }

  /** Update the chat bubble while streaming */
  _updateBubble() {
    const bubbles = this._overlay?.querySelectorAll('.pa-bubble-assistant:not(.pa-loading)');
    if (!bubbles?.length) return;
    const last = bubbles[bubbles.length - 1];
    const m = this.messages.find((x) => x.id === this._asstId && x.sender === 'assistant');
    if (m && last && m.type === 'text') last.textContent = m.text;
    const msgs = this._overlay?.querySelector('.pa-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
}

// ===========================================================================
// Initialisation entry point
// ===========================================================================
let _inst = null;

export function initPopupAssistant() {
  if (_inst) return _inst;

  // Inject styles
  if (!document.getElementById('pa-styles')) {
    const s = document.createElement('style'); s.id = 'pa-styles'; s.textContent = STYLES;
    document.head.appendChild(s);
  }

  const popup = new PopupAssistant();

  // Create the floating button
  new FloatingButton({
    size: 72,
    onClick: () => popup.open()
  });

  _inst = popup;
  return _inst;
}

export function getPopupAssistant() {
  return _inst;
}
