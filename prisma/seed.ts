import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function upsertByRole(
  role: "ADMIN" | "MEMBER",
  username: string,
  password: string
) {
  const hash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findFirst({ where: { role } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { username, password_hash: hash },
    });
    console.log(`  ${role}: actualizado → ${username}`);
  } else {
    await prisma.user.create({
      data: { username, password_hash: hash, role },
    });
    console.log(`  ${role}: creado → ${username}`);
  }
}

async function main() {
  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin";
  const memberUser = process.env.MEMBER_USERNAME ?? "member";
  const memberPass = process.env.MEMBER_PASSWORD ?? "member";

  await upsertByRole("ADMIN", adminUser, adminPass);
  await upsertByRole("MEMBER", memberUser, memberPass);

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

  const initialCategories = [
    "Aire libre",
    "Comida",
    "Comida casera",
    "Entretenimiento",
    "Viaje",
    "Cultura",
    "Detalle",
    "Cañas",
  ];

  for (const name of initialCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  Categorías: ${initialCategories.length} inicializadas`);

  console.log("Seed completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
