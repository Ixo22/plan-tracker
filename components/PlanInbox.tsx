"use client";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";

type SortKey = "title" | "category" | "assigned_level";
type SortDir = "asc" | "desc";

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

const LEVEL_STYLES = {
  1: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  2: "bg-amber-50 text-amber-700 border border-amber-200",
  3: "bg-violet-50 text-violet-700 border border-violet-200",
} as const;

const LEVEL_ACTIVE = {
  1: "bg-emerald-500 text-white",
  2: "bg-amber-500 text-white",
  3: "bg-violet-500 text-white",
} as const;

const CATEGORY_FILTERS = ["todos", "aire_libre", "comida", "entretenimiento", "viaje", "cultura"];

export default function PlanInbox({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const base = categoryFilter === "todos" ? plans : plans.filter((p) => p.category === categoryFilter);
    return [...base].sort((a, b) => {
      let av: string | number = a[sortKey] ?? "";
      let bv: string | number = b[sortKey] ?? "";
      if (sortKey === "assigned_level") {
        av = a.assigned_level ?? 99;
        bv = b.assigned_level ?? 99;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [plans, categoryFilter, sortKey, sortDir]);

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

  async function deletePlan(planId: string) {
    await fetch(`/api/plans/${planId}`, { method: "DELETE" });
    setConfirmDelete(null);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-5 items-center">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              categoryFilter === cat
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat === "todos" ? "Todos" : cat.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-400 font-medium">
          {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-center py-16 text-sm">No hay planes en esta categoría.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {(["title", "category", "assigned_level"] as const).map((key) => {
                  const labels: Record<SortKey, string> = { title: "Plan", category: "Categoría", assigned_level: "Nivel" };
                  const active = sortKey === key;
                  return (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="px-5 py-3 text-left cursor-pointer select-none group"
                    >
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors ${active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"}`}>
                        {labels[key]}
                        <span className="text-[10px]">
                          {active ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                        </span>
                      </span>
                    </th>
                  );
                })}
                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Autor</th>
                <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Asignar</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((plan) => (
                <tr
                  key={plan.id}
                  className={`hover:bg-slate-50 transition-colors ${assigning === plan.id ? "opacity-40" : ""}`}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{plan.title}</p>
                    {plan.location && (
                      <p className="text-xs text-slate-400 mt-0.5">📍 {plan.location}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600 capitalize text-sm">
                    {plan.category.replace("_", " ")}
                    {plan.subcategory && (
                      <span className="block text-xs text-slate-400 capitalize">{plan.subcategory}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {plan.assigned_level ? (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${LEVEL_STYLES[plan.assigned_level as keyof typeof LEVEL_STYLES]}`}>
                        N{plan.assigned_level}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-sm">{plan.created_by.username}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-1.5">
                      {([1, 2, 3] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => assignLevel(plan.id, lvl)}
                          disabled={isPending || plan.assigned_level === lvl}
                          title={`Nivel ${lvl}`}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                            plan.assigned_level === lvl
                              ? LEVEL_ACTIVE[lvl]
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {confirmDelete === plan.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-md transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(plan.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar plan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
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
