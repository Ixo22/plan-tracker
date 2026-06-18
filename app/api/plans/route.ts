import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    include: { created_by: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, location, description, category, subcategory, available_until } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "title and category are required" }, { status: 400 });
  }

  const plan = await prisma.plan.create({
    data: {
      title,
      location: location ?? null,
      description: description ?? null,
      category,
      subcategory: subcategory ?? null,
      available_until: available_until ? new Date(available_until) : null,
      created_by_id: session.user.id,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
