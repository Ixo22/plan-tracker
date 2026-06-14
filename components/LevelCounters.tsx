import type { Tracking } from "@prisma/client";
import SuggestionsBox from "./SuggestionsBox";

export type PlanSuggestion = {
  id: string;
  title: string;
  location: string | null;
  category: string;
};

const LEVEL_CONFIG = {
  1: {
    label: "Nivel 1",
    description: "Planes diarios",
    accent: "border-l-emerald-500",
    dot: "bg-emerald-500",
    numColor: "text-emerald-600",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  2: {
    label: "Nivel 2",
    description: "Planes intermedios",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
    numColor: "text-amber-600",
    badge: "bg-amber-50 border-amber-200 text-amber-800",
  },
  3: {
    label: "Nivel 3",
    description: "Planes especiales",
    accent: "border-l-violet-500",
    dot: "bg-violet-500",
    numColor: "text-violet-600",
    badge: "bg-violet-50 border-violet-200 text-violet-800",
  },
} as const;

interface Props {
  trackings: Tracking[];
  suggestions: Record<number, PlanSuggestion[]>;
}

export default function LevelCounters({ trackings, suggestions }: Props) {
  const now = new Date();

  if (trackings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-base font-semibold text-slate-700 mb-1">Sin datos de seguimiento</p>
        <p className="text-sm text-slate-500">Ejecuta el seed para inicializar los 3 niveles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {trackings.map((t) => {
        const cfg = LEVEL_CONFIG[t.level as keyof typeof LEVEL_CONFIG];
        const daysLeft = Math.ceil(
          (new Date(t.next_scheduled_at).getTime() - now.getTime()) / 86_400_000
        );
        const isDue = daysLeft <= 0;

        return (
          <div
            key={t.level}
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 ${cfg.accent} overflow-hidden`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${cfg.dot}`} />
                  <div>
                    <p className="font-bold text-slate-900">{cfg.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cfg.description}</p>
                  </div>
                </div>
                {isDue && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    ¡Hoy!
                  </span>
                )}
              </div>

              <div className="text-center py-4 border-t border-slate-100">
                <span className={`text-7xl font-black tabular-nums leading-none ${cfg.numColor}`}>
                  {isDue ? "0" : daysLeft}
                </span>
                <p className="text-sm font-medium text-slate-600 mt-2">días restantes</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(t.next_scheduled_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <SuggestionsBox
              level={t.level}
              initial={suggestions[t.level] ?? []}
              badge={cfg.badge}
            />
          </div>
        );
      })}
    </div>
  );
}
