/**
 * Permission guard — checks if an AuthContext has a required permission.
 */
import type { AuthContext, Permission } from './types';
import { ROLES } from './types';

/**
 * Returns true if the context has the given permission.
 * Super_Admin bypasses all checks via 'admin:all'.
 */
export function hasPermission(ctx: AuthContext, permission: Permission): boolean {
  for (const roleName of ctx.roles) {
    const role = ROLES[roleName];
    if (!role) continue;
    if (role.permissions.includes('admin:all')) return true;
    if (role.permissions.includes(permission)) return true;
  }
  return false;
}

/**
 * Throws a structured error if permission is missing.
 */
export function requirePermission(ctx: AuthContext, permission: Permission): void {
  if (!hasPermission(ctx, permission)) {
    throw new PermissionDeniedError(permission, ctx.userId);
  }
}

export class PermissionDeniedError extends Error {
  readonly permission: Permission;
  readonly userId: string;

  constructor(permission: Permission, userId: string) {
    super(`Permission '${permission}' denied for user '${userId}'`);
    this.name = 'PermissionDeniedError';
    this.permission = permission;
    this.userId = userId;
  }
}
