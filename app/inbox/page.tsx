import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlanInbox from "@/components/PlanInbox";
import NavBar from "@/components/NavBar";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/plans/new");

  const plans = await prisma.plan.findMany({
    include: { created_by: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar username={session.user.name ?? "admin"} current="inbox" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Bandeja de entrada</h1>
          <p className="text-slate-500 text-sm mt-0.5">Asigna niveles a los planes sugeridos</p>
        </div>
        <PlanInbox plans={plans} />
      </main>
    </div>
  );
}
