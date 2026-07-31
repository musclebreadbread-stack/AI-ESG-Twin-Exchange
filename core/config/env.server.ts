import 'server-only';
import { z } from 'zod';

const serverEnvSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(40),
  AI_PRIMARY_API_KEY: z.string().min(1),
  AI_ALTERNATE_API_KEY: z.string().min(1).optional(),
});

// Boot-time validation — process refuses to start if invalid
const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const violations = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(
    `[FATAL] Server environment validation failed. Fix the following:\n${violations}`
  );
}

// Production safety: ensure emulator/mock paths cannot activate
if (parsed.data.ENVIRONMENT === 'production') {
  const forbidden = ['MOCK_ENABLED', 'EMULATOR_HOST', 'USE_LOCAL_AUTH'];
  const found = forbidden.filter((k) => process.env[k] !== undefined);
  if (found.length > 0) {
    throw new Error(
      `[FATAL] Production environment contains forbidden dev/test variables: ${found.join(', ')}`
    );
  }
}

export const serverEnv = parsed.data;
