// ─────────────────────────────────────────────
// Prisma 7 Configuration
// ─────────────────────────────────────────────

import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = `file:${path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}`;

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || dbPath,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
