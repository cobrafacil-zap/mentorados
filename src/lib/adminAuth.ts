import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * Garante que a request tem uma sessão admin válida.
 *
 * Retorna `{ ok: true }` em caso de sucesso.
 * Retorna `{ ok: false, response }` com a response apropriada:
 *  - 401 se não houver sessão
 *  - 500 se o NextAuth falhar ao inicializar (ex.: NEXTAUTH_SECRET ausente)
 *
 * Importante: o try/catch é necessário porque `getServerSession` joga
 * `MissingSecretError` em produção quando NEXTAUTH_SECRET não está
 * definida. Sem esse catch, a API responde 500 genérico em vez de 401.
 */
export async function requireAdmin(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
      };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro de autenticação";
    console.error("[adminAuth] Falha ao verificar sessão:", error);
    // Se for erro de config (ex.: secret ausente), ainda devolvemos 401
    // — não 500 — para o admin ver a tela de login em vez de erro genérico.
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Não autorizado",
          detail: message,
          hint: message.toLowerCase().includes("secret")
            ? "NEXTAUTH_SECRET não está definida. Defina no .env ou nas variáveis de ambiente do host."
            : undefined,
        },
        { status: 401 },
      ),
    };
  }
}
