/**
 * Task 14: Report IR (Intermediate Representation) — framework-agnostic report structure.
 */
import { type Presented } from '@/core/domain/decimal';
import { canonicalJson, sha256Hex } from '@/core/domain/canonical-json';

export interface ReportDocument {
  readonly frameworkCode: string;
  readonly language: string;
  readonly period: { start: string; end: string };
  readonly sections: readonly ReportSection[];
}

export interface ReportSection {
  readonly sectionPath: string;
  readonly title: string;
  readonly blocks: readonly ReportBlock[];
}

export type ReportBlock =
  | { type: 'paragraph'; content: string; aiGenerated: boolean }
  | { type: 'metric'; itemCode: string; value: Presented; unit: string; isEstimated: boolean }
  | { type: 'table'; headers: string[]; rows: Presented[][] }
  | { type: 'chart'; chartType: string; data: unknown; altText: string }
  | { type: 'unmet'; reason: 'no_data' | 'unsupported' };

export interface RenderedFact {
  readonly sectionPath: string;
  readonly blockPath: string;
  readonly itemCode: string;
  readonly value: string;
  readonly unit: string;
}

export interface RenderedFactManifest {
  readonly facts: readonly RenderedFact[];
  readonly digest: string;
}

/**
 * Build the RenderedFactManifest from a report document's IR.
 * Facts are ordered by canonical key (sectionPath, blockPath, itemCode, value, unit).
 */
export function buildFactManifest(doc: ReportDocument): RenderedFactManifest {
  const facts: RenderedFact[] = [];
  let blockIndex = 0;

  for (const section of doc.sections) {
    for (const block of section.blocks) {
      if (block.type === 'metric') {
        facts.push({
          sectionPath: section.sectionPath,
          blockPath: `block_${blockIndex}`,
          itemCode: block.itemCode,
          value: block.value,
          unit: block.unit,
        });
      }
      blockIndex++;
    }
  }

  // Sort by canonical key for deterministic ordering
  facts.sort((a, b) => {
    const ka = `${a.sectionPath}|${a.blockPath}|${a.itemCode}|${a.value}|${a.unit}`;
    const kb = `${b.sectionPath}|${b.blockPath}|${b.itemCode}|${b.value}|${b.unit}`;
    return ka.localeCompare(kb);
  });

  const digest = sha256Hex(canonicalJson(facts));

  return { facts, digest };
}

/**
 * Verify that a rendered output's manifest matches the IR manifest.
 * Any mismatch → fail entire job, no partial output.
 */
export function verifyManifest(
  irManifest: RenderedFactManifest,
  renderedManifest: RenderedFactManifest
): { valid: boolean; mismatches: string[] } {
  if (irManifest.digest === renderedManifest.digest) {
    return { valid: true, mismatches: [] };
  }

  const mismatches: string[] = [];
  const irMap = new Map(irManifest.facts.map((f) => [`${f.sectionPath}|${f.itemCode}`, f]));

  for (const rf of renderedManifest.facts) {
    const key = `${rf.sectionPath}|${rf.itemCode}`;
    const irFact = irMap.get(key);
    if (!irFact) {
      mismatches.push(`Extra fact in rendered: ${key}`);
    } else if (irFact.value !== rf.value || irFact.unit !== rf.unit) {
      mismatches.push(`Mismatch at ${key}: IR=${irFact.value} ${irFact.unit}, Rendered=${rf.value} ${rf.unit}`);
    }
  }

  for (const [key] of irMap) {
    const found = renderedManifest.facts.find((f) => `${f.sectionPath}|${f.itemCode}` === key);
    if (!found) mismatches.push(`Missing in rendered: ${key}`);
  }

  return { valid: false, mismatches };
}
