// ─────────────────────────────────────────────
// Prisma Client Singleton — Serverless & Local Resilient
// Supports Supabase PostgreSQL in production & staging (via @prisma/adapter-pg)
// with seamless self-healing fallback to LibSQL SQLite in /tmp for Vercel / Lambda
// ─────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveLibSqlConfig(): { url: string; authToken?: string } {
  // 1. Turso remote LibSQL configuration (production recommended for multi-lambda persistence)
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL || "";
  const remoteUrl = tursoUrl || (dbUrl.startsWith("libsql://") || (dbUrl.startsWith("https://") && !dbUrl.includes("supabase")) ? dbUrl : null);

  if (remoteUrl) {
    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
    return { url: remoteUrl, authToken };
  }

  // 2. Custom local SQLite file path
  if (
    dbUrl.startsWith("file:") &&
    !dbUrl.includes("./dev.db") &&
    !dbUrl.endsWith("/dev.db")
  ) {
    return { url: dbUrl };
  }

  // 3. Detect serverless / cloud execution environments (Vercel, AWS Lambda, read-only root)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT);

  if (isServerless) {
    const tmpDir = os.tmpdir();
    const targetDbPath = path.join(tmpDir, "ajo_prod.db");

    // Copy bundled seed database to /tmp if it doesn't exist yet or is empty
    try {
      const needsCopy = !fs.existsSync(/*turbopackIgnore: true*/ targetDbPath) || fs.statSync(/*turbopackIgnore: true*/ targetDbPath).size === 0;
      if (needsCopy) {
        const bundledPath = path.join(process.cwd(), "prisma", "dev.db");
        if (fs.existsSync(/*turbopackIgnore: true*/ bundledPath)) {
          fs.copyFileSync(bundledPath, targetDbPath);
        }
      }
    } catch (e) {
      console.warn("Could not copy bundled dev.db to /tmp:", e);
    }

    return { url: `file:${targetDbPath.replace(/\\/g, "/")}` };
  }

  // 4. Standard local development environment
  return { url: `file:${path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}` };
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPostgres =
    databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    try {
      // Supabase PostgreSQL mode with connection pooling (requires provider = "postgresql" in schema)
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (err: any) {
      console.warn(
        "PrismaPg adapter initialization failed (schema currently configured for SQLite/LibSQL). Falling back to LibSQL:",
        err?.message || err
      );
    }
  }

  // LibSQL mode (Turso remote, Vercel /tmp, or local dev)
  const libSqlConfig = resolveLibSqlConfig();
  const adapter = new PrismaLibSql(libSqlConfig);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
