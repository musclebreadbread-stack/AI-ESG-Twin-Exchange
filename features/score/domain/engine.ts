/**
 * Task 12/30: Score Engine — evaluates RuleSet against twin data.
 * Uses Decimal arithmetic exclusively.
 */
import { type Exact, exact, present, type Presented } from '@/core/domain/decimal';
import { type Result, ok, err } from '@/core/domain/result';

export interface ScoringRule {
  readonly indicatorCode: string;
  readonly frameworkCode: string;
  readonly axis: 'E' | 'S' | 'G';
  readonly weight: Exact;
  readonly direction: 'higher_better' | 'lower_better';
  readonly scaleMin: Exact;
  readonly scaleMax: Exact;
  readonly formula: string;
}

export interface IndicatorBinding {
  readonly indicatorCode: string;
  readonly value: Exact | null;
}

export interface IndicatorResult {
  readonly indicatorCode: string;
  readonly axis: 'E' | 'S' | 'G';
  readonly rawValue: Exact | null;
  readonly normalizedValue: Exact | null;
  readonly originalWeight: Exact;
  readonly renormalizedWeight: Exact;
  readonly contribution: Exact;
  readonly absentReason?: string;
}

export interface ScoreResult {
  readonly totalScore: number;
  readonly eScore: number;
  readonly sScore: number;
  readonly gScore: number;
  readonly rawTotal: Exact;
  readonly rawE: Exact;
  readonly rawS: Exact;
  readonly rawG: Exact;
  readonly contributions: readonly IndicatorResult[];
}

/**
 * Normalize a raw indicator value to [0, 1] based on direction and scale.
 */
export function normalizeValue(
  raw: Exact,
  rule: ScoringRule
): Exact {
  const range = rule.scaleMax.minus(rule.scaleMin);
  if (range.isZero()) return exact(0);

  let normalized: Exact;
  if (rule.direction === 'higher_better') {
    normalized = raw.minus(rule.scaleMin).dividedBy(range) as Exact;
  } else {
    normalized = rule.scaleMax.minus(raw).dividedBy(range) as Exact;
  }

  // Clamp to [0, 1]
  if (normalized.lessThan(0)) return exact(0);
  if (normalized.greaterThan(1)) return exact(1);
  return exact(normalized);
}

/**
 * Compute ESG scores from indicator bindings and rules.
 * Absent indicators are excluded from weight denominator (re-normalized).
 */
export function computeScore(
  rules: readonly ScoringRule[],
  bindings: readonly IndicatorBinding[]
): ScoreResult {
  const bindingMap = new Map(bindings.map((b) => [b.indicatorCode, b.value]));
  const contributions: IndicatorResult[] = [];

  // Separate present and absent indicators per axis
  const axisWeights: Record<string, Exact> = { E: exact(0), S: exact(0), G: exact(0) };
  const axisScores: Record<string, Exact> = { E: exact(0), S: exact(0), G: exact(0) };

  // First pass: identify present indicators and total weight per axis
  const presentRules: Array<{ rule: ScoringRule; rawValue: Exact; normalized: Exact }> = [];

  for (const rule of rules) {
    const rawValue = bindingMap.get(rule.indicatorCode) ?? null;

    if (rawValue === null) {
      contributions.push({
        indicatorCode: rule.indicatorCode,
        axis: rule.axis,
        rawValue: null,
        normalizedValue: null,
        originalWeight: rule.weight,
        renormalizedWeight: exact(0),
        contribution: exact(0),
        absentReason: 'UNBOUND_IDENTIFIER',
      });
      continue;
    }

    const normalized = normalizeValue(rawValue, rule);
    presentRules.push({ rule, rawValue, normalized });
    axisWeights[rule.axis] = axisWeights[rule.axis].plus(rule.weight) as Exact;
  }

  // Second pass: renormalize and compute contributions
  for (const { rule, rawValue, normalized } of presentRules) {
    const totalAxisWeight = axisWeights[rule.axis];
    const renormalizedWeight = totalAxisWeight.isZero()
      ? exact(0)
      : (rule.weight.dividedBy(totalAxisWeight) as Exact);

    const contribution = normalized.times(renormalizedWeight) as Exact;
    axisScores[rule.axis] = axisScores[rule.axis].plus(contribution) as Exact;

    contributions.push({
      indicatorCode: rule.indicatorCode,
      axis: rule.axis,
      rawValue,
      normalizedValue: normalized,
      originalWeight: rule.weight,
      renormalizedWeight,
      contribution,
    });
  }

  const rawE = exact(axisScores['E']);
  const rawS = exact(axisScores['S']);
  const rawG = exact(axisScores['G']);
  const rawTotal = exact(rawE.plus(rawS).plus(rawG).dividedBy(3));

  // Convert to 0-100 integer scores
  const toScore = (v: Exact): number => Math.round(v.times(100).toNumber());

  return {
    totalScore: toScore(rawTotal),
    eScore: toScore(rawE),
    sScore: toScore(rawS),
    gScore: toScore(rawG),
    rawTotal,
    rawE,
    rawS,
    rawG,
    contributions,
  };
}
