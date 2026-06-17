import Link from "next/link";

const LEVEL_CONFIG = {
  1: {
    label: "Nivel 1",
    description: "Planes diarios",
    accent: "border-l-emerald-500",
    dot: "bg-emerald-500",
    numColor: "text-emerald-600",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-800",
    daysLeft: 3,
  },
  2: {
    label: "Nivel 2",
    description: "Planes intermedios",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
    numColor: "text-amber-600",
    badge: "bg-amber-50 border-amber-200 text-amber-800",
    daysLeft: 14,
  },
  3: {
    label: "Nivel 3",
    description: "Planes especiales",
    accent: "border-l-violet-500",
    dot: "bg-violet-500",
    numColor: "text-violet-600",
    badge: "bg-violet-50 border-violet-200 text-violet-800",
    daysLeft: 31,
  },
} as const;

const SUGGESTIONS: Record<number, string[]> = {
  1: ["Cena en casa — pasta", "Cañas en el barrio", "Ver una peli en Netflix"],
  2: ["Fin de semana en la sierra", "Exposición en el Reina Sofía", "Senderismo en Guadarrama"],
  3: ["Viaje a Lisboa", "Concierto en el WiZink", "Festival de verano"],
};

const PLANS = [
  { id: "1", title: "Cena en casa — pasta carbonara", location: "Madrid", category: "Comida casera", subcategory: null, description: "Con la receta de la abuela, vino incluido.", level: 1, author: "member" },
  { id: "2", title: "Paseo por el parque del Retiro", location: "Madrid", category: "Aire libre", subcategory: null, description: null, level: 1, author: "admin" },
  { id: "3", title: "Cañas en Malasaña", location: "Madrid", category: "Cañas", subcategory: null, description: "Bar de siempre, esquina Pez.", level: 1, author: "member" },
  { id: "4", title: "Flores para sorprenderla", location: null, category: "Detalle", subcategory: null, description: "Rosas rojas o tulipanes.", level: 1, author: "admin" },
  { id: "5", title: "Fin de semana en la sierra", location: "Cercedilla", category: "Viaje", subcategory: null, description: null, level: 2, author: "admin" },
  { id: "6", title: "Cata de vinos en bodega", location: "Ribera del Duero", category: "Comida", subcategory: "maridaje", description: null, level: 2, author: "member" },
  { id: "7", title: "Exposición en el Reina Sofía", location: "Madrid", category: "Cultura", subcategory: null, description: "Ver el Guernica en persona.", level: 2, author: "member" },
  { id: "8", title: "Senderismo en Guadarrama", location: "Sierra de Guadarrama", category: "Aire libre", subcategory: null, description: null, level: 2, author: "admin" },
  { id: "9", title: "Viaje a Lisboa", location: "Lisboa, Portugal", category: "Viaje", subcategory: null, description: "Fado, pastéis de nata y el Tajo.", level: 3, author: "member" },
  { id: "10", title: "Concierto en el WiZink Center", location: "Madrid", category: "Entretenimiento", subcategory: null, description: null, level: 3, author: "member" },
  { id: "11", title: "Bombones artesanos", location: null, category: "Detalle", subcategory: null, description: "Chocolatería Valor, caja grande.", level: 3, author: "admin" },
  { id: "12", title: "Festival de música de verano", location: "Valencia", category: "Entretenimiento", subcategory: null, description: null, level: 3, author: "member" },
];

const LEVEL_BADGE: Record<number, string> = {
  1: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  2: "bg-amber-50 text-amber-700 border border-amber-200",
  3: "bg-violet-50 text-violet-700 border border-violet-200",
};

const DEMO_USERS = ["admin", "member"];
const DEMO_CATEGORIES = ["Todos", "Aire libre", "Comida", "Comida casera", "Entretenimiento", "Viaje", "Cultura", "Detalle", "Cañas"];

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

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight">Plan Tracker</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-400">Vista previa pública</span>
            <Link
              href="/login"
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-indigo-600 text-white text-center py-2.5 px-4 text-sm font-medium">
        Modo demo — solo lectura · Los datos son de ejemplo
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* ── Dashboard section ── */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500 text-sm mt-0.5">Seguimiento de los 3 niveles de actividad</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {([1, 2, 3] as const).map((lvl) => {
              const cfg = LEVEL_CONFIG[lvl];
              return (
                <div key={lvl} className={`bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 ${cfg.accent} overflow-hidden`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${cfg.dot}`} />
                        <div>
                          <p className="font-bold text-slate-900">{cfg.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{cfg.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center py-4 border-t border-slate-100">
                      <span className={`text-7xl font-black tabular-nums leading-none ${cfg.numColor}`}>
                        {cfg.daysLeft}
                      </span>
                      <p className="text-sm font-medium text-slate-600 mt-2">días restantes</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sugerencias</p>
                    <ul className="space-y-1.5">
                      {SUGGESTIONS[lvl].map((s) => (
                        <li key={s} className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
                            N{lvl}
                          </span>
                          <span className="text-sm text-slate-700 truncate">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Inbox section ── */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Bandeja de entrada</h2>
            <p className="text-slate-500 text-sm mt-0.5">Planes sugeridos con nivel asignado</p>
          </div>

          {/* Filters preview */}
          <div className="space-y-2 mb-5 pointer-events-none select-none">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Cat.</span>
              {DEMO_CATEGORIES.map((cat, i) => (
                <span
                  key={cat}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    i === 0
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Usuario</span>
              <span className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-900 text-white">Todos</span>
              {DEMO_USERS.map((u) => (
                <span key={u} className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-white text-slate-600 border border-slate-200">
                  @{u}
                </span>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-16 shrink-0">Nivel</span>
              {["Todos", "N1", "N2", "N3", "Sin nivel"].map((l, i) => (
                <span key={l} className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {PLANS.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-start gap-2 mb-1">
                  <p className="font-semibold text-slate-900 flex-1 leading-snug">{plan.title}</p>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${LEVEL_BADGE[plan.level]}`}>
                    N{plan.level}
                  </span>
                  <span className="shrink-0 p-1 text-slate-200">
                    <EditIcon />
                  </span>
                  <span className="shrink-0 p-1 text-slate-200">
                    <TrashIcon />
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 mb-1">
                  {plan.location && <span>📍 {plan.location}</span>}
                  <span>{plan.category}{plan.subcategory ? ` · ${plan.subcategory}` : ""}</span>
                  <span>@{plan.author}</span>
                </div>
                {plan.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                {PLANS.map((plan) => (
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
                              plan.level === lvl
                                ? lvl === 1 ? "bg-emerald-500 text-white" : lvl === 2 ? "bg-amber-500 text-white" : "bg-violet-500 text-white"
                                : "bg-slate-100 text-slate-400"
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
          </div>
        </section>

        {/* ── Form preview section ── */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Sugerir un plan</h2>
            <p className="text-slate-500 text-sm mt-0.5">Vista del formulario para los miembros</p>
          </div>
          <div className="max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nombre del plan <span className="text-red-400">*</span>
              </label>
              <div className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-400 text-sm bg-slate-50">
                Ej: Cena en el restaurante japonés
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ubicación <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-400 text-sm bg-slate-50">
                Ej: Madrid
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Descripción <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-400 text-sm bg-slate-50 h-20">
                Detalles del plan, qué incluye, notas...
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Categoría <span className="text-red-400">*</span>
              </label>
              <div className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-400 text-sm bg-slate-50 flex items-center justify-between">
                <span>Selecciona una categoría</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Puedes buscar o añadir una categoría nueva</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Subcategoría <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <div className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-400 text-sm bg-slate-50">
                Ej: italiana, sushi, tapas...
              </div>
            </div>
            <div className="pt-1">
              <div className="w-full bg-indigo-100 text-indigo-300 py-2.5 rounded-lg font-semibold text-sm text-center cursor-not-allowed">
                Sugerir plan
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">Inicia sesión para enviar planes</p>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400 pb-4">
          Construido con Next.js · Prisma · Tailwind CSS ·{" "}
          <a
            href="https://github.com/Ixo22/plan-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600 transition-colors"
          >
            Ver código en GitHub
          </a>
        </footer>

      </main>
    </div>
  );
}
