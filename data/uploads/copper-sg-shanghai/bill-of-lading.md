# NEGOTIABLE ELECTRONIC BILL OF LADING (eBL)

> Simulated sample data for the AgentBL demo. All companies, people, vessels, document numbers and addresses below are **fictional** and do not refer to any real entity or real shipment.
> Issued as a sole electronic original on an MLETR-compliant eBL platform.

| | |
|---|---|
| **Carrier** | BlueStrait Container Lines Pte. Ltd. (SCAC: BSCL) |
| **B/L No.** | BSCL/SIN/SHA/2026/04417 |
| **B/L Type** | Negotiable — "To Order" (transferable document of title) |
| **eBL Platform** | WaveBL (MLETR / Singapore ETA 2021 compliant) |
| **eBL Token / Title Ref** | WAVE-EBL-7F3A91C4 |
| **Booking No.** | BSCL-BK-2026-118840 |
| **Service Contract** | SI-COP-2026-0091 |

---

## Parties

**Shipper / Exporter**
Strait Resources Trading Pte. Ltd.
8 Marina View, #34-01 Asia Square Tower 1, Singapore 018960
UEN: 201634789K  |  Tel: +65 6555 0148

**Consignee**
TO ORDER OF DBS BANK LTD., SINGAPORE
(Negotiable — endorsed to bearer / order per documentary credit)

**Notify Party**
Donghai Copper Materials Co., Ltd.
No. 1788 Pudong South Road, Pudong New Area, Shanghai 200122, P.R. China
USCC: 91310115MA1K9P8X2N  |  Attn: Import Dept. / Mr. Chen Weiguo

---

## Transport

| Field | Value |
|---|---|
| Vessel / Voyage | MV MARINA STAR / V.0048E |
| Carrier IMO | 9## (demo) |
| Place of Receipt | Singapore (PSA, CY) |
| Port of Loading | **Singapore (SGSIN)** |
| Port of Discharge | **Shanghai – Yangshan Deep-Water Port (CNSHG)** |
| Place of Delivery | Shanghai (CY) |
| Movement | CY / CY (FCL/FCL) |
| Shipped on Board | **2026-06-03** |
| Estimated Time of Arrival (ETA) | 2026-06-15 |
| Freight | **FREIGHT PREPAID** |

---

## Particulars Furnished by Shipper

**Marks & Numbers:** STRAIT / COPPER / CIF SHANGHAI / GRADE-A / S.O. 04417
**No. of Packages:** 200 bundles in 20 × 20' GP containers (FCL)

| Description of Goods | HS Code | Quantity | Net Weight | Gross Weight |
|---|---|---|---|---|
| Copper Cathodes — LME Grade A (Cu-CATH-1), purity ≥ 99.9935% Cu, conforming to BS EN 1978:1998. LME-registered brand "ATACAMA-SX" (demo). Full-plate cathodes, steel-strapped in bundles. | **7403.11** | 500.000 MT | 500,000 kg | 502,360 kg |

**Container & Seal Numbers (20 × 20'GP, ~25 MT each):**

```
BSLU2210041 / Seal CN8841001    BSLU2210058 / Seal CN8841002
BSLU2210063 / Seal CN8841003    BSLU2210079 / Seal CN8841004
BSLU2210084 / Seal CN8841005    BSLU2210090 / Seal CN8841006
BSLU2210107 / Seal CN8841007    BSLU2210113 / Seal CN8841008
BSLU2210128 / Seal CN8841009    BSLU2210134 / Seal CN8841010
BSLU2210149 / Seal CN8841011    BSLU2210155 / Seal CN8841012
BSLU2210160 / Seal CN8841013    BSLU2210176 / Seal CN8841014
BSLU2210181 / Seal CN8841015    BSLU2210197 / Seal CN8841016
BSLU2210202 / Seal CN8841017    BSLU2210218 / Seal CN8841018
BSLU2210223 / Seal CN8841019    BSLU2210239 / Seal CN8841020
```

**Declared Cargo Value (for carriage):** USD 6,875,000.00 (CIF Shanghai)

---

## Statements

- SHIPPED on board the above vessel in apparent good order and condition.
- Total of **1 (one) sole electronic original** Bill of Lading issued via WaveBL. Possession/control of the electronic record is governed by the platform rulebook and the Singapore Electronic Transactions Act 2021 (MLETR).
- Whoever lawfully controls this eBL controls the goods and may take delivery, endorse, transfer or pledge it.
- Particulars above (weight, marks, quantity, contents) furnished by Shipper and not checked by Carrier ("said to contain").

| | |
|---|---|
| **Place & Date of Issue** | Singapore, 2026-06-03 |
| **Signed for the Carrier** | BlueStrait Container Lines Pte. Ltd., as Carrier |
| **Document Hash (SHA-256)** | 0x9a1f4c77e2b8d063a5519e4c2f8b71d4c0a6e93f17b2da845c61f0e9b8773a2c |

---

> Note (for the team): this bill of lading matches the commercial invoice `commercial-invoice.md` and the structured case `data/cases/copper-sg-shanghai.case.json`.
> It is a document of title (To Order) that can be endorsed and transferred, which is exactly the legal basis that lets it serve as RWA collateral.
