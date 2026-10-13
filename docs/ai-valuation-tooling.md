# AI Valuation Tool Calling (Copper Market Valuation + Historical Comparable Trade Prices)

This document describes AgentBL's **AI valuation tool calling**: an LLM uses tool calling to fetch a cargo batch's **live market valuation** and **historical comparable trade prices**, then uses a local deterministic tool to compute the collateral base for the discounted RWA issuance (`ai_verified_collateral_value`).

By default it runs on the **copper cathode** dataset (`data/cases/copper-sg-shanghai.case.json`).

> In one sentence: the AI does not invent a valuation out of thin air; it **calls tools** to fetch real prices + historical trade prices, then hands them to a deterministic policy tool that computes a conservative collateral value. The LLM only "decides which tools to call, how large a haircut to apply, and writes the explanation"; the hard numbers come from local tools.

## 1. How to Run

```bash
# Offline (no keys at all): deterministic fallback, using mock data calibrated to 2026-06
npm run agent:value

# Point at another dataset (crude oil)
node scripts/agent-valuation.mjs data/cases/crude-sg-ulsan.case.json
```

Put keys into `.env` (see `.env.example` at the repo root) and it switches to "real LLM-driven + real data sources". Without keys it uses mocks throughout, so the demo always runs.

## 2. Architecture

```
data/cases/*.case.json
  → src/agent/valuationAgent.js        # Orchestration: LLM tool-calling loop / or deterministic fallback
      ├─ src/agent/llm/openaiCompatClient.js   # OpenAI-compatible client (DeepSeek/Qwen/...)
      └─ src/agent/tools/copperValuationTools.js  # 4 tools: spec + executor + mock fallback
  → scripts/agent-valuation.mjs        # CLI that prints a structured valuation report
```

Two execution paths with **exactly the same output structure**:

1. **LLM path** (with a key): the model reads the case, decides on its own which tools to call in order, and finally writes the explanation.
2. **Deterministic fallback** (no key / LLM error): calls the same tools in a fixed order, with a templated explanation.

## 3. The Four Tools (Tool Calling)

| Tool | Purpose | Data source (with key) | Without key |
|---|---|---|---|
| `get_live_commodity_price` | Live LME copper price (USD/MT) | metalpriceapi.com or Alpha Vantage | mock: 13,680 (calibrated 2026-06) |
| `get_regional_physical_premium` | CIF Shanghai/Yangshan regional premium (USD/MT) | `REGION_PREMIUM_USD_PER_MT` (entered manually) | mock: 70 |
| `get_historical_comparable_trades` | Historical comparable trade prices (import/export unit values by HS code) | UN Comtrade | mock: China HS740311 import unit value 9,850→13,250 |
| `compute_cargo_valuation` | Local deterministic valuation (take the minimum + haircut) | Purely local, no API | Purely local |

`compute_cargo_valuation` is the pricing "hard constraint" tool (the PRD requires "final price is checked by a deterministic policy; the LLM only explains"):

```
landed_price        = market_price + regional_premium
market_value        = quantity_mt × landed_price
raw_verified        = min(declared_invoice, market_value, insured_value)
ai_verified_collateral = raw_verified × (1 − volatility_haircut)      # high prices + war premium → haircut
max_safe_redemption = ai_verified_collateral × redemption_coverage_limit   # default 0.9
```

Actual result for the copper set (offline): market $6,875,000 → 5% war-premium haircut → AI-verified collateral **$6,531,250** → safe redemption cap **$5,878,125** (> requested financing of $5,500,000, so it can be issued).

## 4. ⭐ APIs You Need to Provide (the answer to "which APIs are needed")

All are **optional**: if left blank, mocks are used. For a "real AI + real data" demo, add the keys in the tables below to `.env`.

### 4.1 LLM (pick one; at least one is required for it to count as "truly AI-driven")

| Provider | Purpose | env variable | Cost | Sign-up URL | Model |
|---|---|---|---|---|---|
| **DeepSeek** | Main tool-calling engine (recommended: cheap, available in mainland China) | `DEEPSEEK_API_KEY` | Low-cost paid | platform.deepseek.com | `deepseek-chat` |
| **Qwen (Tongyi Qianwen)** | DashScope OpenAI-compatible mode | `DASHSCOPE_API_KEY` | Has a free quota | dashscope.console.aliyun.com | `qwen-plus` / `qwen-max` |
| Custom | Any OpenAI-compatible endpoint | `LLM_BASE_URL` + `LLM_API_KEY` | — | — | `LLM_MODEL` |

> Both providers natively support OpenAI's `tools` / `tool_calls` protocol, so the same code works unchanged.

### 4.2 Live Copper Price (pick one; mock used if blank)

| Provider | Purpose | env variable | Cost | Sign-up URL | Notes |
|---|---|---|---|---|---|
| **Alpha Vantage** | `COPPER` global monthly copper price (USD/MT) | `ALPHAVANTAGE_API_KEY` | Free | alphavantage.co/support/#api-key | Free and easy to integrate; it is a monthly global price, not LME real-time |
| **metalpriceapi.com** | Near-real-time LME copper (USD/MT) | `METALPRICE_API_KEY` | Free quota | metalpriceapi.com | Closer to LME spot; confirm symbols/units against its docs |
| Alternatives | commodities-api.com / metals-api.com | Same as above | Free quota | — | Sister products |

> There is no clean free API for the regional premium (Yangshan/CIF Shanghai premium); SMM and Fastmarkets are paid. Just enter the current value manually in `REGION_PREMIUM_USD_PER_MT`.

### 4.3 Historical Comparable Trade Prices (strongly recommended, free)

| Provider | Purpose | env variable | Cost | Sign-up URL |
|---|---|---|---|---|
| **UN Comtrade** | Per-country import/export **transaction unit values** by HS code (trade value ÷ net weight) | `COMTRADE_PRIMARY_KEY` | Free (registration and subscription required) | comtradedeveloper.un.org |

UN Comtrade is the best free source for "historical comparable trade prices": query **HS 740311 (refined copper cathodes)**, reporter=156 (China), flow=import to get the import unit value for each period and check whether the pricing of your cargo is reasonable. For crude oil use **HS 270900**.

### 4.4 Future Extensions (mocked / not yet integrated)

- Vessels/port arrivals (AIS): MarineTraffic, Datalastic, Spire — verify transport events and ETA.
- Weather/sea state: OpenWeather, Stormglass — severe_weather risk.
- War/sanctions/geopolitics: GDELT (free), news APIs, OFAC/sanctions lists — war_risk / sanction_risk.
- Port congestion: port authority / AIS-derived data.

Once these are wired in, `risk_discount` can also be driven by tool calling, not just the valuation.

## 5. Tool-Calling Flow (OpenAI-Compatible)

```
system: You are the AgentBL valuation analyst; use tools to value the cargo...
user:   case CASE-EBL-2026-CU-SG-SHA: copper 500MT, HS740311, invoice $6.875M, insurance $7.5625M, macro: war_risk/commodity_volatility
  → assistant.tool_calls: get_live_commodity_price(copper)
  ← tool: {price_usd_per_mt:13680, source:...}
  → assistant.tool_calls: get_regional_physical_premium(Shanghai)
  ← tool: {premium_usd_per_mt:70}
  → assistant.tool_calls: get_historical_comparable_trades(740311, 156)
  ← tool: {comparables:[...9850→13250...]}
  → assistant.tool_calls: compute_cargo_valuation(qty,price,premium,declared,insured,haircut=0.05)
  ← tool: {ai_verified_collateral_value_usd:6531250, max_safe_redemption_exposure_usd:5878125}
  → assistant: "Verified collateral USD 6,531,250... 5% war-premium haircut..." (investor-readable explanation)
```

The code is in `runWithLlm()` in `src/agent/valuationAgent.js`: it loops over `tool_calls` → feeds back the `role:"tool"` results → until the model stops calling tools, then outputs the explanation.

## 6. Output Structure

`runValuationAgent(caseData)` returns (this is also what the CLI prints):

```jsonc
{
  "case_id": "CASE-EBL-2026-CU-SG-SHA",
  "commodity": "Copper Cathode", "hs_code": "740311", "quantity_mt": 500,
  "live_market": {
    "price_usd_per_mt": 13680, "regional_premium_usd_per_mt": 70,
    "landed_price_usd_per_mt": 13750, "as_of": "2026-06-04", "sources": [...]
  },
  "historical_comparables": [ {"period":"2026-05","unit_value_usd_per_mt":13250,...} ],
  "valuation": {
    "market_value_usd": 6875000, "ai_verified_collateral_value_usd": 6531250,
    "max_safe_redemption_exposure_usd": 5878125, "valuation_basis": "..."
  },
  "ai_explanation": "...", "provider": "deepseek|qwen|deterministic-fallback", "tool_trace": [...]
}
```

This `ai_verified_collateral_value_usd` / `max_safe_redemption_exposure_usd` is exactly the input to `PricingQuote` in PRD §8.4: the pricing engine uses it to compute `recommended_token_supply` and `final_issue_price`.

## 7. Connecting to the Main Pipeline / to the Contracts

- Main pipeline: feed this report into the (not yet implemented) pricing engine → `PricingQuote` → `/api/pricing/quote`.
- Contracts: `max_safe_redemption_exposure_usd` constrains `RWAOfferingPool.createOffering`; the valuation evidence hash is written to `RiskPricingOracle`.
- Verification: `npm run agent:value` (offline) / `npm run test` (includes the `tests/valuationAgent.test.js` invariants).
