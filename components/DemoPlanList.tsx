"use client";
import { useState, useMemo } from "react";

type Plan = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  level: number;
  author: string;
};

const LEVEL_BADGE: Record<number, string> = {
  1: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  2: "bg-amber-50 text-amber-700 border border-amber-200",
  3: "bg-violet-50 text-violet-700 border border-violet-200",
};

const LEVEL_ACTIVE: Record<number, string> = {
  1: "bg-emerald-500 text-white",
  2: "bg-amber-500 text-white",
  3: "bg-violet-500 text-white",
};

const LEVEL_FILTERS = [
  { value: null, label: "Todos" },
  { value: 1, label: "N1" },
  { value: 2, label: "N2" },
  { value: 3, label: "N3" },
] as const;

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

export default function DemoPlanList({ plans }: { plans: Plan[] }) {
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    const cats = [...new Set(plans.map((p) => p.category))].sort();
    return ["todos", ...cats];
  }, [plans]);

  const availableUsers = useMemo(() => {
    return [...new Set(plans.map((p) => p.author))].sort();
  }, [plans]);

  const availableLevels = useMemo(() => {
    const levels = new Set(plans.map((p) => p.level));
    return LEVEL_FILTERS.filter((f) => f.value === null || levels.has(f.value));
  }, [plans]);

  const filtered = useMemo(() => {
    return plans
      .filter((p) => categoryFilter === "todos" || p.category === categoryFilter)
      .filter((p) => !userFilter || p.author === userFilter)
      .filter((p) => levelFilter === null || p.level === levelFilter);
  }, [plans, categoryFilter, userFilter, levelFilter]);

  const pillBase = "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer";
  const pillOff = `${pillBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300`;
  const pillOn = `${pillBase} bg-slate-900 text-white`;
  const selectCls = "flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500";

  function levelPillOn(value: number) {
    if (value === 1) return `${pillBase} bg-emerald-500 text-white`;
    if (value === 2) return `${pillBase} bg-amber-500 text-white`;
    return `${pillBase} bg-violet-500 text-white`;
  }

  return (
    <div>
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
        <p className="text-right text-xs text-slate-400 font-medium">
          {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
        </p>
      </div>

      {/* ── DESKTOP FILTERS ── */}
      <div className="hidden md:block space-y-2 mb-5">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Cat.</span>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? pillOn : pillOff}
            >
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
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Nivel</span>
          {availableLevels.map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => setLevelFilter(levelFilter === value ? null : value)}
              className={
                value === null
                  ? levelFilter === null ? pillOn : pillOff
                  : levelFilter === value ? levelPillOn(value) : pillOff
              }
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400 font-medium">
            {filtered.length} plan{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {/* ── MOBILE: cards ── */}
      <div className="md:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 text-sm">No hay planes con estos filtros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start gap-2 mb-1">
                  <p className="font-semibold text-slate-900 flex-1 leading-snug">{plan.title}</p>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${LEVEL_BADGE[plan.level]}`}>
                    N{plan.level}
                  </span>
                  <span className="shrink-0 p-1 text-slate-200" title="Solo lectura"><EditIcon /></span>
                  <span className="shrink-0 p-1 text-slate-200" title="Solo lectura"><TrashIcon /></span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mb-1">
                  {plan.location && <span>📍 {plan.location}</span>}
                  <span>{plan.category}{plan.subcategory ? ` · ${plan.subcategory}` : ""}</span>
                  <span>@{plan.author}</span>
                </div>
                {plan.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{plan.description}</p>
                )}
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
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Categoría</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Nivel</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Autor</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Asignar</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{plan.title}</p>
                      {plan.location && <p className="text-xs text-slate-400 mt-0.5">📍 {plan.location}</p>}
                      {plan.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{plan.description}</p>}
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">
                      {plan.category}
                      {plan.subcategory && <span className="block text-xs text-slate-400">{plan.subcategory}</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${LEVEL_BADGE[plan.level]}`}>
                        N{plan.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">@{plan.author}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1.5">
                        {([1, 2, 3] as const).map((lvl) => (
                          <span
                            key={lvl}
                            className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                              plan.level === lvl ? LEVEL_ACTIVE[lvl] : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <span className="p-1.5 text-slate-200"><EditIcon /></span>
                        <span className="p-1.5 text-slate-200"><TrashIcon /></span>
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
