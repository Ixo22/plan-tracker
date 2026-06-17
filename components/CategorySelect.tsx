"use client";
import { useState, useEffect, useRef } from "react";

type Category = { id: string; name: string };

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function CategorySelect({ value, onChange, required, className }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setSearch("");
  }, [open]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = categories.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase()
  );

  const selected = categories.find((c) => c.name === value);

  async function handleCreate() {
    const trimmed = search.trim();
    if (!trimmed) return;
    setCreating(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const data = await res.json();
    setCategories((prev) =>
      [...prev.filter((c) => c.id !== data.id), data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    onChange(data.name);
    setOpen(false);
    setCreating(false);
  }

  function handleSelect(cat: Category) {
    onChange(cat.name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${className} flex items-center justify-between text-left`}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.name : "Selecciona una categoría"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-2 pt-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered.length === 1) handleSelect(filtered[0]);
                  else if (search.trim() && !exactMatch) handleCreate();
                }
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Buscar o escribir nueva..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  cat.name === value
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {search.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium flex items-center gap-1.5 border-t border-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {creating ? "Añadiendo..." : `Añadir "${search.trim()}"`}
              </button>
            )}
            {filtered.length === 0 && !search.trim() && (
              <p className="px-3 py-2 text-sm text-slate-400">No hay categorías aún</p>
            )}
          </div>
        </div>
      )}

      {required && (
        <input
          type="text"
          value={value}
          readOnly
          required
          tabIndex={-1}
          className="sr-only"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
