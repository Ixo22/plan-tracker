"use client";
import { useState } from "react";

const CATEGORIES = [
  { value: "aire_libre", label: "Aire libre" },
  { value: "comida", label: "Comida" },
  { value: "entretenimiento", label: "Entretenimiento" },
  { value: "viaje", label: "Viaje" },
  { value: "cultura", label: "Cultura" },
];

const FOOD_SUBCATEGORIES = [
  { value: "italiana", label: "Italiana" },
  { value: "sushi", label: "Sushi" },
  { value: "hamburguesas", label: "Hamburguesas" },
  { value: "mexicana", label: "Mexicana" },
  { value: "asiatica", label: "Asiática" },
  { value: "tapas", label: "Tapas" },
  { value: "otra", label: "Otra" },
];

type Status = "idle" | "loading" | "success" | "error";

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white";

export default function PlanForm() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location: location || null, category, subcategory: subcategory || null }),
    });

    if (res.ok) {
      setTitle(""); setLocation(""); setCategory(""); setSubcategory("");
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
          placeholder="Ej: Barceloneta, Barcelona"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
          required
          className={inputCls}
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {category === "comida" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tipo de comida
          </label>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={inputCls}>
            <option value="">Selecciona el tipo</option>
            {FOOD_SUBCATEGORIES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

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
