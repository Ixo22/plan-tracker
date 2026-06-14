import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEVEL_RANGES: Record<number, [number, number]> = {
  1: [2, 10],
  2: [5, 20],
  3: [20, 40],
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const trackings = await prisma.tracking.findMany();
  const now = new Date();
  const updated: { level: number; nextInDays: number }[] = [];

  for (const t of trackings) {
    if (t.next_scheduled_at <= now) {
      const [min, max] = LEVEL_RANGES[t.level] ?? [5, 20];
      const days = randomInt(min, max);
      const next = new Date();
      next.setDate(next.getDate() + days);

      await prisma.tracking.update({
        where: { id: t.id },
        data: { last_done_at: now, next_scheduled_at: next },
      });

      updated.push({ level: t.level, nextInDays: days });
    }
  }

  return NextResponse.json({ processed: updated.length, updated });
}
