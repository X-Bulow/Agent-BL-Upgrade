// Case catalog helpers for the market view: one cargo category per case and
// multi-keyword search. Pure functions (no DOM) so they can be unit-tested.

// Display order of the category filter buttons ('all' is added by the UI).
export const CASE_CATEGORIES = ['metal', 'energy', 'ore', 'agriculture', 'other'];

// First matching rule wins, so ores and concentrates are not counted as metals
// and refined oil is not counted as a chemical.
const CATEGORY_RULES = [
  ['ore', /\bores?\b|concentrate/u],
  ['energy', /crude|petroleum|gasoline|diesel|kerosene|jet fuel|\bfuel\b|\boil\b|\blng\b|\blpg\b|\bcoal\b/u],
  ['agriculture', /soy|grain|wheat|corn|maize|rice|sugar|coffee|cocoa|cotton|palm|rubber/u],
  ['metal', /copper|alumin|steel|zinc|nickel|\biron\b|\btin\b|\blead\b|metal|cathode|ingot|p1020|adc12/u]
];

function categoryText(caseItem) {
  const data = caseItem?.case ?? {};
  const bl = data.bill_of_lading ?? {};
  return [data.cargo?.commodity, bl.cargo, caseItem?.cargo, caseItem?.case_id]
    .filter(Boolean).join(' ').toLowerCase();
}

/** The single category a market case belongs to. */
export function caseCategory(caseItem) {
  const text = categoryText(caseItem);
  return CATEGORY_RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? 'other';
}

/** Lower-case search terms, split on whitespace and punctuation. */
export function searchTerms(query) {
  return String(query ?? '')
    .toLowerCase()
    .split(/[\s,;/|·→()[\]]+/u)
    .map((term) => term.trim())
    .filter(Boolean);
}

/** The text a case can be found by (its data plus the given extra strings). */
export function caseSearchFields(caseItem) {
  const data = caseItem?.case ?? {};
  const bl = data.bill_of_lading ?? {};
  return [
    caseItem?.case_id, caseItem?.label, caseItem?.cargo, caseItem?.route, caseItem?.risk_hint,
    data.cargo?.commodity, data.cargo?.grade,
    bl.cargo, bl.bl_id, bl.bl_no, bl.vessel, bl.vessel_name, bl.voyage_no,
    bl.port_of_loading, bl.port_of_discharge, bl.shipper, bl.consignee, bl.carrier
  ].filter((value) => typeof value === 'string' && value.trim());
}

/** True when every search term appears somewhere in the fields. An empty query matches all. */
export function matchesSearch(fields, query) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  const haystack = fields.join(' ').toLowerCase();
  return terms.every((term) => haystack.includes(term));
}
