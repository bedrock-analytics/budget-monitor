import { test as setup } from "@playwright/test";
import { PrismaClient, type UserRole } from "@prisma/client";
import { encode } from "next-auth/jwt";

import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = path.join(__dirname, ".auth");

const PERSONAS: { email: string; role: UserRole; file: string }[] = [
  { email: "e2e-admin@example.com", role: "ADMIN", file: "admin.json" },
  { email: "e2e-manager@example.com", role: "MANAGER", file: "manager.json" },
  { email: "e2e-user@example.com", role: "USER", file: "user.json" },
];

setup("provision test personas and mint sessions", async () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET must be set (source .env.local) before running the e2e suite");
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const db = new PrismaClient();

  try {
    for (const persona of PERSONAS) {
      await db.user.upsert({
        where: { email: persona.email },
        create: { email: persona.email, name: persona.email, role: persona.role, isActive: true },
        update: { role: persona.role, isActive: true, allowedMenus: [] },
      });

      const now = Math.floor(Date.now() / 1000);
      const token = await encode({
        token: { sub: persona.email, email: persona.email, name: persona.email, iat: now, exp: now + 60 * 60 * 24 },
        secret,
      });

      const storageState = {
        cookies: [
          {
            name: "next-auth.session-token",
            value: token,
            domain: "localhost",
            path: "/",
            expires: now + 60 * 60 * 24,
            httpOnly: true,
            secure: false,
            sameSite: "Lax" as const,
          },
        ],
        origins: [],
      };

      fs.writeFileSync(path.join(AUTH_DIR, persona.file), JSON.stringify(storageState));
    }
  } finally {
    await db.$disconnect();
  }
});
