import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const raw = process.env.ADMIN_BOOTSTRAP_EMAILS ?? "";
  const emails = raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) {
    console.warn("ADMIN_BOOTSTRAP_EMAILS is not set — no admin bootstrapped.");
    return;
  }

  for (const email of emails) {
    const user = await db.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: { email, role: "ADMIN" },
    });
    console.log(`Bootstrapped ADMIN: ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
