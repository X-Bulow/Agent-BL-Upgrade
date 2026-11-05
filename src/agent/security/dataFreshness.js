// TRUST-5: Data Freshness and Source Health
// Risk intel carries observed_at/expires_at/source_status; stale data automatically lowers confidence or blocks pricing

export class DataFreshnessValidator {
  constructor(maxAgeMs = 86400000) { // default 24 hours
    this.maxAgeMs = maxAgeMs;
  }

  /**
   * Validate data freshness
   * @param {Object} data - data containing observed_at
   * @param {number} currentTime - current timestamp
   * @returns {Object} - { fresh: boolean, age_ms: number, status: string }
   */
  validateFreshness(data, currentTime = Date.now()) {
    if (!data.observed_at) {
      return { fresh: false, age_ms: null, status: 'MISSING_TIMESTAMP' };
    }

    const observedAt = new Date(data.observed_at).getTime();
    const ageMs = currentTime - observedAt;

    if (ageMs < 0) {
      return { fresh: false, age_ms: ageMs, status: 'FUTURE_TIMESTAMP' };
    }

    if (ageMs > this.maxAgeMs) {
      return { fresh: false, age_ms: ageMs, status: 'EXPIRED' };
    }

    return { fresh: true, age_ms: ageMs, status: 'FRESH' };
  }

  /**
   * Adjust confidence according to data freshness
   * @param {number} baseConfidence - base confidence (0-1)
   * @param {number} ageMs - data age (milliseconds)
   * @returns {number} - adjusted confidence
   */
  adjustConfidence(baseConfidence, ageMs) {
    if (ageMs > this.maxAgeMs) {
      return 0; // expired data has zero confidence
    }

    // Linear decay: fresh data has 100% confidence, decaying to 50% as it nears expiry
    const decayFactor = 1 - (ageMs / this.maxAgeMs) * 0.5;
    return baseConfidence * decayFactor;
  }

  /**
   * Check data source health
   * @param {Object} source - data source info
   * @returns {Object} - { healthy: boolean, status: string }
   */
  checkSourceHealth(source) {
    if (!source || !source.name) {
      return { healthy: false, status: 'UNKNOWN_SOURCE' };
    }

    if (source.status === 'offline' || source.status === 'error') {
      return { healthy: false, status: source.status.toUpperCase() };
    }

    if (source.last_update) {
      const lastUpdate = new Date(source.last_update).getTime();
      const timeSinceUpdate = Date.now() - lastUpdate;

      // Mark the source unhealthy if it has not updated for more than 1 hour
      if (timeSinceUpdate > 3600000) {
        return { healthy: false, status: 'STALE_SOURCE' };
      }
    }

    return { healthy: true, status: 'HEALTHY' };
  }
}

/**
 * Risk intel data structure with freshness validation
 */
export class RiskIntelligence {
  constructor(data) {
    this.event_id = data.event_id;
    this.event_type = data.event_type;
    this.severity = data.severity;
    this.description = data.description;
    this.observed_at = data.observed_at;
    this.expires_at = data.expires_at;
    this.source = data.source;
    this.confidence = data.confidence || 1.0;
  }

  /**
   * Check whether the intel can be used for pricing
   * @param {number} currentTime - current timestamp
   * @returns {Object} - { usable: boolean, reason: string, adjusted_confidence: number }
   */
  isUsableForPricing(currentTime = Date.now()) {
    const validator = new DataFreshnessValidator();

    // Check data freshness
    const freshness = validator.validateFreshness(this, currentTime);
    if (!freshness.fresh) {
      return {
        usable: false,
        reason: `Data not fresh: ${freshness.status}`,
        adjusted_confidence: 0
      };
    }

    // Check whether it has expired
    if (this.expires_at) {
      const expiresAt = new Date(this.expires_at).getTime();
      if (currentTime > expiresAt) {
        return {
          usable: false,
          reason: 'Intelligence expired',
          adjusted_confidence: 0
        };
      }
    }

    // Check data source health
    if (this.source) {
      const sourceHealth = validator.checkSourceHealth(this.source);
      if (!sourceHealth.healthy) {
        return {
          usable: false,
          reason: `Source unhealthy: ${sourceHealth.status}`,
          adjusted_confidence: 0
        };
      }
    }

    // Adjust confidence
    const adjustedConfidence = validator.adjustConfidence(
      this.confidence,
      freshness.age_ms
    );

    return {
      usable: true,
      reason: 'Fresh and healthy',
      adjusted_confidence: adjustedConfidence
    };
  }
}

/**
 * Test data freshness validation (clock-controlled tests)
 */
export function testDataFreshnessValidation() {
  const validator = new DataFreshnessValidator(86400000); // 24 hours
  const baseTime = Date.now();

  const tests = [
    {
      name: 'Fresh data (1 hour old)',
      data: { observed_at: new Date(baseTime - 3600000).toISOString() },
      currentTime: baseTime,
      expectedFresh: true
    },
    {
      name: 'Stale data (48 hours old)',
      data: { observed_at: new Date(baseTime - 172800000).toISOString() },
      currentTime: baseTime,
      expectedFresh: false
    },
    {
      name: 'Missing timestamp',
      data: {},
      currentTime: baseTime,
      expectedFresh: false
    },
    {
      name: 'Future timestamp (invalid)',
      data: { observed_at: new Date(baseTime + 3600000).toISOString() },
      currentTime: baseTime,
      expectedFresh: false
    }
  ];

  const results = tests.map(test => {
    const result = validator.validateFreshness(test.data, test.currentTime);
    const passed = result.fresh === test.expectedFresh;

    return {
      name: test.name,
      passed,
      result
    };
  });

  const allPassed = results.every(r => r.passed);

  return {
    all_tests_passed: allPassed,
    results,
    summary: `${results.filter(r => r.passed).length}/${results.length} freshness tests passed`
  };
}

/**
 * Test that stale data is not used when the network is down
 */
export function testOfflineFallback() {
  const intelligence = new RiskIntelligence({
    event_id: 'EVT-001',
    event_type: 'war_risk',
    severity: 'HIGH',
    description: 'Conflict in region',
    observed_at: new Date(Date.now() - 100000000).toISOString(), // too old
    source: { name: 'xAPI', status: 'offline' }
  });

  const usability = intelligence.isUsableForPricing();

  return {
    passed: !usability.usable,
    reason: usability.reason,
    message: usability.usable
      ? '❌ FAIL: Old data should not be used when offline'
      : '✅ PASS: Correctly rejected stale offline data'
  };
}
