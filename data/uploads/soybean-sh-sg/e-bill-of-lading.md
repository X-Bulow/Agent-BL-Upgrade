# Electronic Bill of Lading (eBL)

> Simulated sample data for the AgentBL demo. All companies, people, vessels and document numbers below are **fictional**.
> Issued as a sole electronic original on the TradeGo platform (MLETR-compliant).

| | |
|---|---|
| **eBL Number** | TG-EBL-2026-0001 |
| **Platform** | **TradeGo** (MLETR-compliant eBL platform) |
| **B/L Type** | Negotiable — "To Order" (negotiable document of title) |
| **Booking No.** | BK-2026-001 |
| **eBL Status** | **IN TRANSIT** |
| **Current Controller** | HSBC Hong Kong (Pledgee) |

---

## Parties

**Shipper / Exporter**
Beijing Agricultural Trading Co., Ltd.
88 Jianguo Road, Chaoyang District, Beijing, China

**Consignee**
TO ORDER OF HSBC HONG KONG
(Negotiable — endorsed to the order of HSBC Hong Kong per L/C terms)

**Notify Party**
Singapore Food Processing Pte. Ltd.
80 Robinson Road, Singapore 068898
Attn: Import Dept.

---

## Transport

| Field | Value |
|---|---|
| Vessel / Voyage | MV PACIFIC HORIZON / PH2605 |
| Carrier | Ocean Star Shipping Ltd. |
| Place of Receipt | Shanghai, China |
| Port of Loading | **Shanghai, China (CNSHA)** |
| Port of Discharge | **Singapore (SGSIN)** |
| Place of Delivery | Singapore |
| Movement | Bulk Carrier (Single Deck) |
| Shipped on Board | **18 May 2026** |
| Estimated Time of Arrival (ETA) | 24 May 2026 |
| Freight | **FREIGHT PREPAID** (USD 95,000 — BK-2026-001) |

---

## Particulars Furnished by Shipper

**Marks:** BATC / NON-GMO SOYBEANS / GRADE NO.1 / CIF SINGAPORE / SC-2026-001

| Description of Goods | HS Code | Quantity | Net Weight | Gross Weight |
|---|---|---|---|---|
| Non-GMO Soybeans, Grade No.1, Protein ≥ 38%, Moisture ≤ 13.5%. Origin: Heilongjiang Province, China. Bulk cargo stowed in 4 holds. | **1201.90** | 5,000.000 MT | 5,000,000 kg | 5,050,000 kg |

**Declared Cargo Value (for carriage):** USD 2,600,000.00 (CIF Singapore)

---

## Transfer History (eBL Title Chain)

```
18 May 2026  Carrier → Beijing Agricultural Trading Co., Ltd.           [Issued]
19 May 2026  Beijing Agricultural Trading Co., Ltd. → HSBC Hong Kong    [Pledged under TF-2026-001]
```

---

## Statements

- SHIPPED on board in apparent good order and condition.
- Total of **1 (one) sole electronic original** eBL issued via TradeGo platform.
- Possession/control of the electronic record is governed by the TradeGo rulebook and applicable MLETR law.
- Whoever lawfully controls this eBL controls the goods and may take delivery, endorse, transfer or pledge it.
- Particulars above (weight, quantity, contents) furnished by Shipper and not checked by Carrier ("said to contain").

| | |
|---|---|
| **Place & Date of Issue** | Shanghai, China — 18 May 2026 |
| **Signed for the Carrier** | Ocean Star Shipping Ltd. |
| **Electronic Signature Hash** | 0x7A34B98F6C91E2A5B4D71EAA3298C1F |

---

> Note (for the team): this eBL matches the structured case `data/cases/soybean-sh-sg.case.json`.
> As a document of title (To Order of HSBC Hong Kong) it can be endorsed and transferred — this is the legal basis for using it as RWA collateral.
> The TradeGo platform is MLETR-compliant and supports the full eBL lifecycle: issuance, transfer, pledge and document presentation.
