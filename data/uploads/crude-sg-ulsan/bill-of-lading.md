# NEGOTIABLE ELECTRONIC BILL OF LADING (TANKER eBL)

> Simulated sample data for the AgentBL demo. All companies, people, vessels, document numbers, terminals and addresses are **fictional** and do not refer to any real shipment.
> Issued as a sole electronic original on an MLETR-compliant eBL platform.

| | |
|---|---|
| **Carrier / Shipowner** | Meridian Tankers Ltd. (on behalf of Master, MT Strait Voyager) |
| **B/L No.** | EET-CRUDE-2026-0091 |
| **B/L Type** | Negotiable — "To Order" (transferable document of title) |
| **eBL Platform** | essDOCS CargoDocs / TradeTrust (UK ETDA 2023 + MLETR) |
| **eBL Title Ref** | TT-EBL-CRUDE-0091-AE73 |
| **Charter Party** | Voyage C/P dated 2026-05-22 (ASBATANKVOY form) |

---

## Parties

**Shipper / Exporter**
Equator Energy Trading Pte. Ltd.
80 Raffles Place, #45-01 UOB Plaza 1, Singapore 048624
UEN: 201789542H | Tel: +65 6555 0912

**Consignee**
TO ORDER OF STANDARD CHARTERED BANK (SINGAPORE) LTD.
(Negotiable — endorsed per documentary credit)

**Notify Party**
Hanbit Refining Co., Ltd.
124 Yeocheon-ro, Nam-gu, Ulsan 44781, Republic of Korea
Attn: Crude Procurement / Mr. Park Jae-won | BRN: 610-81-#### (demo)

---

## Transport

| Field | Value |
|---|---|
| Vessel | MT STRAIT VOYAGER (Aframax crude tanker) |
| Voyage No. | V.27 |
| Place / Terminal of Loading | **Universal Terminal, Jurong Island, Singapore (SGSIN)** |
| Port of Discharge | **Ulsan, Republic of Korea (KRUSN)** |
| Loaded on Board (B/L date) | **2026-06-01** |
| Estimated Time of Arrival (ETA) | 2026-06-13 |
| Freight | Payable as per Charter Party (FREIGHT PREPAID, CIF) |

---

## Description of Cargo (in bulk, ex shore tank)

| Description | HS Code | Quantity |
|---|---|---|
| **Crude Oil — Murban grade** (light sweet). Shipped in bulk via Universal Terminal shore tanks (transshipment / re-export by Seller). | **2709.00** | **600,000 net US barrels @ 60°F** |

**Quality / Quantity Particulars (per independent inspector — SGS, demo):**

| Parameter | Value |
|---|---|
| Gross Standard Volume | 600,000 bbl @ 60°F |
| Metric Tonnes (in air) | 78,221.000 MT |
| API Gravity @ 60°F | 40.5° |
| Density @ 15°C | 0.8200 t/m³ |
| Sulphur content | 0.74 % wt |
| BS&W | 0.05 % |
| Ullage / temperature | recorded per shore & ship figures |

**Declared Cargo Value (for carriage):** USD 57,900,000.00 (CIF Ulsan)

---

## Statements

- SHIPPED in apparent good order and condition the bulk crude oil described above.
- Total of **1 (one) sole electronic original** Bill of Lading issued electronically; paper originals: NIL.
- Whoever lawfully controls this eBL controls the goods and may take delivery, endorse, transfer or pledge it.
- Quantity/quality "said to be" per shore tank and independent inspector figures; weight and measure unknown to Carrier.
- Weight, gauge, quality, quantity, condition, contents and value unknown to Carrier.

| | |
|---|---|
| **Place & Date of Issue** | Singapore, 2026-06-01 |
| **Signed for the Carrier** | Master, MT Strait Voyager / Meridian Tankers Ltd. as agents |
| **Document Hash (SHA-256)** | 0x2d77a0c41f6b9e85530a1c4e7f92b6d8430ea15c9b7d206e84f1c3a05e9b6712 |

---

> Note (for the team): this matches the commercial invoice `commercial-invoice.md` and the structured case `data/cases/crude-sg-ulsan.case.json`.
> A tanker bill of lading measures in "barrels" and defines quality by API gravity / sulphur content, and its pricing benchmark is Platts Dated Brent + a differential — completely different from copper's LME pricing mechanism. This shows exactly why the AI valuation tool has to adapt to different commodity classes.
