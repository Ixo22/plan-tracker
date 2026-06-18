"use client";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import EditPlanModal from "./EditPlanModal";

type SortKey = "title" | "category" | "assigned_level";
type SortDir = "asc" | "desc";

type Plan = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  assigned_level: number | null;
  is_one_time: boolean;
  available_until: string | null;
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

const ENTERTAINMENT_SUBCATEGORIES = [
  { value: "cine", label: "Cine" },
  { value: "musical", label: "Musical" },
  { value: "teatro", label: "Teatro" },
  { value: "concierto", label: "Concierto" },
  { value: "exposicion", label: "Exposición" },
  { value: "escape_room", label: "Escape room" },
  { value: "otra", label: "Otra" },
];

const LEVEL_FILTERS = [
  { value: null, label: "Todos" },
  { value: 1, label: "N1" },
  { value: 2, label: "N2" },
  { value: 3, label: "N3" },
  { value: 0, label: "Sin nivel" },
] as const;

export default function PlanInbox({ plans: initialPlans }: { plans: Plan[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [togglingOneTime, setTogglingOneTime] = useState<string | null>(null);
  const [showPriorityDate, setShowPriorityDate] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleCategoryClick(cat: string) {
    setCategoryFilter(cat !== "todos" && categoryFilter === cat ? "todos" : cat);
    setSubcategoryFilter(null);
  }

  function handleSubcategoryClick(val: string) {
    setSubcategoryFilter(subcategoryFilter === val ? null : val);
  }

  function handleLevelClick(val: number | null) {
    setLevelFilter(levelFilter === val ? null : val);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const availableCategories = useMemo(() => {
    const cats = [...new Set(plans.map((p) => p.category))].sort();
    return ["todos", ...cats];
  }, [plans]);

  const availableUsers = useMemo(() => {
    return [...new Set(plans.map((p) => p.created_by.username))].sort();
  }, [plans]);

  const availableEntertainmentSubcategories = useMemo(() => {
    const subs = new Set(
      plans.filter((p) => p.category === "entretenimiento").map((p) => p.subcategory)
    );
    return ENTERTAINMENT_SUBCATEGORIES.filter((f) => subs.has(f.value));
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
      .filter((p) => !userFilter || p.created_by.username === userFilter)
      .filter((p) => {
        if (levelFilter === null) return true;
        if (levelFilter === 0) return !p.assigned_level;
        return p.assigned_level === levelFilter;
      });
    return [...base].sort((a, b) => {
      let av: string | number = a[sortKey] ?? "";
      let bv: string | number = b[sortKey] ?? "";
      if (sortKey === "assigned_level") { av = a.assigned_level ?? 99; bv = b.assigned_level ?? 99; }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [plans, categoryFilter, userFilter, levelFilter, sortKey, sortDir]);

  async function toggleOneTime(planId: string, current: boolean) {
    setTogglingOneTime(planId);
    await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_one_time: !current }),
    });
    setTogglingOneTime(null);
    startTransition(() => router.refresh());
  }

  function isPriorityOn(plan: Plan) {
    return plan.available_until !== null || showPriorityDate.has(plan.id);
  }

  function handlePriorityToggle(plan: Plan) {
    if (isPriorityOn(plan)) {
      setShowPriorityDate((prev) => { const s = new Set(prev); s.delete(plan.id); return s; });
      if (plan.available_until) saveAvailableUntil(plan.id, "");
    } else {
      setShowPriorityDate((prev) => new Set([...prev, plan.id]));
    }
  }

  async function saveAvailableUntil(planId: string, value: string) {
    await fetch(`/api/plans/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available_until: value || null }),
    });
    startTransition(() => router.refresh());
  }

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

  function handlePlanSaved(updated: Plan) {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPlan(null);
  }

  const pillBase = "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap";
  const pillOff = `${pillBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300`;
  const pillOn = `${pillBase} bg-slate-900 text-white`;
  const selectCls = "flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

  function levelPillOn(value: number) {
    if (value === 1) return `${pillBase} bg-emerald-500 text-white`;
    if (value === 2) return `${pillBase} bg-amber-500 text-white`;
    if (value === 3) return `${pillBase} bg-violet-500 text-white`;
    return pillOn;
  }

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div>
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={handlePlanSaved}
        />
      )}

      {/* ── MOBILE FILTERS ── */}
      <div className="md:hidden mb-4 space-y-2">
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={selectCls}
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "todos" ? "Todas las categorías" : cat}
              </option>
            ))}
          </select>
          <select
            value={levelFilter === null ? "" : String(levelFilter)}
            onChange={(e) => setLevelFilter(e.target.value === "" ? null : Number(e.target.value))}
            className={selectCls}
          >
            {availableLevels.map(({ value, label }) => (
              <option key={String(value)} value={value === null ? "" : String(value)}>{label}</option>
            ))}
          </select>
        </div>
        {availableUsers.length > 1 && (
          <select
            value={userFilter ?? ""}
            onChange={(e) => setUserFilter(e.target.value === "" ? null : e.target.value)}
            className={selectCls}
          >
            <option value="">Todos los usuarios</option>
            {availableUsers.map((u) => (
              <option key={u} value={u}>@{u}</option>
            ))}
          </select>
        )}
        {categoryFilter === "entretenimiento" && availableEntertainmentSubcategories.length > 0 && (
          <select
            value={subcategoryFilter ?? ""}
            onChange={(e) => setSubcategoryFilter(e.target.value === "" ? null : e.target.value)}
            className={selectCls}
          >
            <option value="">Todos los tipos</option>
            {availableEntertainmentSubcategories.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        <p className="text-right text-xs text-slate-400 font-medium">
          {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
        </p>
      </div>

      {/* ── DESKTOP FILTERS ── */}
      <div className="hidden md:block space-y-2 mb-5">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Cat.</span>
          {availableCategories.map((cat) => (
            <button key={cat} onClick={() => handleCategoryClick(cat)} className={categoryFilter === cat ? pillOn : pillOff}>
              {cat === "todos" ? "Todos" : cat}
            </button>
          ))}
        </div>
        {availableUsers.length > 1 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Usuario</span>
            <button onClick={() => setUserFilter(null)} className={userFilter === null ? pillOn : pillOff}>Todos</button>
            {availableUsers.map((u) => (
              <button key={u} onClick={() => setUserFilter(userFilter === u ? null : u)} className={userFilter === u ? pillOn : pillOff}>
                @{u}
              </button>
            ))}
          </div>
        )}
        {categoryFilter === "entretenimiento" && availableEntertainmentSubcategories.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Tipo</span>
            {availableEntertainmentSubcategories.map(({ value, label }) => (
              <button key={value} onClick={() => handleSubcategoryClick(value)} className={subcategoryFilter === value ? pillOn : pillOff}>
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Nivel</span>
          {availableLevels.map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => handleLevelClick(value)}
              className={value === null ? (levelFilter === null ? pillOn : pillOff) : (levelFilter === value ? levelPillOn(value) : pillOff)}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400 font-medium">
            {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {/* ── MOBILE: card list ── */}
      <div className="md:hidden">
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
                <div className="flex items-start gap-2 mb-1">
                  <p className="font-semibold text-slate-900 flex-1 leading-snug">{plan.title}</p>
                  {plan.assigned_level ? (
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${LEVEL_STYLES[plan.assigned_level as keyof typeof LEVEL_STYLES]}`}>
                      N{plan.assigned_level}
                    </span>
                  ) : (
                    <span className="shrink-0 text-slate-300 text-xs font-medium">Sin nivel</span>
                  )}
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="shrink-0 p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <EditIcon />
                  </button>
                  {confirmDelete === plan.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => deletePlan(plan.id)} className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-md">Eliminar</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(plan.id)} className="shrink-0 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <TrashIcon />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mb-3">
                  {plan.location && <span>📍 {plan.location}</span>}
                  <span>{plan.category}{plan.subcategory ? ` · ${plan.subcategory}` : ""}</span>
                  <span>@{plan.created_by.username}</span>
                </div>
                {plan.description && (
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{plan.description}</p>
                )}
                <div className="flex gap-2 mb-2">
                  {([1, 2, 3] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => assignLevel(plan.id, lvl)}
                      disabled={isPending || plan.assigned_level === lvl}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${plan.assigned_level === lvl ? LEVEL_ACTIVE[lvl] : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                    >
                      N{lvl}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    onClick={() => toggleOneTime(plan.id, plan.is_one_time)}
                    disabled={togglingOneTime === plan.id}
                    title="Plan de una sola vez"
                    className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors ${plan.is_one_time ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300"}`}
                  >
                    1×
                  </button>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPriorityOn(plan)}
                        onClick={() => handlePriorityToggle(plan)}
                        className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${isPriorityOn(plan) ? "bg-indigo-500" : "bg-slate-200"}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ${isPriorityOn(plan) ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                      <span className="text-xs text-slate-500">Urgente</span>
                      {plan.available_until && new Date(plan.available_until) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) && (
                        <span className="text-xs font-bold text-red-500">🔥</span>
                      )}
                    </div>
                    {isPriorityOn(plan) && (
                      <input
                        key={plan.available_until ?? "new"}
                        type="date"
                        defaultValue={plan.available_until ? plan.available_until.slice(0, 10) : ""}
                        onBlur={(e) => saveAvailableUntil(plan.id, e.target.value)}
                        autoFocus={!plan.available_until}
                        className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP: table ── */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-slate-400 text-center py-16 text-sm">No hay planes con estos filtros.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {(["title", "category", "assigned_level"] as const).map((key) => {
                    const labels: Record<SortKey, string> = { title: "Plan", category: "Categoría", assigned_level: "Nivel" };
                    const active = sortKey === key;
                    return (
                      <th key={key} onClick={() => toggleSort(key)} className="px-5 py-3 text-left cursor-pointer select-none group">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors ${active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"}`}>
                          {labels[key]}
                          <span className="text-[10px]">{active ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}</span>
                        </span>
                      </th>
                    );
                  })}
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Autor</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Flags</th>
                  <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Asignar</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className={`hover:bg-slate-50 transition-colors ${assigning === plan.id ? "opacity-40" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{plan.title}</p>
                      {plan.location && <p className="text-xs text-slate-400 mt-0.5">📍 {plan.location}</p>}
                      {plan.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{plan.description}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">
                      {plan.category}
                      {plan.subcategory && <span className="block text-xs text-slate-400">{plan.subcategory}</span>}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleOneTime(plan.id, plan.is_one_time)}
                          disabled={togglingOneTime === plan.id}
                          title="Plan de una sola vez"
                          className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors ${plan.is_one_time ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-300"}`}
                        >
                          1×
                        </button>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isPriorityOn(plan)}
                              onClick={() => handlePriorityToggle(plan)}
                              className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${isPriorityOn(plan) ? "bg-indigo-500" : "bg-slate-200"}`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ${isPriorityOn(plan) ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                            <span className="text-xs text-slate-500">Urgente</span>
                            {plan.available_until && new Date(plan.available_until) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) && (
                              <span className="text-xs font-bold text-red-500">🔥</span>
                            )}
                          </div>
                          {isPriorityOn(plan) && (
                            <input
                              key={plan.available_until ?? "new"}
                              type="date"
                              defaultValue={plan.available_until ? plan.available_until.slice(0, 10) : ""}
                              onBlur={(e) => saveAvailableUntil(plan.id, e.target.value)}
                              autoFocus={!plan.available_until}
                              className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1.5">
                        {([1, 2, 3] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => assignLevel(plan.id, lvl)}
                            disabled={isPending || plan.assigned_level === lvl}
                            title={`Nivel ${lvl}`}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${plan.assigned_level === lvl ? LEVEL_ACTIVE[lvl] : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar plan"
                        >
                          <EditIcon />
                        </button>
                        {confirmDelete === plan.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => deletePlan(plan.id)} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors">Eliminar</button>
                            <button onClick={() => setConfirmDelete(null)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-md transition-colors">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(plan.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar plan">
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
