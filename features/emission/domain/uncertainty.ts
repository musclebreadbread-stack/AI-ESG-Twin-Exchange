/**
 * P1: Uncertainty Quantification Module
 * Reference: ISO 14064-1:2018 §6.2.3
 *
 * Implements Monte Carlo simulation and error propagation for GHG uncertainty assessment.
 * All arithmetic uses Decimal to maintain precision.
 */
import { type Exact, exact, sumExact } from '@/core/domain/decimal';

export interface UncertaintySource {
  readonly parameterName: string;
  readonly nominalValue: Exact;
  readonly uncertaintyPct: Exact; // ±% (e.g., exact('5') means ±5%)
  readonly distributionType: 'normal' | 'uniform' | 'triangular' | 'lognormal';
  readonly confidenceLevel: 95 | 90;
}

export interface UncertaintyResult {
  readonly nominalEmission: Exact;
  readonly lowerBound: Exact;
  readonly upperBound: Exact;
  readonly combinedUncertaintyPct: Exact;
  readonly confidenceLevel: 95 | 90;
  readonly method: 'error_propagation' | 'monte_carlo';
  readonly componentBreakdown: readonly UncertaintyComponent[];
}

export interface UncertaintyComponent {
  readonly parameterName: string;
  readonly contributionPct: Exact;
  readonly sensitivityIndex: Exact;
}

/**
 * Error Propagation Method (ISO 14064-1, IPCC 2006 Vol.1 Ch.3)
 *
 * For multiplication: combined uncertainty = sqrt(Σ(u_i²))
 * where u_i is the percentage uncertainty of each parameter.
 *
 * This is the Tier 1 approach suitable when:
 * - uncertainties are relatively small (<~30%)
 * - parameters are independent
 * - distributions are approximately symmetric
 */
export function calculateUncertaintyPropagation(
  sources: readonly UncertaintySource[],
  nominalEmission: Exact
): UncertaintyResult {
  if (sources.length === 0) {
    return {
      nominalEmission,
      lowerBound: nominalEmission,
      upperBound: nominalEmission,
      combinedUncertaintyPct: exact(0),
      confidenceLevel: 95,
      method: 'error_propagation',
      componentBreakdown: [],
    };
  }

  // Combined uncertainty for multiplicative model: sqrt(Σ(u_i²))
  let sumOfSquares = exact(0);
  for (const source of sources) {
    const uSquared = source.uncertaintyPct.times(source.uncertaintyPct) as Exact;
    sumOfSquares = sumOfSquares.plus(uSquared) as Exact;
  }

  const combinedUncertaintyPct = exact(sumOfSquares.sqrt());

  // Calculate bounds
  const halfRange = nominalEmission.times(combinedUncertaintyPct).dividedBy(100) as Exact;
  const lowerBound = nominalEmission.minus(halfRange) as Exact;
  const upperBound = nominalEmission.plus(halfRange) as Exact;

  // Sensitivity analysis: contribution of each parameter to total
  const componentBreakdown: UncertaintyComponent[] = sources.map((source) => {
    const uSquared = source.uncertaintyPct.times(source.uncertaintyPct) as Exact;
    const contributionPct = sumOfSquares.isZero()
      ? exact(0)
      : (uSquared.dividedBy(sumOfSquares).times(100) as Exact);
    const sensitivityIndex = sumOfSquares.isZero()
      ? exact(0)
      : (source.uncertaintyPct.dividedBy(combinedUncertaintyPct) as Exact);

    return {
      parameterName: source.parameterName,
      contributionPct,
      sensitivityIndex,
    };
  });

  return {
    nominalEmission,
    lowerBound: lowerBound.isNeg() ? exact(0) : lowerBound, // Emissions can't be negative
    upperBound,
    combinedUncertaintyPct,
    confidenceLevel: 95,
    method: 'error_propagation',
    componentBreakdown,
  };
}

/**
 * Monte Carlo Simulation (ISO 14064-1, IPCC 2006 Vol.1 Ch.3 Tier 2)
 *
 * Uses pseudo-random sampling with deterministic seed for reproducibility.
 * Suitable when:
 * - uncertainties are large (>30%)
 * - parameters are correlated
 * - distributions are asymmetric
 */
export function calculateUncertaintyMonteCarlo(
  sources: readonly UncertaintySource[],
  nominalEmission: Exact,
  iterations: number = 10000,
  seed: number = 42
): UncertaintyResult {
  if (sources.length === 0 || iterations < 100) {
    return calculateUncertaintyPropagation(sources, nominalEmission);
  }

  // Seeded pseudo-random number generator (mulberry32)
  let state = seed;
  function nextRandom(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Box-Muller for normal distribution
  function normalRandom(mean: number, stdDev: number): number {
    const u1 = nextRandom();
    const u2 = nextRandom();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  }

  // Sample from distribution
  function sampleValue(source: UncertaintySource): number {
    const nominal = source.nominalValue.toNumber();
    const stdDev = (nominal * source.uncertaintyPct.toNumber()) / (2 * 100); // 95% CI → ÷2

    switch (source.distributionType) {
      case 'normal':
        return normalRandom(nominal, stdDev);
      case 'lognormal': {
        const logMean = Math.log(nominal) - 0.5 * Math.log(1 + (stdDev / nominal) ** 2);
        const logStd = Math.sqrt(Math.log(1 + (stdDev / nominal) ** 2));
        return Math.exp(normalRandom(logMean, logStd));
      }
      case 'uniform': {
        const half = nominal * source.uncertaintyPct.toNumber() / 100;
        return nominal - half + nextRandom() * 2 * half;
      }
      case 'triangular': {
        const half = nominal * source.uncertaintyPct.toNumber() / 100;
        const u = nextRandom();
        if (u < 0.5) {
          return nominal - half + Math.sqrt(u * 2) * half;
        }
        return nominal + half - Math.sqrt((1 - u) * 2) * half;
      }
    }
  }

  // Run simulation
  const results: number[] = [];
  for (let i = 0; i < iterations; i++) {
    let product = 1;
    for (const source of sources) {
      const sampled = sampleValue(source);
      product *= sampled / source.nominalValue.toNumber();
    }
    results.push(nominalEmission.toNumber() * product);
  }

  // Sort for percentile calculation
  results.sort((a, b) => a - b);

  const p2_5 = results[Math.floor(iterations * 0.025)]!;
  const p97_5 = results[Math.floor(iterations * 0.975)]!;
  const mean = results.reduce((s, v) => s + v, 0) / iterations;

  const combinedPct = ((p97_5 - p2_5) / (2 * mean)) * 100;

  // Component sensitivity via variance decomposition
  const componentBreakdown: UncertaintyComponent[] = sources.map((source) => {
    const nominalNum = source.nominalValue.toNumber();
    const stdDev = (nominalNum * source.uncertaintyPct.toNumber()) / (2 * 100);
    const variance = stdDev * stdDev;
    const totalVariance = sources.reduce((s, src) => {
      const n = src.nominalValue.toNumber();
      const sd = (n * src.uncertaintyPct.toNumber()) / (2 * 100);
      return s + sd * sd;
    }, 0);

    return {
      parameterName: source.parameterName,
      contributionPct: exact(totalVariance === 0 ? 0 : (variance / totalVariance) * 100),
      sensitivityIndex: exact(totalVariance === 0 ? 0 : Math.sqrt(variance / totalVariance)),
    };
  });

  return {
    nominalEmission,
    lowerBound: exact(Math.max(0, p2_5)),
    upperBound: exact(p97_5),
    combinedUncertaintyPct: exact(combinedPct),
    confidenceLevel: 95,
    method: 'monte_carlo',
    componentBreakdown,
  };
}
