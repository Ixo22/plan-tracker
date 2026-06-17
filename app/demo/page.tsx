import Link from "next/link";
import DemoPlanList from "@/components/DemoPlanList";

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
  { id: "1",  title: "Cena en casa — pasta carbonara",      location: "Madrid",               category: "Comida casera",    subcategory: null,       description: "Con la receta de la abuela, vino incluido.", level: 1, author: "member" },
  { id: "2",  title: "Paseo por el parque del Retiro",      location: "Madrid",               category: "Aire libre",       subcategory: null,       description: null,                                          level: 1, author: "admin"  },
  { id: "3",  title: "Cañas en Malasaña",                   location: "Madrid",               category: "Cañas",            subcategory: null,       description: "Bar de siempre, esquina Pez.",                level: 1, author: "member" },
  { id: "4",  title: "Flores para sorprenderla",            location: null,                   category: "Detalle",          subcategory: null,       description: "Rosas rojas o tulipanes.",                    level: 1, author: "admin"  },
  { id: "5",  title: "Fin de semana en la sierra",          location: "Cercedilla",           category: "Viaje",            subcategory: null,       description: null,                                          level: 2, author: "admin"  },
  { id: "6",  title: "Cata de vinos en bodega",             location: "Ribera del Duero",     category: "Comida",           subcategory: "maridaje", description: null,                                          level: 2, author: "member" },
  { id: "7",  title: "Exposición en el Reina Sofía",        location: "Madrid",               category: "Cultura",          subcategory: null,       description: "Ver el Guernica en persona.",                  level: 2, author: "member" },
  { id: "8",  title: "Senderismo en Guadarrama",            location: "Sierra de Guadarrama", category: "Aire libre",       subcategory: null,       description: null,                                          level: 2, author: "admin"  },
  { id: "9",  title: "Viaje a Lisboa",                      location: "Lisboa, Portugal",     category: "Viaje",            subcategory: null,       description: "Fado, pastéis de nata y el Tajo.",            level: 3, author: "member" },
  { id: "10", title: "Concierto en el WiZink Center",       location: "Madrid",               category: "Entretenimiento",  subcategory: null,       description: null,                                          level: 3, author: "member" },
  { id: "11", title: "Bombones artesanos",                  location: null,                   category: "Detalle",          subcategory: null,       description: "Chocolatería Valor, caja grande.",             level: 3, author: "admin"  },
  { id: "12", title: "Festival de música de verano",        location: "Valencia",             category: "Entretenimiento",  subcategory: null,       description: null,                                          level: 3, author: "member" },
];

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
          <DemoPlanList plans={PLANS} />
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
