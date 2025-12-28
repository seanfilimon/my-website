import { PrismaClient } from "@/src/generated/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

/**
 * Get SSL configuration for database connection
 * Uses CA certificate from ./ca-certificate.crt in project root
 */
function getSSLConfig(): false | { rejectUnauthorized: boolean; ca?: string } {
  const caPath = path.join(process.cwd(), 'ca-certificate.crt');
  
  // Check if CA certificate exists
  if (fs.existsSync(caPath)) {
    return {
      rejectUnauthorized: false,
      ca: fs.readFileSync(caPath).toString(),
    };
  }
  
  // Fallback: allow self-signed certificates
  return {
    rejectUnauthorized: false,
  };
}

/**
 * Create PostgreSQL connection pool with SSL support
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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
    adapter: new PrismaPg(pool),
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

