import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

// Validate at module load
const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  const violations = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  throw new Error(
    `[FATAL] Public environment validation failed:\n${violations}`
  );
}

// CRITICAL: Service role key must NEVER have NEXT_PUBLIC_ prefix
if ('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY' in process.env) {
  throw new Error(
    '[FATAL] SUPABASE_SERVICE_ROLE_KEY must NOT have NEXT_PUBLIC_ prefix — it would be exposed to browsers'
  );
}

export const publicEnv = parsed.data;
