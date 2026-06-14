"use client";
import { useState, useCallback } from "react";

type Plan = {
  id: string;
  title: string;
  location: string | null;
  category: string;
};

interface Props {
  level: number;
  initial: Plan[];
  badge: string;
}

export default function SuggestionsBox({ level, initial, badge }: Props) {
  const [plans, setPlans] = useState<Plan[]>(initial);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/suggestions/${level}`);
    if (res.ok) setPlans(await res.json());
    setLoading(false);
  }, [level]);

  return (
    <div className={`mx-5 mb-5 rounded-xl border p-4 ${badge}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wider opacity-60">🎲 Sugerencias</p>
        <button
          onClick={reload}
          disabled={loading}
          title="Nuevas sugerencias"
          className="p-1 rounded-md hover:bg-black/10 transition-colors disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {plans.length === 0 ? (
        <p className="text-xs opacity-60">Sin planes asignados a este nivel</p>
      ) : (
        <ul className="space-y-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <span className="font-semibold text-sm leading-tight block">{plan.title}</span>
              {plan.location && (
                <span className="text-xs opacity-60">📍 {plan.location}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
