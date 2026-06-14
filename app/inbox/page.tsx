import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlanInbox from "@/components/PlanInbox";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/plans/new");

  const plans = await prisma.plan.findMany({
    include: { created_by: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bandeja de entrada</h1>
            <p className="text-sm text-gray-500 mt-0.5">Asigna niveles a los planes sugeridos</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              ← Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>

        <PlanInbox plans={plans} />
      </div>
    </main>
  );
}
