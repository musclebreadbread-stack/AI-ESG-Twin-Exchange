/**
 * Prisma client singleton — prevents multiple instances in dev hot-reload.
 * Note: PrismaClient is available after `prisma generate` runs.
 * For type safety during development without generation, we use a placeholder.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma client type generated at build
type PrismaClientType = any;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType | undefined };

export const prisma: PrismaClientType = globalForPrisma.prisma ?? null;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
