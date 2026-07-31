/**
 * Task 30: Rule Set — versioned scoring rule container.
 */
import { type Exact, exact } from '@/core/domain/decimal';

export type RuleSetStatus = 'draft' | 'published' | 'retired';

export interface RuleSet {
  readonly ruleSetVersion: string;
  readonly grammarVersion: number;
  readonly publishedAt?: Date;
  readonly status: RuleSetStatus;
  readonly note?: string;
}

export interface ScoringRuleRecord {
  readonly id: string;
  readonly ruleSetVersion: string;
  readonly frameworkCode: string;
  readonly indicatorCode: string;
  readonly countryCode?: string;
  readonly industryCode?: string;
  readonly formula: string;
  readonly formulaAst: unknown;
  readonly weight: Exact;
  readonly normalization: string;
  readonly direction: 'higher_better' | 'lower_better';
  readonly scaleMin: Exact;
  readonly scaleMax: Exact;
  readonly validFrom: Date;
  readonly validTo?: Date;
}

export interface LoadedRuleSet {
  readonly ruleSet: RuleSet;
  readonly rules: readonly ScoringRuleRecord[];
}

/**
 * Resolve which rule applies for a given indicator/country/industry/date.
 * Priority ladder: industry+country > country > industry > default.
 */
export function resolveRule(
  rules: readonly ScoringRuleRecord[],
  indicatorCode: string,
  countryCode?: string,
  industryCode?: string,
  asOf?: Date
): ScoringRuleRecord | null {
  const now = asOf ?? new Date();
  const candidates = rules.filter((r) => {
    if (r.indicatorCode !== indicatorCode) return false;
    if (r.validFrom > now) return false;
    if (r.validTo && r.validTo < now) return false;
    return true;
  });

  // Priority: industry+country > country > industry > default (null/null)
  const ranked = candidates.sort((a, b) => {
    const scoreA = (a.countryCode ? 2 : 0) + (a.industryCode ? 1 : 0);
    const scoreB = (b.countryCode ? 2 : 0) + (b.industryCode ? 1 : 0);
    return scoreB - scoreA;
  });

  for (const rule of ranked) {
    if (rule.countryCode && rule.countryCode !== countryCode) continue;
    if (rule.industryCode && rule.industryCode !== industryCode) continue;
    return rule;
  }

  return null;
}
