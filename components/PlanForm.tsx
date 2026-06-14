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

export default function PlanForm() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function reset() {
    setTitle("");
    setLocation("");
    setCategory("");
    setSubcategory("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location: location || null, category, subcategory: subcategory || null }),
    });

    if (res.ok) {
      reset();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ej: Cena romántica en la playa"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Barceloneta, Barcelona"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
          required
          className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {category === "comida" && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de comida
          </label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
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
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Sugerir plan"}
      </button>

      {status === "success" && (
        <p className="text-green-600 text-sm text-center font-medium">¡Plan añadido con éxito!</p>
      )}
      {status === "error" && (
        <p className="text-red-500 text-sm text-center">Error al guardar. Inténtalo de nuevo.</p>
      )}
    </form>
  );
}
