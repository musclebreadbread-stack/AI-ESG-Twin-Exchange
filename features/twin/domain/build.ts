/**
 * Task 11: Digital Twin Build — assembles all ESG domains into a versioned snapshot.
 */
import { type Exact, exact } from '@/core/domain/decimal';
import { canonicalJson, sha256Hex } from '@/core/domain/canonical-json';

export const TWIN_DOMAINS = [
  'energy', 'water', 'waste', 'emission', 'supply_chain',
  'safety', 'human_rights', 'labor', 'ethics', 'governance',
  'community', 'product',
] as const;

export type TwinDomain = typeof TWIN_DOMAINS[number];

export interface TwinNodeInput {
  readonly domain: TwinDomain;
  readonly nodePath: string;
  readonly value: unknown;
  readonly provenance: 'user_input' | 'calculated' | 'estimated';
}

export interface TwinBuildResult {
  readonly nodeCount: number;
  readonly domainStats: readonly DomainStat[];
  readonly blobs: readonly BlobEntry[];
}

export interface DomainStat {
  readonly domain: TwinDomain;
  readonly requiredFieldCount: number;
  readonly filledFieldCount: number;
  readonly completenessPct: number;
  readonly state: '미입력' | '부분' | '충족';
}

export interface BlobEntry {
  readonly hash: string;
  readonly domain: TwinDomain;
  readonly nodePath: string;
  readonly provenance: string;
  readonly payload: unknown;
}

/**
 * Build twin node values, computing content-addressed blobs.
 */
export function buildTwinVersion(
  inputs: readonly TwinNodeInput[],
  requiredFieldCounts: Record<TwinDomain, number>
): TwinBuildResult {
  const blobs: BlobEntry[] = [];
  const domainFills: Record<string, number> = {};

  for (const input of inputs) {
    const serialized = canonicalJson(input.value);
    const hash = sha256Hex(serialized);

    blobs.push({
      hash,
      domain: input.domain,
      nodePath: input.nodePath,
      provenance: input.provenance,
      payload: input.value,
    });

    domainFills[input.domain] = (domainFills[input.domain] ?? 0) + 1;
  }

  const domainStats: DomainStat[] = TWIN_DOMAINS.map((domain) => {
    const required = requiredFieldCounts[domain] ?? 0;
    const filled = domainFills[domain] ?? 0;
    const pct = required === 0 ? 0 : Math.floor((filled / required) * 100);
    const state: DomainStat['state'] = filled === 0 ? '미입력' : pct >= 100 ? '충족' : '부분';
    return { domain, requiredFieldCount: required, filledFieldCount: filled, completenessPct: pct, state };
  });

  return { nodeCount: blobs.length, domainStats, blobs };
}
