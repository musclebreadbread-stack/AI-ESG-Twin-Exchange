/**
 * Task 29: Core ESG Field Catalog — field definitions and framework mapping.
 */

export type EsgAxis = 'E' | 'S' | 'G';
export type EsgDataType = 'integer' | 'decimal' | 'boolean' | 'enumeration' | 'string';
export type ReportingPeriod = 'monthly' | 'quarterly' | 'annual';

export interface EsgFieldDefinition {
  readonly fieldCode: string;
  readonly definitionVersion: string;
  readonly axis: EsgAxis;
  readonly domain: string;
  readonly dataType: EsgDataType;
  readonly unit?: string;
  readonly enumValues?: readonly string[];
  readonly reportingPeriod: ReportingPeriod;
  readonly isRequired: boolean;
  readonly requiresDenominatorBasis: boolean;
  readonly requiresVerification: boolean;
  readonly labelKo: string;
  readonly labelEn: string;
  readonly validFrom: Date;
  readonly validTo?: Date;
}

export interface FrameworkDefinition {
  readonly frameworkCode: string;
  readonly displayNameKo: string;
  readonly displayNameEn: string;
  readonly version: string;
  readonly publishedYear: number;
  readonly specUrl?: string;
  readonly isActive: boolean;
  readonly sortOrder: number;
}

export interface FrameworkItemCatalog {
  readonly frameworkCode: string;
  readonly itemCode: string;
  readonly itemVersion: string;
  readonly titleKo: string;
  readonly titleEn: string;
  readonly isMandatory: boolean;
}

export type MappingType = 'direct' | 'partial' | 'derived';

export interface FrameworkMapping {
  readonly id: string;
  readonly fieldCode: string;
  readonly definitionVersion: string;
  readonly frameworkCode: string;
  readonly itemCode: string;
  readonly itemVersion: string;
  readonly mappingType: MappingType;
  readonly mappingVersion: string;
}

/**
 * D6 confirmed framework order — all 8 mandatory.
 */
export const FRAMEWORK_ORDER: readonly string[] = [
  'KSSB', 'GRI', 'ISSB_S1', 'ISSB_S2', 'TCFD', 'CDP', 'ESRS', 'SASB',
] as const;

/**
 * Calculate field coverage for a given framework.
 */
export function calculateCoverage(
  catalogItems: readonly FrameworkItemCatalog[],
  mappings: readonly FrameworkMapping[],
  frameworkCode: string
): { total: number; covered: number; pct: number } {
  const mandatoryItems = catalogItems.filter(
    (i) => i.frameworkCode === frameworkCode && i.isMandatory
  );
  const total = mandatoryItems.length;
  if (total === 0) return { total: 0, covered: 0, pct: 0 };

  const mappedItemCodes = new Set(
    mappings
      .filter((m) => m.frameworkCode === frameworkCode)
      .map((m) => m.itemCode)
  );

  const covered = mandatoryItems.filter((i) => mappedItemCodes.has(i.itemCode)).length;
  const pct = Math.floor((covered / total) * 100);
  return { total, covered, pct };
}
