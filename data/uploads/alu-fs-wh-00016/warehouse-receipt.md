# Electronic Warehouse Receipt

> Simulated sample data (fictional) — SouthMet Foshan × Guangxi Junda Supply Chain Management Co., Ltd. aluminum ingot spot purchase.
> Issued as a digital warehouse receipt on the ENI platform, supporting title confirmation, transfer and pledge financing.

| | |
|---|---|
| **Receipt Type** | Electronic Warehouse Receipt (EWR) |
| **Receipt No.** | EWR-2025-FS-AL0-CG-00016 |
| **Issuing Platform** | AgentBL ENI (digital warehouse receipt) |
| **Token / Title Ref** | ENI-EWR-AL0-00016-XXXX |
| **Inbound Receipt No.** | WH-FS-00016 |
| **Issue Date** | 2025-01-20 |

---

## Title Holders

**Transferor (Shipper / owner of the goods when the receipt was issued)**
Guangxi Junda Supply Chain Management Co., Ltd.
(fictional address)

**Transferee (Consignee / receipt transferee)**
SouthMet International Trade Co., Ltd.
Nanhai District, Foshan, Guangdong Province (fictional address)

---

## Storage Details

| Field | Value |
|---|---|
| Delivery Warehouse | Nanhai, Foshan Designated Non-Ferrous Metals Delivery Warehouse |
| Warehouse Address | Nanhai District, Foshan, Guangdong Province (fictional address) |
| Inbound Date | 2025-01-20 |
| Delivery Method | In-warehouse handover |
| Pickup Valid Until | 2025-02-19 |

---

## Goods Description

**Marks:** JINYUAN / AL99.70 / P1020 / Foshan warehouse delivery / Contract No. 2025-FS-AL0-CG-00016

| Description | HS Code | Quantity | Net Weight | Brand |
|---|---|---|---|---|
| AL99.70 / P1020 grade, GB/T 1196-2017 | 7601.10 | 162.276 MT | 162276 kg | Southwest Aluminum / Jinyuan Aluminum (mainstream domestic brands) |

**Storage Form:** bulk warehouse storage, stacked by batch

**Declared Value (receipt value):** CNY ¥3,291,768.66

---

## Statements

- The goods above have been fully received into storage; their quantity/appearance was jointly inspected and confirmed by the warehouse and the cargo owner.
- This receipt is an **ENI platform electronic warehouse receipt**; its ownership is recorded on-chain and it supports transfer and pledge.
- Whoever lawfully holds this electronic warehouse receipt has the right to take delivery of / dispose of the corresponding goods in the warehouse.
- Weight, brand marks, content, etc. are declared by the cargo owner; the warehouse is responsible only for quantity/appearance.

| | |
|---|---|
| **Place & Date of Issue** | Foshan, Guangdong Province, 2025-01-20 |
| **Issued By** | Foshan Nanhai Zhengyuan Warehousing & Logistics Co., Ltd. (warehouse seal) |
| **Document Hash (SHA-256)** | 0x84874618de792fc74621d04cd58fbbec8298646957ac1075234b69f4be6ffe1e |

---

> Note (for the team): this receipt matches the invoice and the structured case `data/cases/alu-fs-wh-00016.case.json`.
> On-chain transfer of receipt ownership is the core of RWA inventory-backed financing.
