# Electronic Warehouse Receipt

> Simulated sample data (fictional) — SouthMet Foshan × Shanghai Jinyuan aluminum ingot spot purchase.
> Issued as a digital warehouse receipt on the ENI platform, supporting title confirmation, transfer and pledge financing.
> The companies, document numbers and warehouse details below are simulated fictional data, for demo purposes only.

| | |
|---|---|
| **Receipt Type** | Electronic Warehouse Receipt (EWR) |
| **Receipt No.** | EWR-2026-FS-AL0-00015 |
| **Issuing Platform** | AgentBL ENI (digital warehouse receipt) |
| **Token / Title Ref** | ENI-EWR-AL0-00015-8A2F |
| **Inbound Receipt No.** | WH-FS-2026-05001 |
| **Issue Date** | 2026-05-20 |

---

## Title Holders

**Transferor (Shipper / owner of the goods when the receipt was issued)**
Shanghai Jinyuan International Trade Co., Ltd.
100 Century Avenue, Pudong New Area, Shanghai
Unified Social Credit Code: 91310000MA1K5XXXXX

**Transferee (Consignee / receipt transferee)**
SouthMet International Trade Co., Ltd.
Dali Town, Nanhai District, Foshan, Guangdong Province
Unified Social Credit Code: 91440600MA4UXXXXX

---

## Storage Details

| Field | Value |
|---|---|
| Delivery Warehouse | Nanhai, Foshan Designated Non-Ferrous Metals Delivery Warehouse |
| Warehouse Address | Dali Town, Nanhai District, Foshan, Guangdong Province |
| Inbound Date | 2026-05-20 |
| Delivery Method | In-warehouse delivery (EXW warehouse) |
| Pickup Valid Until | 2026-06-20 |

---

## Goods Description

**Marks:** JINYUAN / AL99.70 / P1020 / Foshan warehouse delivery / Contract No. 2026-FS-AL0-CG-00015

| Description | HS Code | Quantity | Net Weight | Brand |
|---|---|---|---|---|
| Aluminum ingot AL99.70 (for remelting), P1020 grade, GB/T 1196-2017 | **7601.10** | 443.385 MT | 443,385 kg | Yunnan Aluminum / Jinyuan Aluminum (mainstream domestic brands) |

**Storage Form:** bulk warehouse storage, stacked by batch

**Declared Value (receipt value):** CNY ¥10,730,000.00 (Ten Million Seven Hundred Thirty Thousand Yuan Only)

---

## Statements

- The goods above have been fully received into storage; their quantity/appearance was jointly inspected and confirmed by the warehouse and the cargo owner.
- This receipt is an **ENI platform electronic warehouse receipt**; its ownership is recorded on-chain and it supports transfer and pledge.
- Whoever lawfully holds this electronic warehouse receipt has the right to take delivery of / dispose of the corresponding goods in the warehouse.
- Weight, brand marks, content, etc. are declared by the cargo owner; the warehouse is responsible only for quantity/appearance.

| | |
|---|---|
| **Place & Date of Issue** | Foshan, Guangdong Province, 2026-05-20 |
| **Issued By** | Foshan Nanhai Zhengyuan Warehousing & Logistics Co., Ltd. (warehouse seal) |
| **Document Hash (SHA-256)** | 0x3c7a1f8e5d2b9406a7c3e1f5d8b2a4c6e8f0a2b4d6e8f0a1b3c5d7e9f1a3b5c7d |

---

> Note (for the team): this receipt matches the invoice `commercial-invoice.md` and the structured case `data/cases/alu-fs-wh-00015.case.json`.
> On-chain transfer of receipt ownership is the core of RWA inventory-backed financing — on-chain title confirmation + off-chain physical supervision provide double protection.
