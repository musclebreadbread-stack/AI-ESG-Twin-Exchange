/**
 * Task 9: Factor Registry schemas.
 */
import { z } from 'zod';

export const factorLookupSchema = z.object({
  countryCode: z.string().length(2),
  energySource: z.string().min(1).max(64),
  activityType: z.string().min(1).max(64),
  gas: z.enum(['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3', 'CO2_biogenic']),
  asOf: z.string().date().optional(),
});

export const factorSetCreateSchema = z.object({
  code: z.string().min(1).max(32),
  version: z.string().min(1).max(16),
  sourceName: z.string().min(1).max(128),
  sourceUrl: z.string().url().optional(),
  redistributionAllowed: z.boolean().default(false),
  licenseNote: z.string().optional(),
  publishedYear: z.number().int().min(1990).max(2100),
  providerId: z.string().min(1).max(32),
});

export type FactorLookupInput = z.infer<typeof factorLookupSchema>;
export type FactorSetCreateInput = z.infer<typeof factorSetCreateSchema>;
