import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const DEV_USERS: Record<string, { id: string; name: string; role: string; hash: string }> = {};

(async () => {
  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin";
  const memberUser = process.env.MEMBER_USERNAME ?? "member";
  const memberPass = process.env.MEMBER_PASSWORD ?? "member";

  DEV_USERS[adminUser] = { id: "dev-admin", name: adminUser, role: "ADMIN", hash: await bcrypt.hash(adminPass, 10) };
  DEV_USERS[memberUser] = { id: "dev-member", name: memberUser, role: "MEMBER", hash: await bcrypt.hash(memberPass, 10) };
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
