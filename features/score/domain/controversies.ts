/**
 * P1: ESG Controversies / Negative Event Deduction Module
 * Reference: MSCI ESG Ratings Methodology — Controversies Assessment
 *
 * Events-based scoring that reduces ESG scores when controversies are identified.
 * Controversies are assessed by severity and recency.
 */
import { type Exact, exact } from '@/core/domain/decimal';

export type ControversySeverity = 'very_severe' | 'severe' | 'moderate' | 'minor';
export type ControversyCategory =
  | 'environment_pollution'
  | 'environment_biodiversity'
  | 'labor_rights'
  | 'health_safety'
  | 'human_rights'
  | 'community_impact'
  | 'corruption_bribery'
  | 'governance_fraud'
  | 'product_safety'
  | 'data_privacy';

export interface Controversy {
  readonly id: string;
  readonly category: ControversyCategory;
  readonly severity: ControversySeverity;
  readonly title: string;
  readonly description: string;
  readonly occurredAt: Date;
  readonly resolvedAt?: Date;
  readonly affectedAxis: 'E' | 'S' | 'G';
  readonly sourceUrl?: string;
  readonly verified: boolean;
}

export interface ControversyDeduction {
  readonly controversyId: string;
  readonly axis: 'E' | 'S' | 'G';
  readonly baseDeduction: Exact;
  readonly recencyFactor: Exact;
  readonly finalDeduction: Exact;
}

export interface ControversyAssessment {
  readonly totalDeduction: Exact;
  readonly eDeduction: Exact;
  readonly sDeduction: Exact;
  readonly gDeduction: Exact;
  readonly deductions: readonly ControversyDeduction[];
  readonly assessedAt: Date;
}

/**
 * Severity → base deduction points (0~100 scale).
 * Based on MSCI's 4-level severity framework.
 */
const SEVERITY_DEDUCTION: Record<ControversySeverity, number> = {
  very_severe: 20,
  severe: 12,
  moderate: 6,
  minor: 2,
};

/**
 * Recency decay factor.
 * Recent controversies have more impact; older ones decay.
 * Full impact within 6 months, linear decay to 50% at 24 months, 0% at 60 months.
 */
export function calculateRecencyFactor(occurredAt: Date, assessmentDate: Date): Exact {
  const monthsAgo = (assessmentDate.getTime() - occurredAt.getTime()) / (30.44 * 24 * 60 * 60 * 1000);

  if (monthsAgo <= 6) return exact(1);
  if (monthsAgo <= 24) {
    // Linear decay from 1.0 to 0.5 over months 6-24
    const decay = 1 - ((monthsAgo - 6) / (24 - 6)) * 0.5;
    return exact(Math.max(0, decay));
  }
  if (monthsAgo <= 60) {
    // Linear decay from 0.5 to 0 over months 24-60
    const decay = 0.5 - ((monthsAgo - 24) / (60 - 24)) * 0.5;
    return exact(Math.max(0, decay));
  }
  return exact(0); // Beyond 5 years: no impact
}

/**
 * Assess all controversies and compute deductions per axis.
 * Only verified controversies are applied.
 * Resolved controversies receive a 50% reduction.
 */
export function assessControversies(
  controversies: readonly Controversy[],
  assessmentDate: Date = new Date()
): ControversyAssessment {
  const deductions: ControversyDeduction[] = [];
  let eTotal = exact(0);
  let sTotal = exact(0);
  let gTotal = exact(0);

  for (const c of controversies) {
    if (!c.verified) continue;

    const baseDeduction = exact(SEVERITY_DEDUCTION[c.severity]);
    const recencyFactor = calculateRecencyFactor(c.occurredAt, assessmentDate);

    // Resolved controversies get 50% reduction
    const resolutionFactor = c.resolvedAt ? exact('0.5') : exact('1');

    const finalDeduction = baseDeduction
      .times(recencyFactor)
      .times(resolutionFactor) as Exact;

    if (finalDeduction.greaterThan(0)) {
      deductions.push({
        controversyId: c.id,
        axis: c.affectedAxis,
        baseDeduction,
        recencyFactor,
        finalDeduction,
      });

      switch (c.affectedAxis) {
        case 'E': eTotal = eTotal.plus(finalDeduction) as Exact; break;
        case 'S': sTotal = sTotal.plus(finalDeduction) as Exact; break;
        case 'G': gTotal = gTotal.plus(finalDeduction) as Exact; break;
      }
    }
  }

  // Cap total deduction per axis at 40 points (MSCI caps at 2 notch levels)
  const cap = exact(40);
  eTotal = eTotal.greaterThan(cap) ? cap : eTotal;
  sTotal = sTotal.greaterThan(cap) ? cap : sTotal;
  gTotal = gTotal.greaterThan(cap) ? cap : gTotal;

  const totalDeduction = eTotal.plus(sTotal).plus(gTotal).dividedBy(3) as Exact;

  return {
    totalDeduction,
    eDeduction: eTotal,
    sDeduction: sTotal,
    gDeduction: gTotal,
    deductions,
    assessedAt: assessmentDate,
  };
}

/**
 * Apply controversy deductions to raw ESG scores.
 * Scores cannot go below 0.
 */
export function applyControversyDeductions(
  eScore: number,
  sScore: number,
  gScore: number,
  assessment: ControversyAssessment
): { eScore: number; sScore: number; gScore: number; totalScore: number } {
  const adjustedE = Math.max(0, eScore - assessment.eDeduction.toNumber());
  const adjustedS = Math.max(0, sScore - assessment.sDeduction.toNumber());
  const adjustedG = Math.max(0, gScore - assessment.gDeduction.toNumber());
  const totalScore = Math.round((adjustedE + adjustedS + adjustedG) / 3);

  return { eScore: Math.round(adjustedE), sScore: Math.round(adjustedS), gScore: Math.round(adjustedG), totalScore };
}
