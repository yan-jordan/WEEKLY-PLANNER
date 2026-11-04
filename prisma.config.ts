import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // `prisma generate` runs on npm install and needs no database, so a fresh clone without
  // .env can still install. Migrate commands need DATABASE_URL to be set.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
