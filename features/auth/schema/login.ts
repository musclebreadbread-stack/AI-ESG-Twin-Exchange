/**
 * Task 6.1: Auth schemas — login, signup, token validation.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  legalName: z.string().min(1).max(200),
  countryCode: z.string().length(2),
  registrationNumber: z.string().max(64).optional(),
});

export const inviteSchema = z.object({
  email: z.string().email().max(320),
  role: z.enum(['Company_Admin', 'ESG_Manager', 'Data_Entry', 'Auditor', 'Viewer']),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32).max(128),
});

export const refreshSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
