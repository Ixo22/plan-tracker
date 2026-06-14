import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlanForm from "@/components/PlanForm";
import SignOutButton from "@/components/SignOutButton";

export default async function NewPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sugerir un plan</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hola, {session.user.name}</p>
          </div>
          <SignOutButton />
        </div>
        <PlanForm />
      </div>
    </main>
  );
}
