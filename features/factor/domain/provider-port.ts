/**
 * Task 31.1: Provider Port — the contract every emission factor adapter implements.
 */
import Decimal from 'decimal.js';

export interface ProviderMetadata {
  readonly providerId: string;
  readonly displayName: string;
  readonly sourceUrl: string;
  readonly licenseIdentifier: string | null;
  readonly commercialUseAllowed: boolean | null;
  readonly redistributionAllowed: boolean | null;
  readonly licenseVerifiedAt: Date | null;
  readonly licenseVerifiedBy: string | null;
  readonly licenseApprovedAt: Date | null;
  readonly licenseApprovedBy: string | null;
  readonly supportedCountries: readonly string[];
  readonly supportedActivityTypes: readonly string[];
  readonly supportedGases: readonly string[];
  readonly publishedYearRange: { from: number; to: number };
}

export interface ProviderLookupQuery {
  readonly countryCode: string;
  readonly energySource: string;
  readonly activityType: string;
  readonly gas: string;
  readonly asOf?: Date;
}

export interface ProviderFactorRecord {
  readonly countryCode: string;
  readonly energySource: string;
  readonly activityType: string;
  readonly gas: string;
  readonly value: Decimal;
  readonly unit: string;
  readonly netCalorificValue?: Decimal;
  readonly netCalorificValueUnit?: string;
  readonly ncvSource?: string;
  readonly validFrom: Date;
  readonly validTo?: Date;
  readonly publishedYear: number;
}

export interface ProviderIngestInput {
  readonly factorSetCode: string;
  readonly version: string;
}

/**
 * Provider interface — each adapter (KR-NIR, IPCC, etc.) implements this.
 */
export interface EmissionFactorProvider {
  readonly metadata: ProviderMetadata;
  lookup(q: ProviderLookupQuery): Promise<ProviderFactorRecord | null>;
  ingest(input: ProviderIngestInput): AsyncIterable<ProviderFactorRecord>;
}

/**
 * Check if a provider is approved for production use.
 * Provider with null licenseApprovedAt is blocked from production ingestion.
 */
export function isProviderApproved(metadata: ProviderMetadata): boolean {
  return metadata.licenseApprovedAt !== null;
}

/**
 * Check if factor values from this provider can be shown unmasked.
 * Requires both approval AND redistribution permission.
 */
export function canUnmaskFactorValues(metadata: ProviderMetadata): boolean {
  return metadata.licenseApprovedAt !== null && metadata.redistributionAllowed === true;
}
