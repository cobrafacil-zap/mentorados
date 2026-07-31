import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

if (!process.env.NEXTAUTH_SECRET) {
  console.error("[NEXTAUTH] NEXTAUTH_SECRET não está definida");
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  debug: process.env.NODE_ENV !== "production",
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("[NEXTAUTH] authorize chamado", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("[NEXTAUTH] credenciais faltando");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("[NEXTAUTH] usuário não encontrado");
            return null;
          }

          const isValid = await verifyPassword(credentials.password, user.password);
          if (!isValid) {
            console.log("[NEXTAUTH] senha inválida");
            return null;
          }

          console.log("[NEXTAUTH] login autorizado");
          return { id: user.id, email: user.email, name: user.name };
        } catch (error) {
          console.error("[NEXTAUTH] erro no authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};
