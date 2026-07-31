/**
 * Task 7: Organization schemas.
 */
import { z } from 'zod';

export const createOrgNodeSchema = z.object({
  parentId: z.string().uuid().optional(),
  kind: z.enum(['company', 'division', 'site', 'facility']),
  name: z.string().min(1).max(100),
  consolidationApproach: z.enum(['operational_control', 'financial_control', 'equity_share']).default('operational_control'),
  equitySharePct: z.number().min(0).max(100).optional(),
  operationStartDate: z.string().date(),
  operationEndDate: z.string().date().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateOrgNodeSchema = createOrgNodeSchema.partial().extend({
  id: z.string().uuid(),
});

export const reparentOrgNodeSchema = z.object({
  nodeId: z.string().uuid(),
  newParentId: z.string().uuid(),
});

export type CreateOrgNodeInput = z.infer<typeof createOrgNodeSchema>;
export type UpdateOrgNodeInput = z.infer<typeof updateOrgNodeSchema>;
