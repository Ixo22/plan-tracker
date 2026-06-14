import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { level } = body;

  if (![1, 2, 3].includes(level)) {
    return NextResponse.json({ error: "Level must be 1, 2 or 3" }, { status: 400 });
  }

  const plan = await prisma.plan.update({
    where: { id },
    data: { assigned_level: level },
  });

  return NextResponse.json(plan);
}
