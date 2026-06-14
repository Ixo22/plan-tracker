import Link from "next/link";
import SignOutButton from "./SignOutButton";

interface Props {
  username: string;
  current: "dashboard" | "inbox" | "nuevo";
}

export default function NavBar({ username, current }: Props) {
  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-tight text-white">Plan Tracker</span>
          <nav className="flex gap-1">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                current === "dashboard"
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/inbox"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                current === "inbox"
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Bandeja
            </Link>
            <Link
              href="/plans/new"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                current === "nuevo"
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Nuevo plan
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{username}</span>
          <SignOutButton className="text-xs text-slate-400 hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
}
