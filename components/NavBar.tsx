import Link from "next/link";
import SignOutButton from "./SignOutButton";

interface Props {
  username: string;
  current: "dashboard" | "inbox" | "nuevo";
}

const NAV_ITEMS = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "inbox",
    href: "/inbox",
    label: "Bandeja",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l3-9h14l3 9M2 12v7a1 1 0 001 1h18a1 1 0 001-1v-7M2 12h4l2 3h8l2-3h4" />
      </svg>
    ),
  },
  {
    key: "nuevo",
    href: "/plans/new",
    label: "Nuevo",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
] as const;

export default function NavBar({ username, current }: Props) {
  return (
    <>
      {/* ── Desktop header ── */}
      <header className="hidden md:block bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight text-white">Plan Tracker</span>
            <nav className="flex gap-1">
              {NAV_ITEMS.map(({ key, href, label }) => (
                <Link
                  key={key}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    current === key
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label === "Nuevo" ? "Nuevo plan" : label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{username}</span>
            <SignOutButton className="text-xs text-slate-400 hover:text-white transition-colors" />
          </div>
        </div>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden bg-slate-900 text-white">
        <div className="h-14 px-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">{username}</span>
          <span className="font-bold tracking-tight text-white absolute left-1/2 -translate-x-1/2">
            Plan Tracker
          </span>
          <SignOutButton className="text-xs text-slate-400 hover:text-white transition-colors" />
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 z-50">
        <div className="flex">
          {NAV_ITEMS.map(({ key, href, label, icon }) => {
            const active = current === key;
            return (
              <Link
                key={key}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-3 text-[11px] font-medium transition-colors border-t-2 ${
                  active
                    ? "text-white border-indigo-400"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
