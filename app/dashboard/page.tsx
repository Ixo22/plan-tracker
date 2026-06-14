import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LevelCounters from "@/components/LevelCounters";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";
import type { Plan } from "@prisma/client";

async function getRandomSuggestion(level: number): Promise<Plan | null> {
  const plans = await prisma.plan.findMany({ where: { assigned_level: level } });
  if (plans.length === 0) return null;
  return plans[Math.floor(Math.random() * plans.length)];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/plans/new");

  const trackings = await prisma.tracking.findMany({ orderBy: { level: "asc" } });
  const now = new Date();

  const suggestions: Record<number, Plan | null> = {};
  for (const t of trackings) {
    suggestions[t.level] = t.next_scheduled_at <= now ? await getRandomSuggestion(t.level) : null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hola, {session.user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/inbox"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Bandeja de entrada
            </Link>
            <SignOutButton />
          </div>
        </div>

        <LevelCounters trackings={trackings} suggestions={suggestions} />
      </div>
    </main>
  );
}
