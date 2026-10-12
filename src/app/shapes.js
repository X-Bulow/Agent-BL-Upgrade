// Small request-shape predicates shared by the route modules.

export function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// A POST body is treated as a bare trade case when it carries a bill_of_lading
// (legacy seed) or a case_id + financing block (new-model case).
export function looksLikeCase(value) {
  return isRecord(value)
    && (value.bill_of_lading !== undefined || (value.case_id !== undefined && value.financing !== undefined));
}
