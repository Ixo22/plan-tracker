import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin", 12);
  const memberHash = await bcrypt.hash("member", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password_hash: adminHash, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { username: "member" },
    update: {},
    create: { username: "member", password_hash: memberHash, role: "MEMBER" },
  });

  const now = new Date();
  for (const level of [1, 2, 3] as const) {
    const daysAhead = level === 1 ? 7 : level === 2 ? 14 : 30;
    const next = new Date(now.getTime() + daysAhead * 86_400_000);

    await prisma.tracking.upsert({
      where: { level },
      update: {},
      create: { level, last_done_at: now, next_scheduled_at: next },
    });
  }

  console.log("Seed completado:");
  console.log("  admin / admin  →  rol ADMIN  (va al dashboard)");
  console.log("  member / member  →  rol MEMBER  (va al formulario)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
