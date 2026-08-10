import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

// Em dev: gera uma chave estável local para o JWT não se perder entre restarts.
// Em prod: a SECRET é obrigatória — se faltar, lança erro na inicialização.
// Durante `next build` (que não tem env de runtime), aceita placeholder.
function getOrInitSecret(): string {
  const fromEnv = process.env.NEXTAUTH_SECRET;
  if (fromEnv) return fromEnv;

  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  if (process.env.NODE_ENV !== "production" || isBuildPhase) {
    const devPlaceholder = "dev-only-insecure-secret-do-not-use-in-prod-123456789";
    if (!isBuildPhase) {
      console.warn(
        "[NEXTAUTH] NEXTAUTH_SECRET não definida — usando placeholder de DEV. " +
          "Defina no .env para garantir que sessões sobrevivam entre restarts.",
      );
    }
    return devPlaceholder;
  }

  throw new Error(
    "NEXTAUTH_SECRET não está definida. Defina no .env (ou nas variáveis de ambiente do host). " +
      "Gere com: openssl rand -base64 32",
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: getOrInitSecret(),
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
