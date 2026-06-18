import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { level } = await params;
  const lvl = parseInt(level, 10);

  const plans = await prisma.plan.findMany({ where: { assigned_level: lvl } });

  const now = new Date();
  const cutoff = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const urgent = plans
    .filter((p) => p.available_until && new Date(p.available_until) <= cutoff)
    .sort((a, b) => new Date(a.available_until!).getTime() - new Date(b.available_until!).getTime());

  const normal = plans.filter((p) => !p.available_until || new Date(p.available_until) > cutoff);
  const shuffled = [...normal].sort(() => Math.random() - 0.5);

  const result = [...urgent, ...shuffled].slice(0, 3);
  return NextResponse.json(result);
}
