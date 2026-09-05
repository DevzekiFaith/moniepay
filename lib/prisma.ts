// ─────────────────────────────────────────────
// Prisma Client Singleton
// Supports Supabase PostgreSQL in production & staging (via @prisma/adapter-pg)
// with seamless fallback to LibSQL SQLite for local dev
// ─────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPostgres =
    databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    // Supabase PostgreSQL mode with connection pooling
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // Local development / fallback mode using LibSQL
  const dbFilePath =
    databaseUrl.startsWith("file:") && !databaseUrl.includes("./dev.db")
      ? databaseUrl
      : `file:${path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}`;

  const adapter = new PrismaLibSql({
    url: dbFilePath,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
