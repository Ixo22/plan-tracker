import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlanForm from "@/components/PlanForm";
import NavBar from "@/components/NavBar";
import SignOutButton from "@/components/SignOutButton";

export default async function NewPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50">
      {isAdmin ? (
        <NavBar username={session.user.name ?? "admin"} current="nuevo" />
      ) : (
        <header className="bg-slate-900 text-white">
          <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
            <span className="font-bold tracking-tight">Plan Tracker</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{session.user.name}</span>
              <SignOutButton className="text-xs text-slate-400 hover:text-white transition-colors" />
            </div>
          </div>
        </header>
      )}
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Nuevo plan</h1>
          <p className="text-slate-500 text-sm mt-0.5">Añade una idea para hacer juntos</p>
        </div>
        <PlanForm />
      </main>
    </div>
  );
}
