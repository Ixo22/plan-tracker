# Plan Tracker

Organiza planes con tu pareja, amigos o cualquier grupo para que nunca os falte algo que hacer.

Sugiere ideas, asígnalas a un nivel de urgencia y recibe notificaciones cuando toca cumplirlas — así siempre tenéis un plan esperando.

## Qué hace

- **Bandeja de entrada compartida** — cualquier miembro puede sugerir planes (una cena, un viaje, una actividad) y el admin los organiza por nivel de prioridad.
- **3 niveles de actividad** — N1 para planes del día a día, N2 para escapadas de fin de semana y N3 para planes más especiales. Cada nivel tiene un contador de días para saber cuándo toca el siguiente.
- **Notificaciones por email** — cuando se acerca la fecha de un nivel recibes un aviso para no perderte nada.
- **Categorías dinámicas** — organiza los planes por categoría (viaje, comida, cultura…) y añade las tuyas propias.
- **Página demo pública** — puedes ver cómo funciona en `/demo` sin necesidad de registrarte.

## Stack

- [Next.js 16](https://nextjs.org) — framework frontend y API routes
- [Prisma 7](https://www.prisma.io) + PostgreSQL — base de datos
- [NextAuth 4](https://next-auth.js.org) — autenticación con sesiones JWT
- [Resend](https://resend.com) — envío de notificaciones por email
- [Tailwind CSS 4](https://tailwindcss.com) — estilos

## Desarrollo local

```bash
npm install
npm run dev
```

Crea un archivo `.env.local` con las variables necesarias:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
MEMBER_USERNAME=...
MEMBER_PASSWORD=...
RESEND_API_KEY=...          # opcional, para notificaciones
NOTIFICATION_EMAIL=...      # email donde llegan los avisos
```

Luego aplica las migraciones y el seed inicial:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```
