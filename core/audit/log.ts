/**
 * Task 15: Audit Log — append-only hash chain.
 */
import { canonicalJson, sha256Hex } from '@/core/domain/canonical-json';

export interface AuditEntry {
  readonly companyId?: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly beforeState?: unknown;
  readonly afterState?: unknown;
}

export interface AuditChainEntry extends AuditEntry {
  readonly sequence: bigint;
  readonly payloadHash: string;
  readonly prevHash: string | null;
  readonly chainHash: string;
  readonly occurredAt: Date;
}

/**
 * Compute hash chain values for a new audit entry.
 */
export function computeChainEntry(
  entry: AuditEntry,
  prevHash: string | null,
  sequence: bigint
): AuditChainEntry {
  const payloadHash = sha256Hex(canonicalJson({
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    beforeState: entry.beforeState,
    afterState: entry.afterState,
    companyId: entry.companyId,
    actorUserId: entry.actorUserId,
  }));

  const chainHash = sha256Hex((prevHash ?? '') + payloadHash);

  return {
    ...entry,
    sequence,
    payloadHash,
    prevHash,
    chainHash,
    occurredAt: new Date(),
  };
}

/**
 * Verify integrity of a chain segment.
 */
export function verifyChain(entries: readonly AuditChainEntry[]): {
  valid: boolean;
  brokenAt?: bigint;
} {
  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i]!;
    const prev = entries[i - 1]!;

    if (entry.prevHash !== prev.chainHash) {
      return { valid: false, brokenAt: entry.sequence };
    }

    const expectedChain = sha256Hex((entry.prevHash ?? '') + entry.payloadHash);
    if (entry.chainHash !== expectedChain) {
      return { valid: false, brokenAt: entry.sequence };
    }
  }
  return { valid: true };
}
