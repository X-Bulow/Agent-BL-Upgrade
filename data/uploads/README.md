# Simulated User Uploads

These are **simulated user-uploaded** trade documents that feed AgentBL's main AI document review / valuation / pricing pipeline. Both cargo sets ship from **Singapore**.

> ⚠️ Everything here is **fictional data**: companies, people, vessels, document numbers, banks and addresses are all made up for the demo and do not refer to any real entity or real shipment. Prices are **calibrated** to real-world magnitudes using public market data from June 2026 (see below), but the specific deal prices are simulated.

## The two sets

| | Copper cathodes | Crude oil |
|---|---|---|
| Directory | `copper-sg-shanghai/` | `crude-sg-ulsan/` |
| Cargo | LME Grade A copper cathodes (HS 7403.11) | Murban crude oil (HS 2709.00) |
| Route | Singapore → Shanghai (Yangshan) | Singapore (Jurong Island) → Ulsan, South Korea |
| Exporter | Strait Resources Trading Pte. Ltd. (Singapore copper trader) | Equator Energy Trading Pte. Ltd. (Singapore oil trader) |
| Importer | Donghai Copper Materials Co., Ltd. (Shanghai) | Hanbit Refining Co., Ltd. (Ulsan) |
| Quantity | 500 MT (20×20'GP, 200 bundles) | 600,000 bbl (≈ 78,221 MT, Aframax) |
| Pricing basis | LME cash settlement price (QP) + CIF Shanghai premium | Platts Dated Brent (QP) + quality differential |
| Unit | USD / MT | USD / bbl (per barrel) |
| **Deal price (invoice total)** | **USD 6,875,000** (13,750 USD/MT, CIF) | **USD 57,900,000** (96.50 USD/bbl, CIF) |
| Insured amount (110% CIF) | USD 7,562,500 | USD 63,690,000 |
| Incoterms | CIF Shanghai | CIF Ulsan |
| Payment | Irrevocable sight L/C | Sight L/C (90% provisional / 10% final settlement) |
| Payout speed tier | FAST | BALANCED |
| Requested financing (USDC) | 5,500,000 | 46,000,000 |

Each set contains:
- `bill-of-lading.md` — a simulated electronic bill of lading (eBL, a negotiable To Order document of title)
- `commercial-invoice.md` — a simulated commercial invoice (with commodity pricing clauses that give the deal price)
- The matching structured cases: `../cases/copper-sg-shanghai.case.json`, `../cases/crude-sg-ulsan.case.json`

## Where the prices come from (real-world calibration)

The simulated world is set in **June 2026**, during a **Middle East / Strait of Hormuz conflict**, so both copper and crude oil are pushed up by a war premium and are highly volatile (figures calibrated to that month's public market data):

- **LME copper**: about **13,700 USD/MT** (near its all-time high). Drivers: the Hormuz war premium, Chilean output at a 23-year low, and expected US tariffs on copper imports.
- **Brent crude**: about **95 USD/bbl** (+43% year on year). Drivers: the US–Iran conflict, the threat of a Hormuz blockade, and consecutive drawdowns in US inventories.

This gives the demo a great storyline: **the same geopolitical event raises the "book value" of both kinds of collateral at once, but also amplifies their volatility and downside risk** — exactly what AI dynamic pricing is meant to handle: apply a haircut to the elevated price for volatility / war premium, then convert it into an RWA issue price. See each case's `macro_risk_events` for details.

## How the two sets differ (why there is one of each)

- **Different pricing units**: copper is priced per tonne, oil per barrel → the AI valuation tool has to convert units (barrels ↔ tonnes).
- **Different benchmarks**: copper follows LME + a regional premium, oil follows Dated Brent + a differential → the market data source has to switch by commodity.
- **Different bill of lading formats**: copper uses a container B/L (container numbers / seals / package counts), oil uses a tanker B/L (API gravity / sulphur content / barrel count).
- **Different HS codes**: 740311 vs 270900 → different codes are used when looking up historical comparable trade prices (UN Comtrade).

## How to use them

- The Task 3 AI valuation tool calling runs against the **copper** set by default: `npm run agent:value` (see `docs/ai-valuation-tooling.md`).
- The fields in these case JSONs follow the new model in `docs/PRD.md` (`requested_cash_usd` / `payout_speed` / `target_redemption_value_usd` / `macro_risk_events`) and do **not** go through the old `assertTradeCase` validation (the old harness data lives in `data/demo-case.json` and `data/scenarios/`).
