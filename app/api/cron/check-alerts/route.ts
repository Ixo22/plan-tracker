import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const LEVEL_RANGES: Record<number, [number, number]> = {
  1: [2, 10],
  2: [5, 20],
  3: [20, 40],
};

const LEVEL_NAMES: Record<number, string> = {
  1: "Nivel 1 — Detalles diarios",
  2: "Nivel 2 — Planes intermedios",
  3: "Nivel 3 — Planes especiales",
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

async function getSuggestions(level: number) {
  const plans = await prisma.plan.findMany({
    where: { assigned_level: level },
    select: { title: true, location: true, category: true },
  });
  return pickRandom(plans, 3);
}

function buildEmail(dueAlerts: { level: number; suggestions: { title: string; location: string | null; category: string }[] }[]) {
  const blocks = dueAlerts
    .map(({ level, suggestions }) => {
      const items =
        suggestions.length > 0
          ? suggestions
              .map(
                (s) =>
                  `<li style="margin:6px 0;color:#334155;">
                    <strong>${s.title}</strong>
                    ${s.location ? `<span style="color:#94a3b8;"> · ${s.location}</span>` : ""}
                    <span style="color:#94a3b8;font-size:12px;"> — ${s.category.replace("_", " ")}</span>
                  </li>`
              )
              .join("")
          : `<li style="color:#94a3b8;">Sin sugerencias asignadas aún.</li>`;

      return `
        <div style="margin-bottom:24px;padding:20px;background:#f8fafc;border-radius:12px;border-left:4px solid #6366f1;">
          <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1e293b;">🔔 ${LEVEL_NAMES[level]}</p>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Algunas ideas para hoy:</p>
          <ul style="margin:0;padding-left:18px;">${items}</ul>
        </div>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f1f5f9;margin:0;padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <h1 style="margin:0 0 6px;font-size:22px;color:#1e293b;">Plan Tracker</h1>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">¡Tienes ${dueAlerts.length === 1 ? "un nivel" : "niveles"} listo${dueAlerts.length === 1 ? "" : "s"} para hoy!</p>
        ${blocks}
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;">
          Este correo se envía automáticamente cuando un nivel llega a su fecha programada.
        </p>
      </div>
    </body>
    </html>`;
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const trackings = await prisma.tracking.findMany();
  const now = new Date();
  const dueAlerts: { level: number; suggestions: { title: string; location: string | null; category: string }[] }[] = [];
  const updated: { level: number; nextInDays: number }[] = [];

  for (const t of trackings) {
    if (t.next_scheduled_at <= now) {
      const suggestions = await getSuggestions(t.level);
      dueAlerts.push({ level: t.level, suggestions });

      const [min, max] = LEVEL_RANGES[t.level] ?? [5, 20];
      const days = randomInt(min, max);
      const next = new Date();
      next.setDate(next.getDate() + days);

      await prisma.tracking.update({
        where: { id: t.id },
        data: { last_done_at: now, next_scheduled_at: next },
      });

      updated.push({ level: t.level, nextInDays: days });
    }
  }

  if (dueAlerts.length > 0 && process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Plan Tracker <onboarding@resend.dev>",
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🗓️ Plan Tracker — ${dueAlerts.length === 1 ? "Un nivel listo" : `${dueAlerts.length} niveles listos`} para hoy`,
      html: buildEmail(dueAlerts),
    });
  }

  return NextResponse.json({ processed: updated.length, updated });
}
