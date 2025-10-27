import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient singleton instance
 * Prevents multiple instances of Prisma Client in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Utility function to safely disconnect from database
 * Useful for cleanup in serverless environments
 */
export async function disconnectDB() {
  await db.$disconnect();
}

/**
 * Health check function to verify database connection
 */
export async function checkDBConnection() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { connected: false, error };
  }
}

/**
 * Transaction helper with automatic error handling
 */
export async function withTransaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await db.$transaction(async (tx) => {
    return await fn(tx as PrismaClient);
  });
}

