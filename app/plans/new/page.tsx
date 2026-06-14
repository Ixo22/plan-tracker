import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlanForm from "@/components/PlanForm";
import SignOutButton from "@/components/SignOutButton";

export default async function NewPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight">Plan Tracker</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{session.user.name}</span>
            <SignOutButton className="text-xs text-slate-400 hover:text-white transition-colors" />
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sugerir un plan</h1>
          <p className="text-slate-500 text-sm mt-0.5">Añade una idea para hacer juntos</p>
        </div>
        <PlanForm />
      </main>
    </div>
  );
}
