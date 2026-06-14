import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const DEV_USERS: Record<string, { id: string; name: string; role: string; hash: string }> = {
  admin: { id: "dev-admin", name: "admin", role: "ADMIN", hash: "" },
  member: { id: "dev-member", name: "member", role: "MEMBER", hash: "" },
};

// Pre-compute hashes at module init so they're ready on first login
(async () => {
  DEV_USERS.admin.hash = await bcrypt.hash("admin", 10);
  DEV_USERS.member.hash = await bcrypt.hash("member", 10);
})();

async function authorizeFromDB(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  return { id: user.id, name: user.username, role: user.role };
}

async function authorizeDevFallback(username: string, password: string) {
  const user = DEV_USERS[username];
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) return null;
  return { id: user.id, name: user.name, role: user.role };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const u = credentials.username as string;
        const p = credentials.password as string;

        if (process.env.DATABASE_URL) {
          return authorizeFromDB(u, p);
        }
        return authorizeDevFallback(u, p);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
