import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LevelCounters from "@/components/LevelCounters";
import NavBar from "@/components/NavBar";
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
    <div className="min-h-screen bg-slate-50">
      <NavBar username={session.user.name ?? "admin"} current="dashboard" />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Seguimiento de los 3 niveles de actividad</p>
        </div>
        <LevelCounters trackings={trackings} suggestions={suggestions} />
      </main>
    </div>
  );
}
