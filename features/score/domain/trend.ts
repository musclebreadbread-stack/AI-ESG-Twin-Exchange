/**
 * P3: Time-Series Trend Correction Module
 *
 * Analyzes ESG score trajectory over time and optionally adjusts
 * current assessment based on improvement/deterioration trends.
 */
import { type Exact, exact } from '@/core/domain/decimal';

export interface ScoreHistoryPoint {
  readonly period: string; // e.g., '2024-Q1'
  readonly totalScore: number;
  readonly eScore: number;
  readonly sScore: number;
  readonly gScore: number;
  readonly computedAt: Date;
}

export type TrendDirection = 'improving' | 'stable' | 'deteriorating';

export interface TrendAnalysis {
  readonly axis: 'total' | 'E' | 'S' | 'G';
  readonly direction: TrendDirection;
  readonly slope: Exact; // points per period
  readonly rSquared: Exact; // fit quality 0-1
  readonly periodsAnalyzed: number;
  readonly projectedNextPeriod: number;
}

export interface TrendAssessment {
  readonly total: TrendAnalysis;
  readonly e: TrendAnalysis;
  readonly s: TrendAnalysis;
  readonly g: TrendAnalysis;
  readonly trendBonus: { e: number; s: number; g: number; total: number };
}

/**
 * Simple linear regression over score history.
 */
function linearRegression(values: readonly number[]): { slope: number; intercept: number; rSquared: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0, rSquared: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i]!;
    sumXY += i * values[i]!;
    sumXX += i * i;
    sumYY += values[i]! * values[i]!;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const meanY = sumY / n;
  const ssRes = values.reduce((s, v, i) => s + (v - (intercept + slope * i)) ** 2, 0);
  const ssTot = values.reduce((s, v) => s + (v - meanY) ** 2, 0);
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

function classifyTrend(slope: number, threshold: number = 1.5): TrendDirection {
  if (slope > threshold) return 'improving';
  if (slope < -threshold) return 'deteriorating';
  return 'stable';
}

/**
 * Analyze score trends from historical data.
 * Requires minimum 3 periods for meaningful trend.
 */
export function analyzeTrends(history: readonly ScoreHistoryPoint[]): TrendAssessment {
  const analyze = (values: readonly number[], axis: TrendAnalysis['axis']): TrendAnalysis => {
    const { slope, rSquared } = linearRegression(values);
    const direction = classifyTrend(slope);
    const projectedNextPeriod = Math.round(
      Math.max(0, Math.min(100, (values[values.length - 1] ?? 0) + slope))
    );

    return {
      axis,
      direction,
      slope: exact(slope),
      rSquared: exact(Math.max(0, rSquared)),
      periodsAnalyzed: values.length,
      projectedNextPeriod,
    };
  };

  const total = analyze(history.map((h) => h.totalScore), 'total');
  const e = analyze(history.map((h) => h.eScore), 'E');
  const s = analyze(history.map((h) => h.sScore), 'S');
  const g = analyze(history.map((h) => h.gScore), 'G');

  // Trend bonus/penalty: ±2 points for strong trends (R² > 0.6)
  const bonusForAxis = (analysis: TrendAnalysis): number => {
    if (analysis.rSquared.lessThan(exact('0.6'))) return 0; // Not enough signal
    if (analysis.direction === 'improving') return 2;
    if (analysis.direction === 'deteriorating') return -2;
    return 0;
  };

  const trendBonus = {
    e: bonusForAxis(e),
    s: bonusForAxis(s),
    g: bonusForAxis(g),
    total: Math.round((bonusForAxis(e) + bonusForAxis(s) + bonusForAxis(g)) / 3),
  };

  return { total, e, s, g, trendBonus };
}
