"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  title: string;
  location: string | null;
  category: string;
  subcategory: string | null;
  assigned_level: number | null;
  createdAt: Date;
  created_by: { username: string };
};

const LEVEL_COLORS = {
  1: "bg-green-100 text-green-700",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-purple-100 text-purple-700",
} as const;

const CATEGORY_FILTERS = ["todos", "aire_libre", "comida", "entretenimiento", "viaje", "cultura"];

export default function PlanInbox({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [assigning, setAssigning] = useState<string | null>(null);

  const filtered =
    categoryFilter === "todos" ? plans : plans.filter((p) => p.category === categoryFilter);

  async function assignLevel(planId: string, level: number) {
    setAssigning(planId);
    await fetch(`/api/plans/${planId}/assign-level`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });
    setAssigning(null);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              categoryFilter === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {cat === "todos" ? "Todos" : cat.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-gray-400">
          {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-16">No hay planes en esta categoría.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide">Plan</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide">Categoría</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide">Sugerido por</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide">Nivel actual</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wide">Asignar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((plan) => (
                <tr
                  key={plan.id}
                  className={`hover:bg-gray-50 transition-colors ${assigning === plan.id ? "opacity-50" : ""}`}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{plan.title}</p>
                    {plan.location && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 {plan.location}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 capitalize">
                    {plan.category.replace("_", " ")}
                    {plan.subcategory && (
                      <span className="block text-xs text-gray-400 mt-0.5 capitalize">
                        {plan.subcategory}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{plan.created_by.username}</td>
                  <td className="px-5 py-4 text-center">
                    {plan.assigned_level ? (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          LEVEL_COLORS[plan.assigned_level as keyof typeof LEVEL_COLORS]
                        }`}
                      >
                        Nivel {plan.assigned_level}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-1.5">
                      {([1, 2, 3] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => assignLevel(plan.id, lvl)}
                          disabled={isPending || plan.assigned_level === lvl}
                          title={`Asignar Nivel ${lvl}`}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                            plan.assigned_level === lvl
                              ? "bg-blue-600 text-white shadow-inner scale-110"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:scale-105"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
