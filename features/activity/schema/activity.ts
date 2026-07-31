/**
 * Task 8: Activity Data schemas.
 */
import { z } from 'zod';

export const createActivitySchema = z.object({
  orgNodeId: z.string().uuid(),
  itemCode: z.string().min(1).max(32),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  originalValue: z.string().regex(/^\d+(\.\d{1,6})?$/),
  originalUnit: z.string().min(1).max(16),
  provenance: z.enum(['manual_entry', 'csv_import', 'api_import', 'iot_feed', 'estimated']).default('manual_entry'),
});

export const importCsvSchema = z.object({
  orgNodeId: z.string().uuid(),
  fileName: z.string().min(1).max(256),
  encoding: z.enum(['utf-8', 'euc-kr', 'cp949']).default('utf-8'),
});

export const updateActivitySchema = z.object({
  id: z.string().uuid(),
  originalValue: z.string().regex(/^\d+(\.\d{1,6})?$/).optional(),
  originalUnit: z.string().min(1).max(16).optional(),
  periodStart: z.string().date().optional(),
  periodEnd: z.string().date().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ImportCsvInput = z.infer<typeof importCsvSchema>;
