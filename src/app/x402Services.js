// Business logic of the paid x402 services, shared by both payment transports
// (Demo personal-sign route and the Live V2 gateway). Each service has:
//   preflight({ body, payer })  - optional; throws BEFORE the buyer is charged
//   handler({ body, payer, paymentTx, live }) - produces the report after payment
import { quoteFromCase } from '../core/pricingEngine.js';
import { buildPremiumFraudReview, buildPremiumRiskIntel, buildPremiumValuation } from '../x402/endpoints.js';
import { HttpError } from './http.js';
import { isRecord, looksLikeCase } from './shapes.js';

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/u;

/** The Mystery store only accepts lowercase hashes; demo receipts keep their case. */
function normalizePaymentRef(paymentTx) {
  return TX_HASH_RE.test(String(paymentTx)) ? String(paymentTx).toLowerCase() : paymentTx;
}

/**
 * @param {object} deps
 * @param {() => Promise<object>} deps.loadDemoCase
 * @param {() => Promise<void>} deps.ensureMockPools
 * @param {() => Map<string, object>} deps.getPools
 */
export function createX402ServiceDefinitions({ loadDemoCase, ensureMockPools, getPools }) {
  const caseFrom = async (body) => (
    looksLikeCase(body) ? body : (isRecord(body) && body.case ? body.case : loadDemoCase())
  );

  // Reject malformed input before any money moves: a paid report for a case that
  // cannot be analysed would mean charging the buyer for an error. A caller-supplied
  // case gets a deterministic, network-free pricing dry run (every report builds on it).
  const requireCaseInput = async ({ body }) => {
    if (body === null || body === undefined) return;
    if (!isRecord(body)) throw new HttpError(400, 'invalid_request', 'Request body must be a JSON object');
    if (body.case !== undefined && !isRecord(body.case)) {
      throw new HttpError(400, 'invalid_request', '"case" must be a trade-case object');
    }
    const supplied = looksLikeCase(body) ? body : body.case;
    if (!supplied) return;
    try {
      quoteFromCase(supplied);
    } catch (error) {
      // Engine faults (TypeError/RangeError) describe our internals: say only that the case is malformed.
      const engineFault = error instanceof TypeError || error instanceof RangeError;
      throw new HttpError(400, 'invalid_case',
        engineFault ? 'The supplied trade case is malformed and cannot be priced' : `The supplied trade case cannot be priced: ${error.message}`);
    }
  };

  return {
    'premium-risk': {
      preflight: requireCaseInput,
      handler: async ({ body }) => buildPremiumRiskIntel(await caseFrom(body))
    },
    'premium-valuation': {
      preflight: requireCaseInput,
      handler: async ({ body }) => buildPremiumValuation(await caseFrom(body))
    },
    'fraud-review': {
      preflight: requireCaseInput,
      handler: async ({ body }) => buildPremiumFraudReview(await caseFrom(body))
    },
    // MBOX-X402-1/2: payment completes the committed reveal and binds the selected
    // case + Risk Passport + reveal proof into the PaidReportEnvelope.
    'mystery-voyage': {
      async preflight({ body, payer }) {
        await ensureMockPools();
        const { preflightMysteryVoyage } = await import('../mystery/service.js');
        await preflightMysteryVoyage({
          reveal_id: body?.reveal_id,
          user_nonce: body?.user_nonce,
          wallet_address: payer
        }, { pools: getPools() });
      },
      async handler({ body, payer, paymentTx }) {
        await ensureMockPools();
        const { revealMysteryVoyage } = await import('../mystery/service.js');
        const record = await revealMysteryVoyage({
          reveal_id: body?.reveal_id,
          user_nonce: body?.user_nonce,
          wallet_address: payer,
          payment_tx_hash: normalizePaymentRef(paymentTx)
        }, { pools: getPools() });
        return {
          ...record.report,
          reveal_state: record.state,
          proof: record.proof,
          disclosure: {
            purchase: 'AI_DUE_DILIGENCE_REVEAL_ONLY',
            automatically_subscribes_rwa: false,
            independent_investment_signature_required: true
          }
        };
      }
    }
  };
}
