import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN" && plan.created_by_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, location, description, category, subcategory } = await req.json();

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      title: title ?? plan.title,
      location: location !== undefined ? (location || null) : plan.location,
      description: description !== undefined ? (description || null) : plan.description,
      category: category ?? plan.category,
      subcategory: subcategory !== undefined ? (subcategory || null) : plan.subcategory,
    },
    include: { created_by: { select: { username: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.plan.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
