// Batch-generates eBL data files for aluminum ingot spot purchase contracts
// Data source: list of signed contracts exported from a corporate procurement system
// All company names and personal names have been desensitized into fictional names

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ====== Fictional name mapping ======
// Buyer: Chalco Foshan → SouthMet International Trade Co., Ltd.
// Every supplier has been replaced with a fictional name

const CONTRACTS = [
  {
    slug: 'alu-fs-wh-00017',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00017',
    contract_no: '2025-FS-AL0-CG-00017',
    contract_name: 'Aluminum Ingot Spot Purchase-Xinyuan-1.22',
    supplier: 'Guangxi Xinyuan Trading Co., Ltd.',
    amount_cny: 2787066.90,
    quantity_mt: 137.565,
    unit_price_cny: 20262,
    payment: 'Cash against goods',
    delivery: 'In-warehouse handover',
    trade_mode: 'Cash against goods',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-22',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18300,
    lme_ref: 2180,
    shfe_ref: 19980,
    smm_ref: 20180,
    premium: 82
  },
  {
    slug: 'alu-fs-wh-00016',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00016',
    contract_no: '2025-FS-AL0-CG-00016',
    contract_name: 'Aluminum Ingot Spot Purchase-Junda-1.20',
    supplier: 'Guangxi Junda Supply Chain Management Co., Ltd.',
    amount_cny: 3291768.66,
    quantity_mt: 162.276,
    unit_price_cny: 20285,
    payment: 'Cash against goods',
    delivery: 'In-warehouse handover',
    trade_mode: 'Cash against goods',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-20',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18350,
    lme_ref: 2190,
    shfe_ref: 20000,
    smm_ref: 20200,
    premium: 85
  },
  {
    slug: 'alu-fs-wh-00015b',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00015B',
    contract_no: '2025-FS-ALX-CG-00015',
    contract_name: 'Aluminum Alloy Ingot Spot Purchase-Ruidatong-1.17',
    supplier: 'Ruidatong Metals (Guangdong) Co., Ltd.',
    amount_cny: 1343100.00,
    quantity_mt: 66.000,
    unit_price_cny: 20350,
    payment: 'Payment after delivery',
    delivery: 'Self-pickup',
    trade_mode: 'Payment after delivery',
    incoterms: "EXW supplier's warehouse (self-pickup)",
    sign_date: '2025-01-17',
    commodity: 'Aluminum Alloy Ingot',
    commodity_grade: 'ADC12 / A380 grade, aluminum alloy ingot',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18500,
    lme_ref: 2195,
    shfe_ref: 20100,
    smm_ref: 20260,
    premium: 90,
    note: 'Aluminum alloy ingot (ADC12), unlike pure aluminum ingot P1020. Used in the die-casting industry, so it carries a higher premium than standard aluminum ingot.'
  },
  {
    slug: 'alu-fs-wh-00013b',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00013B',
    contract_no: '2025-FS-AL0-CG-00013',
    contract_name: 'Aluminum Ingot Spot Purchase-Tongxin-1.15',
    supplier: 'Xiamen Tongxin Industrial Co., Ltd.',
    amount_cny: 2242200.54,
    quantity_mt: 112.054,
    unit_price_cny: 20010,
    payment: 'Cash against goods',
    delivery: 'In-warehouse handover',
    trade_mode: 'Cash against goods',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-15',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18100,
    lme_ref: 2170,
    shfe_ref: 19850,
    smm_ref: 19930,
    premium: 80
  },
  {
    slug: 'alu-fs-wh-00012',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00012',
    contract_no: '2025-FS-AL0-CG-00012',
    contract_name: 'Aluminum Ingot Spot Purchase-Xinda-1.14',
    supplier: 'Xinda Metals Ningbo Energy Co., Ltd.',
    amount_cny: 5627512.15,
    quantity_mt: 279.281,
    unit_price_cny: 20150,
    payment: 'Cash against goods',
    delivery: 'In-warehouse handover',
    trade_mode: 'Cash against goods',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-14',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18250,
    lme_ref: 2185,
    shfe_ref: 19950,
    smm_ref: 20070,
    premium: 80,
    note: 'Largest single contract in this batch: 279 MT / ¥5.63 million. The supplier is a subsidiary of a central state-owned enterprise with excellent credit standing.'
  },
  {
    slug: 'alu-fs-wh-00011',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00011',
    contract_no: '2025-FS-AL0-CG-00011',
    contract_name: 'Aluminum Ingot Spot Purchase-Xingtai-1.14',
    supplier: 'Guangdong Xingtai Investment Co., Ltd.',
    amount_cny: 1690746.20,
    quantity_mt: 83.908,
    unit_price_cny: 20150,
    payment: 'Payment after delivery',
    delivery: 'In-warehouse handover',
    trade_mode: 'Payment after delivery',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-14',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18250,
    lme_ref: 2185,
    shfe_ref: 19950,
    smm_ref: 20070,
    premium: 80
  },
  {
    slug: 'alu-fs-wh-00010',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00010',
    contract_no: '2025-FS-AL0-CG-00010',
    contract_name: 'Aluminum Ingot Spot Purchase-Hongchang-1.13',
    supplier: 'Guangzhou Hongchang Metal Materials Co., Ltd.',
    amount_cny: 4362624.00,
    quantity_mt: 216.400,
    unit_price_cny: 20160,
    payment: 'Payment after delivery',
    delivery: 'In-warehouse handover',
    trade_mode: 'Payment after delivery',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-13',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18260,
    lme_ref: 2190,
    shfe_ref: 19960,
    smm_ref: 20080,
    premium: 80
  },
  {
    slug: 'alu-fs-wh-00009',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00009',
    contract_no: '2025-FS-AL0-CG-00009',
    contract_name: 'Aluminum Ingot Spot Purchase-Tongxin-1.13',
    supplier: 'Xiamen Tongxin Industrial Co., Ltd.',
    amount_cny: 1712574.19,
    quantity_mt: 84.907,
    unit_price_cny: 20170,
    payment: 'Cash against goods',
    delivery: 'In-warehouse handover',
    trade_mode: 'Cash against goods',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-13',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18270,
    lme_ref: 2190,
    shfe_ref: 19970,
    smm_ref: 20090,
    premium: 80
  },
  {
    slug: 'alu-fs-wh-00008',
    case_id: 'CASE-EWR-2025-ALU-FS-WH-00008',
    contract_no: '2025-FS-AL0-CG-00008',
    contract_name: 'Aluminum Ingot Spot Purchase-Xingtai-1.13',
    supplier: 'Guangdong Xingtai Investment Co., Ltd.',
    amount_cny: 2272029.48,
    quantity_mt: 112.644,
    unit_price_cny: 20170,
    payment: 'Payment after delivery',
    delivery: 'In-warehouse handover',
    trade_mode: 'Payment after delivery',
    incoterms: 'EXW Foshan warehouse',
    sign_date: '2025-01-13',
    commodity: 'Aluminum Ingot',
    commodity_grade: 'AL99.70 / P1020 grade',
    salesperson: 'Zhou Mingyuan',
    dept: 'Trading Division',
    cost_basis: 18270,
    lme_ref: 2190,
    shfe_ref: 19970,
    smm_ref: 20090,
    premium: 80
  }
];

const USD_RATE = 7.25;

const CASH_AGAINST_GOODS = 'Cash against goods';
const PAYMENT_AFTER_DELIVERY = 'Payment after delivery';

function usd(cny) {
  return Math.round(cny / USD_RATE);
}

function hash(str) {
  return '0x' + crypto.createHash('sha256').update(str).digest('hex');
}

// Amount in CNY expressed in millions, rounded to the nearest 10,000 CNY (e.g. 1,950,000 -> "1.95 million").
function cnyMillions(cny) {
  return `${Math.round(cny / 10000) / 100} million`;
}

function buildCase(c) {
  const declared_usd = usd(c.amount_cny);
  const unit_usd = Math.round(c.unit_price_cny / USD_RATE);
  const cost_usd = Math.round(c.cost_basis / USD_RATE);
  const cost_total_cny = Math.round(c.cost_basis * c.quantity_mt);
  const cost_total_usd = usd(cost_total_cny);
  const profit_cny = Math.round(c.amount_cny - cost_total_cny);
  const profit_usd = usd(profit_cny);
  const margin = profit_cny / c.amount_cny;
  const ltv = c.payment === PAYMENT_AFTER_DELIVERY ? 0.60 : 0.70;
  const requested_cny = Math.round(c.amount_cny * ltv);
  const requested_usd = usd(requested_cny);
  const payout = c.payment === PAYMENT_AFTER_DELIVERY ? 'BALANCED' : 'FAST';
  const lme_usd = c.lme_ref;
  const smm_cny = c.smm_ref;
  const vat = Math.round(c.amount_cny * 0.13);

  const noteParts = [`${c.supplier} production cost ~${c.cost_basis.toLocaleString('en-US')} CNY/MT.`];
  if (c.note) noteParts.push(c.note);
  noteParts.push(`Selling price ${c.unit_price_cny.toLocaleString('en-US')} CNY/MT, gross margin about ${(margin * 100).toFixed(1)}%.`);

  return {
    case_id: c.case_id,
    model: 'ai-dynamic-pricing-rwa-v0.2',
    note: `Simulated sample data (fictional): SouthMet Foshan × ${c.supplier} aluminum ingot spot purchase ${c.contract_no}. Amounts converted to USD at a rate of ~${USD_RATE}.` + (c.note ? ` ${c.note}` : ''),
    uploaded_documents: {
      warehouse_receipt_file: `data/uploads/${c.slug}/warehouse-receipt.md`,
      commercial_invoice_file: `data/uploads/${c.slug}/commercial-invoice.md`
    },
    bill_of_lading: {
      bl_id: `EWR-${c.contract_no.replace(/\//g, '-')}`,
      bl_no: `FS/WH/AL0/${c.contract_no.split('-').pop()}`,
      bl_type: 'electronic_warehouse_receipt',
      ebl_platform: 'AgentBL ENI (digital warehouse receipt)',
      ebl_title_ref: `ENI-EWR-AL0-${c.contract_no.split('-').pop()}-${Math.random().toString(16).slice(2,6).toUpperCase()}`,
      shipper: c.supplier,
      consignee: 'SouthMet International Trade Co., Ltd.',
      notify_party: 'SouthMet International Trade Co., Ltd., Nanhai District, Foshan, Guangdong Province',
      carrier: 'Foshan Nanhai Zhengyuan Warehousing & Logistics Co., Ltd. (designated delivery warehouse)',
      vessel: 'N/A (in-warehouse delivery)',
      voyage_no: 'N/A',
      port_of_loading: `Nanhai, Foshan designated warehouse (inbound receipt no. WH-FS-${c.contract_no.split('-').pop()})`,
      port_of_discharge: `Nanhai, Foshan designated warehouse (outbound receipt no. WH-FS-${c.contract_no.split('-').pop()})`,
      incoterms: c.incoterms,
      cargo: c.commodity_grade,
      quantity_mt: c.quantity_mt,
      containers: 'N/A (bulk warehouse storage)',
      declared_value_usd: declared_usd,
      issue_date: c.sign_date,
      shipped_on_board: c.sign_date,
      eta: c.sign_date,
      document_hash: hash(`EWR-${c.contract_no}`)
    },
    commercial_invoice: {
      invoice_no: `JY-AL0-INV-${c.contract_no.split('-').pop()}`,
      invoice_date: c.sign_date,
      sales_contract: c.contract_no,
      incoterms: c.incoterms,
      payment_terms: c.payment === CASH_AGAINST_GOODS ? 'Cash against goods (T/T wire transfer)' : 'Payment after delivery (within 7 business days of acceptance)',
      pricing_basis: 'SMM Foshan aluminum ingot spot price + South China premium/discount',
      smm_reference_price_cny_per_mt: c.smm_ref,
      regional_premium_cny_per_mt: c.premium,
      unit_price_cny_per_mt: c.unit_price_cny,
      unit_price_usd_per_mt: unit_usd,
      quantity_mt: c.quantity_mt,
      total_amount_cny: c.amount_cny,
      total_amount_usd: declared_usd,
      currency: 'CNY',
      is_provisional: false,
      vat_rate_pct: 13,
      vat_amount_cny: vat
    },
    cargo: {
      commodity: c.commodity,
      grade: `${c.commodity_grade}, GB/T 1196-2017`,
      hs_code: c.commodity.includes('Alloy') ? '760120' : '760110',
      quantity: c.quantity_mt,
      unit: 'MT',
      brand: 'Southwest Aluminum / Jinyuan Aluminum (mainstream domestic brands)',
      warehouse: 'Nanhai, Foshan Designated Non-Ferrous Metals Delivery Warehouse'
    },
    insurance: {
      provider: 'PICC Property and Casualty, Foshan Branch (PICC Foshan)',
      policy_type: 'Domestic cargo insurance + warehouse-to-warehouse clause',
      coverage_ratio: 1.0,
      insured_value_cny: c.amount_cny,
      insured_value_usd: declared_usd,
      expires_at: '2025-03-31',
      policy_hash: hash(`insurance-${c.contract_no}`)
    },
    trade_economics: {
      cost_basis_cny_per_mt: c.cost_basis,
      cost_basis_usd_per_mt: cost_usd,
      cost_of_goods_cny: cost_total_cny,
      cost_of_goods_usd: cost_total_usd,
      expected_gross_profit_cny: profit_cny,
      expected_gross_profit_usd: profit_usd,
      gross_margin_pct: parseFloat(margin.toFixed(4)),
      note: noteParts.join(' ')
    },
    financing: {
      requested_cash_cny: requested_cny,
      requested_cash_usd: requested_usd,
      payout_speed: payout,
      target_redemption_value_usd: 1,
      redemption_coverage_limit: 0.9,
      max_ltv: ltv,
      currency: 'USDC',
      note: `Warehouse receipt pledge financing, initial LTV ${(ltv*100).toFixed(0)}%. ${c.payment === PAYMENT_AFTER_DELIVERY ? 'The supplier delivers before being paid, so the buyer faces less financing pressure; LTV is set conservatively.' : 'Cash-against-goods model; about CNY ' + cnyMillions(requested_cny) + ' worth of USDC is advanced against the spot value.'}`
    },
    market: {
      commodity: c.commodity.includes('Alloy') ? 'Aluminum Alloy' : 'Aluminum',
      benchmark: 'SMM Foshan aluminum ingot spot price (A00 aluminum)',
      price_unit: 'CNY/MT',
      reference_price_cny_per_mt: c.smm_ref,
      reference_price_usd_per_mt: Math.round(c.smm_ref / USD_RATE),
      regional_premium_cny_per_mt: c.premium,
      landed_price_cny_per_mt: c.unit_price_cny,
      landed_price_usd_per_mt: unit_usd,
      lme_aluminium_cash_usd_per_mt: c.lme_ref,
      shfe_aluminium_cny_per_mt: c.shfe_ref,
      as_of: c.sign_date,
      source: 'SMM / LME / SHFE market data, January 2025'
    },
    shipment_events: [
      {
        date: c.sign_date,
        type: 'warehouse_receipt_issued',
        description: `${c.quantity_mt} MT of ${c.commodity_grade} fully received into storage; the Nanhai, Foshan designated warehouse issued an electronic warehouse receipt.`,
        severity: 'info'
      },
      {
        date: c.sign_date,
        type: 'ownership_transfer',
        description: `Buyer and seller completed settlement (${c.payment.toLowerCase()}); ownership of the warehouse receipt transferred from ${c.supplier} to SouthMet Foshan.`,
        severity: 'info'
      }
    ],
    macro_risk_events: [
      {
        date: c.sign_date,
        type: 'domestic_aluminum_market',
        region: 'China / South China',
        severity: 'medium',
        description: 'In January 2025, social inventories of aluminum ingot in Foshan stood at about 220,000 MT, a neutral level for the year. Downstream pre-Spring Festival stocking demand was moderate, and the South China spot premium held steady at 60-90 CNY/MT.'
      },
      {
        date: c.sign_date,
        type: 'seasonal_demand',
        region: 'China',
        severity: 'low',
        description: 'With the Spring Festival holiday approaching, downstream processors are gradually halting production for the break, slowing the pace of spot purchases. Demand is expected to recover once work resumes after the holiday.'
      }
    ]
  };
}

function buildWarehouseReceipt(c) {
  return `# Electronic Warehouse Receipt

> Simulated sample data (fictional) — SouthMet Foshan × ${c.supplier} aluminum ingot spot purchase.
> Issued as a digital warehouse receipt on the ENI platform, supporting title confirmation, transfer and pledge financing.

| | |
|---|---|
| **Receipt Type** | Electronic Warehouse Receipt (EWR) |
| **Receipt No.** | EWR-${c.contract_no.replace(/\//g, '-')} |
| **Issuing Platform** | AgentBL ENI (digital warehouse receipt) |
| **Token / Title Ref** | ENI-EWR-AL0-${c.contract_no.split('-').pop()}-XXXX |
| **Inbound Receipt No.** | WH-FS-${c.contract_no.split('-').pop()} |
| **Issue Date** | ${c.sign_date} |

---

## Title Holders

**Transferor (Shipper / owner of the goods when the receipt was issued)**
${c.supplier}
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
| Inbound Date | ${c.sign_date} |
| Delivery Method | ${c.delivery} |
| Pickup Valid Until | ${new Date(new Date(c.sign_date).getTime() + 30*86400000).toISOString().slice(0,10)} |

---

## Goods Description

**Marks:** JINYUAN / AL99.70 / P1020 / Foshan warehouse delivery / Contract No. ${c.contract_no}

| Description | HS Code | Quantity | Net Weight | Brand |
|---|---|---|---|---|
| ${c.commodity_grade}, GB/T 1196-2017 | ${c.commodity.includes('Alloy') ? '7601.20' : '7601.10'} | ${c.quantity_mt.toFixed(3)} MT | ${(c.quantity_mt * 1000).toFixed(0)} kg | Southwest Aluminum / Jinyuan Aluminum (mainstream domestic brands) |

**Storage Form:** bulk warehouse storage, stacked by batch

**Declared Value (receipt value):** CNY ¥${c.amount_cny.toLocaleString('en-US', {minimumFractionDigits: 2})}

---

## Statements

- The goods above have been fully received into storage; their quantity/appearance was jointly inspected and confirmed by the warehouse and the cargo owner.
- This receipt is an **ENI platform electronic warehouse receipt**; its ownership is recorded on-chain and it supports transfer and pledge.
- Whoever lawfully holds this electronic warehouse receipt has the right to take delivery of / dispose of the corresponding goods in the warehouse.
- Weight, brand marks, content, etc. are declared by the cargo owner; the warehouse is responsible only for quantity/appearance.

| | |
|---|---|
| **Place & Date of Issue** | Foshan, Guangdong Province, ${c.sign_date} |
| **Issued By** | Foshan Nanhai Zhengyuan Warehousing & Logistics Co., Ltd. (warehouse seal) |
| **Document Hash (SHA-256)** | ${hash('WR-' + c.contract_no)} |

---

> Note (for the team): this receipt matches the invoice and the structured case \`data/cases/${c.slug}.case.json\`.
> On-chain transfer of receipt ownership is the core of RWA inventory-backed financing.
`;
}

function buildCommercialInvoice(c) {
  return `# Commercial Invoice

> Simulated sample data (fictional) — SouthMet Foshan × ${c.supplier} aluminum ingot spot purchase.

**${c.supplier}**
(fictional address)
Unified Social Credit Code: XXXXXXXXXXXXXX | Tel: XXXX-XXXXXXXX

---

| | | | |
|---|---|---|---|
| **Invoice No.** | JY-AL0-INV-${c.contract_no.split('-').pop()} | **Invoice Date** | ${c.sign_date} |
| **Sales Contract** | ${c.contract_no} | **Incoterms 2020** | **${c.incoterms}** |
| **Payment Method** | ${c.payment === CASH_AGAINST_GOODS ? 'Cash against goods (T/T wire transfer)' : 'Payment after delivery (7 business days after acceptance)'} | **Payment Due** | ${c.payment === CASH_AGAINST_GOODS ? 'Goods released upon receipt of payment' : 'Within 7 business days after the goods arrive and pass acceptance'} |
| **Warehouse Receipt No.** | EWR-${c.contract_no.replace(/\//g, '-')} | **Inbound Receipt No.** | WH-FS-${c.contract_no.split('-').pop()} |
| **Delivery Warehouse** | Nanhai, Foshan Designated Non-Ferrous Metals Delivery Warehouse | **VAT Rate** | 13% |

**Seller:** ${c.supplier}
**Buyer:** SouthMet International Trade Co., Ltd., Nanhai District, Foshan, Guangdong Province

---

## Goods Description

| # | Description | HS Code | Quantity | Unit Price (VAT incl., ${c.incoterms.split(' ')[0]}) | Amount (CNY, VAT incl.) |
|---|---|---|---:|---:|---:|
| 1 | ${c.commodity_grade}, GB/T 1196-2017. Brand: Southwest Aluminum / Jinyuan Aluminum. | ${c.commodity.includes('Alloy') ? '7601.20' : '7601.10'} | ${c.quantity_mt.toFixed(3)} MT | ¥${c.unit_price_cny.toLocaleString('en-US')} / MT | ¥${c.amount_cny.toLocaleString('en-US', {minimumFractionDigits: 2})} |
| | | | **${c.quantity_mt.toFixed(3)} MT** | | **¥${c.amount_cny.toLocaleString('en-US', {minimumFractionDigits: 2})}** |

**Invoice Total (VAT incl.): CNY ¥${c.amount_cny.toLocaleString('en-US', {minimumFractionDigits: 2})} — ${c.incoterms.split(' ')[0]}.**

Amount excl. VAT: ¥${(c.amount_cny / 1.13).toLocaleString('en-US', {minimumFractionDigits: 2})}  |  VAT (13%): ¥${(c.amount_cny * 0.13 / 1.13).toLocaleString('en-US', {minimumFractionDigits: 2})}

---

## Pricing Basis

\`\`\`
Unit price = SMM Foshan A00 aluminum ingot spot price + South China regional premium/discount

  • SMM A00 aluminum ingot Foshan spot reference price (${c.sign_date}): ¥${c.smm_ref.toLocaleString('en-US')}.00 / MT
  • South China regional brand premium/discount:                     ¥    ${c.premium}.00 / MT
  • Contract fixed unit price:                                       ¥${c.unit_price_cny.toLocaleString('en-US')}.00 / MT
\`\`\`

> **Spot fixed-price contract.** No provisional price / QP adjustment mechanism. The price is locked on the signing date, and settlement is based on the weight accepted at warehouse intake.

---

## Settlement Details

| | |
|---|---|
| Payee | ${c.supplier} |
| Bank | Industrial and Commercial Bank of China (fictional branch) |
| SWIFT | ICBKCNBJXXX |
| Account No. (CNY) | XXXX-XXXX-XXXX-XXXX |

We hereby certify that this invoice is true and correct, and that the origin, quality and quantity of the goods listed are as stated above.

For and on behalf of **${c.supplier}**
Authorized Signatory: Mr. Li (Trading Department Manager)

---

> Contract transaction price = **¥${c.amount_cny.toLocaleString('en-US', {minimumFractionDigits: 2})}** (${c.quantity_mt.toFixed(3)} MT × ¥${c.unit_price_cny.toLocaleString('en-US')}/MT, VAT incl.).
> Unit price excl. VAT is about ¥${(c.unit_price_cny / 1.13).toFixed(0)}/MT, roughly USD $${(c.unit_price_cny / 1.13 / USD_RATE).toFixed(0)}/MT.
`;
}

// ====== Run the generator ======
const casesDir = path.join(rootDir, 'data', 'cases');
const uploadsDir = path.join(rootDir, 'data', 'uploads');

await fs.mkdir(casesDir, { recursive: true });

for (const c of CONTRACTS) {
  // Case JSON
  const caseData = buildCase(c);
  await fs.writeFile(
    path.join(casesDir, `${c.slug}.case.json`),
    JSON.stringify(caseData, null, 2) + '\n',
    'utf8'
  );

  // Upload docs
  const caseUploadDir = path.join(uploadsDir, c.slug);
  await fs.mkdir(caseUploadDir, { recursive: true });

  await fs.writeFile(
    path.join(caseUploadDir, 'warehouse-receipt.md'),
    buildWarehouseReceipt(c),
    'utf8'
  );

  await fs.writeFile(
    path.join(caseUploadDir, 'commercial-invoice.md'),
    buildCommercialInvoice(c),
    'utf8'
  );

  console.log(`✓ ${c.slug} (${c.contract_no}) — ${c.supplier} — ¥${(c.amount_cny/1000000).toFixed(2)} million / ${c.quantity_mt.toFixed(1)} MT`);
}

console.log(`\n✅ Done: ${CONTRACTS.length} case JSONs + ${CONTRACTS.length * 2} upload docs = ${CONTRACTS.length * 3} files`);
