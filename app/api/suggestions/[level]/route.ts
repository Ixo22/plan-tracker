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
  const shuffled = [...plans].sort(() => Math.random() - 0.5).slice(0, 3);

  return NextResponse.json(shuffled);
}
