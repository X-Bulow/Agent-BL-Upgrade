# COMMERCIAL INVOICE

> Simulated sample data for the AgentBL demo. All companies, people, document numbers and bank details are **fictional**.

**EQUATOR ENERGY TRADING PTE. LTD.**
80 Raffles Place, #45-01 UOB Plaza 1, Singapore 048624
UEN: 201789542H | Tel: +65 6555 0912 | crude@equatorenergy.example

---

| | | | |
|---|---|---|---|
| **Invoice No.** | EET-INV-2026-0091 | **Invoice Date** | 2026-06-02 |
| **Sales Contract** | EET-HANBIT-CRUDE-2026-04 (dated 2026-05-20) | **Incoterms 2020** | **CIF Ulsan** |
| **L/C No.** | SCBSG-LC-2026-771204 | **Payment Terms** | Irrevocable L/C at sight (90% provisional / 10% on final QP) |
| **B/L No.** | EET-CRUDE-2026-0091 | **Vessel / Voyage** | MT STRAIT VOYAGER / V.27 |
| **Port of Loading** | Universal Terminal, Jurong Island, Singapore | **Port of Discharge** | Ulsan, Republic of Korea |

**Seller (Beneficiary):** Equator Energy Trading Pte. Ltd., Singapore
**Buyer (Applicant):** Hanbit Refining Co., Ltd., 124 Yeocheon-ro, Nam-gu, Ulsan 44781, Republic of Korea

---

## Goods

| # | Description | HS Code | Quantity | Unit Price (CIF Ulsan) | Amount (USD) |
|---|---|---|---:|---:|---:|
| 1 | Crude Oil — Murban grade (light sweet), API 40.5°, S 0.74% wt | 2709.00 | 600,000 bbl @ 60°F | 96.50 / bbl | 57,900,000.00 |
| | | | **600,000 bbl** (78,221 MT) | | **USD 57,900,000.00** |

**Total Invoice Value: USD 57,900,000.00 (US Dollars Fifty-Seven Million Nine Hundred Thousand Only) — CIF Ulsan.**

Provisional payment under L/C (90%): **USD 52,110,000.00**. Balance on final QP pricing.

---

## Pricing Basis (Crude Oil Pricing Clauses)

```
Unit Price = Platts Dated Brent (QP mean)  +  grade differential

  • Quotational Period (QP): mean of Platts Dated Brent quotations over
    the 5 quotations from B/L date (2026-06-01) onwards (B/L month pricing).
  • Platts Dated Brent reference (as of B/L date):  USD 95.20 / bbl
  • Murban grade differential (Fujairah-loadable,
    Strait-of-Hormuz-bypass premium in current market): USD +1.30 / bbl
  • Provisional unit price:                          USD 96.50 / bbl
```

> **PROVISIONAL INVOICE.** Final price to be settled on the published QP mean of Dated Brent per contract.
> Brent is trading near USD 95/bbl (+43% y/y) amid the Strait of Hormuz conflict and falling US inventories.
> Because this cargo loads ex-Singapore storage (already past the Strait of Hormuz chokepoint), it carries a
> security-of-supply premium but remains exposed to sharp benchmark swings — elevated price volatility acknowledged.

Freight & insurance: **included (CIF)**. Marine cargo insurance at 110% of CIF value placed by Seller.

---

## Bank / Payment Instructions

| | |
|---|---|
| Beneficiary | Equator Energy Trading Pte. Ltd. |
| Bank | Standard Chartered Bank (Singapore) Ltd., 8 Marina Boulevard, Singapore 018981 |
| SWIFT | SCBLSG22 |
| Account (USD) | 01-0xxxxxx-02 (demo) |

For and on behalf of **Equator Energy Trading Pte. Ltd.**
Authorized Signatory: R. Menon (Head of Crude Trading)

---

> Transaction price = **USD 57,900,000.00 CIF Ulsan** (600,000 bbl × 96.50 USD/bbl).
> Note that the unit is the "barrel" and the pricing benchmark is Dated Brent + a differential, unlike copper's LME + regional premium mechanism — the AI valuation tool has to switch market data sources and convert units (barrels ↔ tonnes) by commodity.
