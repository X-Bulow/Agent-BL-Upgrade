/**
 * AgentBL one-click demo script
 *
 * Walks the full AI pricing storyline in about a minute:
 *  case loading → AI valuation → pricing discount → investor subscription → shipping risk → x402 paid intel
 *
 * Mirrors the one-minute closed-loop pacing of wohainengren.
 * Runs fully offline: no wallet, contract or API key needed.
 *
 * Usage: npm run demo:once
 */

import { createServer } from '../src/app/server.js';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║       AgentBL · AI dynamic pricing for eBL-backed RWA    ║');
console.log('║       One-click demo — full loop in 1 minute             ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

const server = createServer();
await new Promise((r) => server.listen(0, r));
const { port } = server.address();
const API = `http://127.0.0.1:${port}`;

try {
  // ═══════════════════════════════════════════════════════
  // Act 1: case selection (10 seconds)
  // ═══════════════════════════════════════════════════════
  console.log('┌─ Act 1 ──────────────────────────────────────────────┐');
  console.log('│ 🚢 Port of Singapore: 500 t of copper cathodes        │');
  console.log('│    about to be loaded                                │');
  console.log('│    Destination: Port of Shanghai                     │');
  console.log('│    Invoice value: $4,500,000                         │');
  console.log('│    Exporter: Shanghai Metals Export Co.              │');
  console.log('│    Pain point: cargo is at sea for 18 days, but the  │');
  console.log('│    money takes 45 days to come back                  │');
  console.log('└──────────────────────────────────────────────────────┘\n');

  const cases = await fetch(`${API}/api/cases`).then((r) => r.json());
  const copperCase = cases.cases.find((c) => c.case_id === 'CASE-EBL-2026-0001');
  console.log(`  ✓ Case loaded: ${copperCase.label} (${copperCase.risk_hint})\n`);

  // ═══════════════════════════════════════════════════════
  // Act 2: AI pricing (15 seconds)
  // ═══════════════════════════════════════════════════════
  console.log('┌─ Act 2 ──────────────────────────────────────────────┐');
  console.log('│ 🤖 AI pricing and risk-control agent starts          │');
  console.log('│    ① Document check: cross-verify eBL / invoice /    │');
  console.log('│       insurance                                      │');
  console.log('│    ② Valuation: live LME copper price + UN Comtrade  │');
  console.log('│       historical trades                              │');
  console.log('│    ③ Risk: five-dimension score (war / weather /     │');
  console.log('│       port / insurance / price volatility)           │');
  console.log('│    ④ Pricing: discount = payout speed + trade risk   │');
  console.log('└──────────────────────────────────────────────────────┘\n');

  const comparison = await fetch(`${API}/api/pricing/quote?compare=true`, { method: 'POST' }).then((r) => r.json());

  for (const q of comparison.quotes) {
    const yield_pct = ((1 / q.final_issue_price_usd - 1) * 100).toFixed(1);
    console.log(`  ${q.payout_speed.padEnd(10)} Issue price: $${q.final_issue_price_usd.toFixed(3)}  |  Investor return: +${yield_pct}%  |  Action: ${q.pricing_action}`);
  }
  console.log(`\n  ✓ Recommended payout speed: ${comparison.recommended_payout_speed}\n`);

  // ═══════════════════════════════════════════════════════
  // Act 3: investment (10 seconds)
  // ═══════════════════════════════════════════════════════
  console.log('┌─ Act 3 ──────────────────────────────────────────────┐');
  console.log('│ 💰 Investor subscription                              │');
  console.log('│    Exporter pledges the eBL → smart contract creates │');
  console.log('│    an RWA offering                                   │');
  console.log('│    Investors subscribe at a $0.80 discount → target  │');
  console.log('│    redemption $1.00                                  │');
  console.log('│    RiskPricingOracle anchors the pricing decision    │');
  console.log('│    on-chain                                          │');
  console.log('└──────────────────────────────────────────────────────┘\n');

  const offering = await fetch(`${API}/api/offering/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payout_speed: 'FAST' })
  }).then((r) => r.json());

  const steps = offering.steps.map((s) => `${s.state} →`).join(' ');
  console.log(`  ✓ Lifecycle: ${steps} ${offering.final_state}`);
  console.log(`  ✓ Initial price: $${offering.initial_quote?.final_issue_price_usd?.toFixed(3)}\n`);

  // ═══════════════════════════════════════════════════════
  // Act 4: shipping risk (15 seconds)
  // ═══════════════════════════════════════════════════════
  console.log('┌─ Act 4 ──────────────────────────────────────────────┐');
  console.log('│ 🌪 Incidents during the voyage                         │');
  console.log('│    ① Typhoon forms in the East China Sea → AI adds   │');
  console.log('│       150 bps of weather risk                        │');
  console.log('│    ② Hormuz conflict escalates → AI spots the        │');
  console.log('│       double-edged war premium                       │');
  console.log('│    ③ AI does the opposite: 21% haircut + pause       │');
  console.log('│       issuance                                       │');
  console.log('│    "A price oracle thinks a higher copper price is   │');
  console.log('│     safer — exactly backwards"                       │');
  console.log('└──────────────────────────────────────────────────────┘\n');

  // War-crisis case
  const warRes = await fetch(`${API}/api/pricing/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_id: 'CASE-EBL-2026-CU-SG-SHA-WARCRISIS', payout_speed: 'FAST' })
  });

  if (warRes.ok) {
    const war = await warRes.json();
    console.log(`  ⚔ War crisis: issue price $${war.final_issue_price_usd?.toFixed(3)}  |  risk ${war.risk_score_bps}bps  |  Action: ${war.pricing_action}`);
    console.log(`  ✓ The AI saw through the misleading war-premium signal\n`);
  }

  // ═══════════════════════════════════════════════════════
  // Act 5: x402 paid intel (10 seconds)
  // ═══════════════════════════════════════════════════════
  console.log('┌─ Act 5 ──────────────────────────────────────────────┐');
  console.log('│ 💎 x402 paid intel market                             │');
  console.log('│    AI decides free intel is not enough → pays        │');
  console.log('│    automatically to unlock premium data              │');
  console.log('│    HTTP 402 → EIP-3009 signature → on-chain          │');
  console.log('│    settlement → intel unlocked                       │');
  console.log('│    PaymentOracle records auditable on-chain payment  │');
  console.log('│    evidence                                          │');
  console.log('└──────────────────────────────────────────────────────┘\n');

  const x402 = await fetch(`${API}/api/x402/smoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'zh' })
  }).then((r) => r.json());

  if (x402.ok) {
    console.log(`  ✓ x402 payment flow: ${x402.steps.length} steps (challenge → sign → settle → unlock)`);
    console.log(`  ✓ Payment evidence txHash: ${x402.payment?.txHash?.slice(0, 42)}…`);
    console.log(`  ✓ Intel unlocked: ${x402.intel_preview?.events_count || 0} risk events, ${x402.intel_preview?.deep_intel_count || 0} deep-intel items\n`);
  }

  // ═══════════════════════════════════════════════════════
  // Wrap-up
  // ═══════════════════════════════════════════════════════
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  🎯 In one sentence:                                     ║');
  console.log('║                                                          ║');
  console.log('║  Ordinary DeFi lets the market guess the price and       ║');
  console.log('║  leaves liquidation to clean up afterwards.              ║');
  console.log('║  AgentBL lets AI turn trade fraud and real-world risk,   ║');
  console.log('║  BEFORE the investor places an order,                    ║');
  console.log('║  into an explainable, on-chain RWA discount.             ║');
  console.log('║                                                          ║');
  console.log('║  AI prices the risk; the chain enforces it.              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

} finally {
  server.close();
}
