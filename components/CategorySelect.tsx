"use client";
import { useState, useEffect, useRef } from "react";

type Category = { id: string; name: string };

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function CategorySelect({
  value,
  onChange,
  required,
  placeholder = "Selecciona una categoría",
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setCategories(data) : [])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const filtered = search.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  const exactMatch = categories.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase()
  );

  const showAddOption = search.trim().length > 0 && !exactMatch;

  async function handleCreate() {
    const trimmed = search.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    try {
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
    } finally {
      setCreating(false);
      setOpen(false);
      setSearch("");
    }
  }

  function handleSelect(cat: Category) {
    onChange(cat.name);
    setOpen(false);
    setSearch("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) handleSelect(filtered[0]);
      else if (showAddOption) handleCreate();
    }
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3.5 py-2.5 text-sm bg-white transition-all ${
          open
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <span className={value ? "text-slate-900 font-medium" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-slate-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar categoría..."
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none min-w-0"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1">
            {loading && (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">Cargando...</p>
            )}

            {!loading && filtered.length === 0 && !showAddOption && (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">
                {search ? "Sin resultados" : "No hay categorías"}
              </p>
            )}

            {!loading && filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                  cat.name === value
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat.name}
                {cat.name === value && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}

            {showAddOption && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 border-t border-slate-100 mt-1 disabled:opacity-60 transition-colors"
              >
                <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                {creating ? "Añadiendo..." : `Añadir "${search.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}

      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          value={value}
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}
