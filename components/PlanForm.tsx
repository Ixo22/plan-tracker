"use client";
import { useState } from "react";
import CategorySelect from "./CategorySelect";

const ENTERTAINMENT_SUBCATEGORIES = [
  { value: "cine", label: "Cine" },
  { value: "musical", label: "Musical" },
  { value: "teatro", label: "Teatro" },
  { value: "concierto", label: "Concierto" },
  { value: "exposicion", label: "Exposición" },
  { value: "escape_room", label: "Escape room" },
  { value: "otra", label: "Otra" },
];

type Status = "idle" | "loading" | "success" | "error";

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white";

export default function PlanForm() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [availableUntil, setAvailableUntil] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        location: location || null,
        description: description || null,
        category,
        subcategory: subcategory || null,
        available_until: isPriority && availableUntil ? availableUntil : null,
      }),
    });

    if (res.ok) {
      setTitle("");
      setLocation("");
      setDescription("");
      setCategory("");
      setSubcategory("");
      setIsPriority(false);
      setAvailableUntil("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Nombre del plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ej: Cena romántica en la playa"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Ubicación{" "}
          <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Principe Pío, Madrid"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Descripción{" "}
          <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Detalles del plan, qué incluye, notas..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Categoría <span className="text-red-500">*</span>
        </label>
        <CategorySelect
          value={category}
          onChange={(v) => { setCategory(v); setSubcategory(""); }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Subcategoría{" "}
          <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder="Ej: italiana, sushi, tapas..."
          className={inputCls}
        />
      </div>

      {category === "entretenimiento" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tipo de entretenimiento
          </label>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={inputCls}>
            <option value="">Selecciona el tipo</option>
            {ENTERTAINMENT_SUBCATEGORIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">¿Plan urgente o con fecha límite?</p>
            <p className="text-xs text-slate-400 mt-0.5">Se priorizará automáticamente en las sugerencias</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPriority}
            onClick={() => { setIsPriority(!isPriority); if (isPriority) setAvailableUntil(""); }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isPriority ? "bg-indigo-600" : "bg-slate-200"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isPriority ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        {isPriority && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Disponible hasta</label>
            <input
              type="date"
              value={availableUntil}
              onChange={(e) => setAvailableUntil(e.target.value)}
              autoFocus
              className={inputCls}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-60 text-sm"
      >
        {status === "loading" ? "Guardando..." : "Sugerir plan"}
      </button>

      {status === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5 text-center">
          <p className="text-emerald-700 text-sm font-semibold">¡Plan añadido con éxito!</p>
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-center">
          <p className="text-red-700 text-sm font-semibold">Error al guardar. Inténtalo de nuevo.</p>
        </div>
      )}
    </form>
  );
}
