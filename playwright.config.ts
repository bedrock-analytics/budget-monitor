import { defineConfig } from "@playwright/test";

// Precondition (not orchestrated by this config): a dev server already running at baseURL,
// against a migrated Postgres reachable via DATABASE_URL, with NEXTAUTH_SECRET set the same
// way the server process has it (source .env.local before `npm run dev` and before this suite).
process.loadEnvFile?.(".env.local");

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "auth-matrix",
      testMatch: /auth-matrix\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
});
