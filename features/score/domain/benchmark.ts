/**
 * P2: Peer Percentile Benchmark Module
 * Reference: S&P CSA, KCGS methodology — industry-relative scoring
 *
 * Computes where a company stands relative to peers in the same industry.
 */
import { type Exact, exact } from '@/core/domain/decimal';

export interface PeerDataPoint {
  readonly companyId: string;
  readonly industryCode: string;
  readonly totalScore: number;
  readonly eScore: number;
  readonly sScore: number;
  readonly gScore: number;
  readonly snapshotDate: Date;
}

export interface BenchmarkResult {
  readonly companyId: string;
  readonly industryCode: string;
  readonly peerCount: number;
  readonly totalPercentile: number; // 0-100
  readonly ePercentile: number;
  readonly sPercentile: number;
  readonly gPercentile: number;
  readonly industryAvg: { total: number; e: number; s: number; g: number };
  readonly industryMedian: { total: number; e: number; s: number; g: number };
  readonly quartile: 1 | 2 | 3 | 4; // 1=top25%, 4=bottom25%
  readonly computedAt: Date;
}

/**
 * Calculate percentile rank within peer group.
 * Uses interpolation method for tied values.
 */
function percentileRank(values: readonly number[], target: number): number {
  if (values.length === 0) return 50;
  const sorted = [...values].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < target).length;
  const equal = sorted.filter((v) => v === target).length;
  // Percentile = (below + 0.5 * equal) / total * 100
  return Math.round(((below + 0.5 * equal) / sorted.length) * 100);
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

/**
 * Compute benchmark for a company against its industry peers.
 * Requires minimum 5 peers (k-anonymity).
 */
export function computeBenchmark(
  targetCompanyId: string,
  peers: readonly PeerDataPoint[]
): BenchmarkResult | null {
  const targetPeer = peers.find((p) => p.companyId === targetCompanyId);
  if (!targetPeer) return null;

  const industryPeers = peers.filter((p) => p.industryCode === targetPeer.industryCode);

  // K-anonymity: minimum 5 peers required
  if (industryPeers.length < 5) return null;

  const totals = industryPeers.map((p) => p.totalScore);
  const eScores = industryPeers.map((p) => p.eScore);
  const sScores = industryPeers.map((p) => p.sScore);
  const gScores = industryPeers.map((p) => p.gScore);

  const totalPercentile = percentileRank(totals, targetPeer.totalScore);
  const ePercentile = percentileRank(eScores, targetPeer.eScore);
  const sPercentile = percentileRank(sScores, targetPeer.sScore);
  const gPercentile = percentileRank(gScores, targetPeer.gScore);

  const quartile: 1 | 2 | 3 | 4 =
    totalPercentile >= 75 ? 1 :
    totalPercentile >= 50 ? 2 :
    totalPercentile >= 25 ? 3 : 4;

  return {
    companyId: targetCompanyId,
    industryCode: targetPeer.industryCode,
    peerCount: industryPeers.length,
    totalPercentile,
    ePercentile,
    sPercentile,
    gPercentile,
    industryAvg: { total: average(totals), e: average(eScores), s: average(sScores), g: average(gScores) },
    industryMedian: { total: median(totals), e: median(eScores), s: median(sScores), g: median(gScores) },
    quartile,
    computedAt: new Date(),
  };
}
