"use client";
import { signOut } from "next-auth/react";

interface Props {
  className?: string;
}

export default function SignOutButton({ className = "text-sm text-slate-500 hover:text-slate-700 transition-colors" }: Props) {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className={className}>
      Cerrar sesión
    </button>
  );
}
