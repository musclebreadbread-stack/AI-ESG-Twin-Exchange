/**
 * Task 6.2: Auth Service — login/signup/session logic.
 * No direct Prisma/Next.js import (R3 compliant).
 */
import { type Result, ok, err } from '@/core/domain/result';
import { sha256Hex } from '@/core/domain/canonical-json';

export type AuthError =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_NOT_VERIFIED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVITATION_EXPIRED'
  | 'INVITATION_REVOKED'
  | 'RATE_LIMITED';

export interface AuthServicePort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  createUser(input: CreateUserInput): Promise<UserRecord>;
  incrementFailedLogin(userId: string): Promise<void>;
  resetFailedLogin(userId: string): Promise<void>;
  lockAccount(userId: string, until: Date): Promise<void>;
  createSession(userId: string): Promise<SessionRecord>;
  verifyPasswordHash(hash: string, password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface UserRecord {
  id: string;
  email: string;
  status: string;
  passwordHash: string;
  failedLoginCount: number;
  lockedUntil: Date | null;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function login(
  port: AuthServicePort,
  email: string,
  password: string
): Promise<Result<SessionRecord, AuthError>> {
  const user = await port.findUserByEmail(email);
  if (!user) return err('INVALID_CREDENTIALS');

  // Check lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return err('ACCOUNT_LOCKED');
  }

  // Check email verification
  if (user.status === 'pending_verification') {
    return err('EMAIL_NOT_VERIFIED');
  }

  // Verify password
  const valid = await port.verifyPasswordHash(user.passwordHash, password);
  if (!valid) {
    await port.incrementFailedLogin(user.id);
    if (user.failedLoginCount + 1 >= MAX_FAILED_ATTEMPTS) {
      const until = new Date(Date.now() + LOCK_DURATION_MS);
      await port.lockAccount(user.id, until);
    }
    return err('INVALID_CREDENTIALS');
  }

  // Success — reset counter and create session
  await port.resetFailedLogin(user.id);
  const session = await port.createSession(user.id);
  return ok(session);
}

export async function signup(
  port: AuthServicePort,
  email: string,
  password: string
): Promise<Result<UserRecord, AuthError>> {
  const existing = await port.findUserByEmail(email);
  if (existing) return err('EMAIL_ALREADY_EXISTS');

  const passwordHash = await port.hashPassword(password);
  const user = await port.createUser({ email, passwordHash });
  return ok(user);
}
