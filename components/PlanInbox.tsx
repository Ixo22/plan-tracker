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

const FOOD_SUBCATEGORIES = [
  { value: "italiana", label: "Italiana" },
  { value: "sushi", label: "Sushi" },
  { value: "hamburguesas", label: "Hamburguesas" },
  { value: "mexicana", label: "Mexicana" },
  { value: "asiatica", label: "Asiática" },
  { value: "tapas", label: "Tapas" },
  { value: "otra", label: "Otra" },
];

const LEVEL_FILTERS = [
  { value: null, label: "Todos" },
  { value: 1, label: "N1" },
  { value: 2, label: "N2" },
  { value: 3, label: "N3" },
  { value: 0, label: "Sin nivel" },
] as const;

export default function PlanInbox({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleCategoryClick(cat: string) {
    const next = cat !== "todos" && categoryFilter === cat ? "todos" : cat;
    setCategoryFilter(next);
    setSubcategoryFilter(null);
  }

  function handleSubcategoryClick(val: string) {
    setSubcategoryFilter(subcategoryFilter === val ? null : val);
  }

  function handleLevelClick(val: number | null) {
    setLevelFilter(levelFilter === val ? null : val);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const availableCategories = useMemo(() => {
    const cats = new Set(plans.map((p) => p.category));
    return CATEGORY_FILTERS.filter((c) => c === "todos" || cats.has(c));
  }, [plans]);

  const availableFoodSubcategories = useMemo(() => {
    const subs = new Set(
      plans.filter((p) => p.category === "comida").map((p) => p.subcategory)
    );
    return FOOD_SUBCATEGORIES.filter((f) => subs.has(f.value));
  }, [plans]);

  const availableLevels = useMemo(() => {
    const levels = new Set(plans.map((p) => p.assigned_level));
    return LEVEL_FILTERS.filter((f) => {
      if (f.value === null) return true;
      if (f.value === 0) return levels.has(null);
      return levels.has(f.value);
    });
  }, [plans]);

  const filtered = useMemo(() => {
    const base = plans
      .filter((p) => categoryFilter === "todos" || p.category === categoryFilter)
      .filter((p) => !subcategoryFilter || p.subcategory === subcategoryFilter)
      .filter((p) => {
        if (levelFilter === null) return true;
        if (levelFilter === 0) return !p.assigned_level;
        return p.assigned_level === levelFilter;
      });
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
  }, [plans, categoryFilter, subcategoryFilter, levelFilter, sortKey, sortDir]);

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

  const pillBase = "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap";
  const pillOff = `${pillBase} bg-white text-slate-600 border border-slate-200 active:bg-slate-50`;
  const pillOn = `${pillBase} bg-slate-900 text-white`;

  function levelPillOn(value: number) {
    if (value === 1) return `${pillBase} bg-emerald-500 text-white`;
    if (value === 2) return `${pillBase} bg-amber-500 text-white`;
    if (value === 3) return `${pillBase} bg-violet-500 text-white`;
    return pillOn;
  }

  const SORT_LABELS: Record<SortKey, string> = { title: "Nombre", category: "Categoría", assigned_level: "Nivel" };

  return (
    <div>
      {/* Filter rows — each scrolls horizontally on narrow screens */}
      <div className="space-y-2 mb-4">
        <div className="overflow-x-auto pb-0.5 -mx-6 px-6">
          <div className="flex gap-2 items-center min-w-max">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">Cat.</span>
            {availableCategories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryClick(cat)} className={categoryFilter === cat ? pillOn : pillOff}>
                {cat === "todos" ? "Todos" : cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {categoryFilter === "comida" && availableFoodSubcategories.length > 0 && (
          <div className="overflow-x-auto pb-0.5 -mx-6 px-6">
            <div className="flex gap-2 items-center min-w-max">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">Tipo</span>
              {availableFoodSubcategories.map(({ value, label }) => (
                <button key={value} onClick={() => handleSubcategoryClick(value)} className={subcategoryFilter === value ? pillOn : pillOff}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto pb-0.5 -mx-6 px-6">
          <div className="flex gap-2 items-center min-w-max">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">Nivel</span>
            {availableLevels.map(({ value, label }) => (
              <button
                key={String(value)}
                onClick={() => handleLevelClick(value)}
                className={
                  value === null
                    ? levelFilter === null ? pillOn : pillOff
                    : levelFilter === value ? levelPillOn(value) : pillOff
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort + count bar */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-slate-400 font-medium shrink-0">Ordenar:</span>
        {(["title", "category", "assigned_level"] as const).map((key) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={`text-xs font-semibold flex items-center gap-0.5 transition-colors ${sortKey === key ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            {SORT_LABELS[key]}
            <span>{sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</span>
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">
          {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Card list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No hay planes con estos filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition-opacity ${assigning === plan.id ? "opacity-40" : ""}`}
            >
              {/* Top row: title + level badge + delete */}
              <div className="flex items-start gap-2 mb-1">
                <p className="font-semibold text-slate-900 flex-1 leading-snug">{plan.title}</p>
                {plan.assigned_level ? (
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${LEVEL_STYLES[plan.assigned_level as keyof typeof LEVEL_STYLES]}`}>
                    N{plan.assigned_level}
                  </span>
                ) : (
                  <span className="shrink-0 text-slate-300 text-xs font-medium">Sin nivel</span>
                )}
                {confirmDelete === plan.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => deletePlan(plan.id)} className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-md">
                      Eliminar
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(plan.id)}
                    className="shrink-0 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mb-3">
                {plan.location && <span>📍 {plan.location}</span>}
                <span className="capitalize">{plan.category.replace("_", " ")}{plan.subcategory ? ` · ${plan.subcategory}` : ""}</span>
                <span>@{plan.created_by.username}</span>
              </div>

              {/* Assign buttons */}
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => assignLevel(plan.id, lvl)}
                    disabled={isPending || plan.assigned_level === lvl}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      plan.assigned_level === lvl
                        ? LEVEL_ACTIVE[lvl]
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95"
                    }`}
                  >
                    N{lvl}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
