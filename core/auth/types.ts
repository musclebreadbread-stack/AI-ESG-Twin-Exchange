/**
 * Task 4.1 / 6: Authentication types and session context.
 */

export interface AuthContext {
  readonly userId: string;
  readonly companyId: string;
  readonly roles: readonly string[];
  readonly orgNodeScope: readonly string[];
}

export type Permission =
  | 'activity:read'
  | 'activity:write'
  | 'factor:read'
  | 'factor:write'
  | 'twin:read'
  | 'twin:build'
  | 'report:read'
  | 'report:generate'
  | 'report:approve'
  | 'score:read'
  | 'score:compute'
  | 'scenario:read'
  | 'scenario:simulate'
  | 'org:read'
  | 'org:write'
  | 'user:invite'
  | 'user:manage'
  | 'audit:read'
  | 'admin:all';

export interface RoleDefinition {
  readonly name: string;
  readonly permissions: readonly Permission[];
}

export const ROLES: Record<string, RoleDefinition> = {
  Super_Admin: {
    name: 'Super_Admin',
    permissions: ['admin:all'],
  },
  Company_Admin: {
    name: 'Company_Admin',
    permissions: [
      'activity:read', 'activity:write',
      'factor:read', 'factor:write',
      'twin:read', 'twin:build',
      'report:read', 'report:generate', 'report:approve',
      'score:read', 'score:compute',
      'scenario:read', 'scenario:simulate',
      'org:read', 'org:write',
      'user:invite', 'user:manage',
      'audit:read',
    ],
  },
  ESG_Manager: {
    name: 'ESG_Manager',
    permissions: [
      'activity:read', 'activity:write',
      'factor:read',
      'twin:read', 'twin:build',
      'report:read', 'report:generate',
      'score:read', 'score:compute',
      'scenario:read', 'scenario:simulate',
      'org:read',
      'audit:read',
    ],
  },
  Data_Entry: {
    name: 'Data_Entry',
    permissions: ['activity:read', 'activity:write', 'org:read'],
  },
  Auditor: {
    name: 'Auditor',
    permissions: [
      'activity:read', 'factor:read', 'twin:read',
      'report:read', 'score:read', 'org:read', 'audit:read',
    ],
  },
  Viewer: {
    name: 'Viewer',
    permissions: ['activity:read', 'twin:read', 'report:read', 'score:read', 'org:read'],
  },
} as const;
