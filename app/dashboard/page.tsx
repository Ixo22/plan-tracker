import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LevelCounters, { type PlanSuggestion } from "@/components/LevelCounters";
import NavBar from "@/components/NavBar";

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

async function getSuggestions(level: number): Promise<PlanSuggestion[]> {
  const plans = await prisma.plan.findMany({
    where: { assigned_level: level },
    select: { id: true, title: true, location: true, category: true },
  });
  return pickRandom(plans, 3);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/plans/new");

  const trackings = await prisma.tracking.findMany({ orderBy: { level: "asc" } });

  const suggestions: Record<number, PlanSuggestion[]> = {};
  for (const t of trackings) {
    suggestions[t.level] = await getSuggestions(t.level);
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
