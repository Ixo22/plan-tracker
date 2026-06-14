import type { Tracking } from "@prisma/client";

const LEVEL_CONFIG = {
  1: {
    label: "Nivel 1",
    description: "Detalles diarios",
    colors: "bg-green-50 border-green-300",
    badge: "bg-green-100 text-green-800",
    ring: "ring-green-300",
  },
  2: {
    label: "Nivel 2",
    description: "Planes intermedios",
    colors: "bg-yellow-50 border-yellow-300",
    badge: "bg-yellow-100 text-yellow-800",
    ring: "ring-yellow-300",
  },
  3: {
    label: "Nivel 3",
    description: "Planes especiales",
    colors: "bg-purple-50 border-purple-300",
    badge: "bg-purple-100 text-purple-800",
    ring: "ring-purple-300",
  },
} as const;

type Suggestion = { id: string; title: string; location: string | null; category: string } | null;

interface Props {
  trackings: Tracking[];
  suggestions: Record<number, Suggestion>;
}

export default function LevelCounters({ trackings, suggestions }: Props) {
  const now = new Date();

  if (trackings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-12 text-center text-gray-500">
        <p className="text-lg font-medium mb-1">Sin datos de seguimiento</p>
        <p className="text-sm">Ejecuta el seed para inicializar los 3 niveles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {trackings.map((t) => {
        const cfg = LEVEL_CONFIG[t.level as keyof typeof LEVEL_CONFIG];
        const daysLeft = Math.ceil(
          (new Date(t.next_scheduled_at).getTime() - now.getTime()) / 86_400_000
        );
        const isDue = daysLeft <= 0;
        const suggestion = suggestions[t.level];

        return (
          <div
            key={t.level}
            className={`rounded-2xl border-2 p-6 ${cfg.colors} ${isDue ? `ring-4 ring-red-400 ring-offset-2` : ""}`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="font-bold text-lg">{cfg.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
              </div>
              {isDue && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                  ¡Vence hoy!
                </span>
              )}
            </div>

            <div className="text-center py-6 border-t border-b border-current border-opacity-10 my-4">
              <span className="text-6xl font-black tabular-nums">{isDue ? "0" : daysLeft}</span>
              <p className="text-sm text-gray-500 mt-1">días restantes</p>
              <p className="text-xs text-gray-400 mt-1">
                Próximo: {new Date(t.next_scheduled_at).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
              </p>
            </div>

            {isDue && suggestion && (
              <div className={`rounded-xl p-4 border ${cfg.badge} border-current border-opacity-20`}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">
                  Sugerencia aleatoria
                </p>
                <p className="font-bold">{suggestion.title}</p>
                {suggestion.location && (
                  <p className="text-sm mt-0.5 opacity-75">📍 {suggestion.location}</p>
                )}
                <p className="text-xs mt-2 opacity-50 capitalize">{suggestion.category.replace("_", " ")}</p>
              </div>
            )}

            {isDue && !suggestion && (
              <div className="rounded-xl p-4 bg-white bg-opacity-50 text-center">
                <p className="text-sm text-gray-500">No hay planes asignados a este nivel todavía.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
