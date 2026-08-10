import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/healthcheck
 *
 * Roda sem autenticação — serve para diagnosticar problemas de
 * banco, schema ou config sem precisar logar. Retorna:
 *  - ok: true  → tudo saudável
 *  - ok: false → há problema; detalhe em `error` e `hint`
 *
 * Testes:
 *  1. DATABASE_URL definida
 *  2. Conexão com banco (SELECT 1)
 *  3. Tabelas esperadas existem (User, Video, Mentorado, PageContent)
 *  4. Cada tabela responde a count (sem registros = OK)
 *  5. NEXTAUTH_SECRET definida (não revela o valor)
 */
export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // 1. DATABASE_URL
  const hasDbUrl = !!process.env.DATABASE_URL;
  checks.DATABASE_URL = {
    ok: hasDbUrl,
    detail: hasDbUrl ? "definida" : "AUSENTE no .env / Vercel env vars",
  };

  // 2-4. Banco (só tenta se DATABASE_URL existe)
  if (hasDbUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.conexao = { ok: true, detail: "SELECT 1 OK" };

      // try/catch por tabela para que uma faltando não esconda a outra
      const tabelas: { nome: string; fn: () => Promise<number> }[] = [
        { nome: "User", fn: () => prisma.user.count() },
        { nome: "Mentorado", fn: () => prisma.mentorado.count() },
        { nome: "Video", fn: () => prisma.video.count() },
        { nome: "PageContent", fn: () => prisma.pageContent.count() },
      ];
      for (const { nome, fn } of tabelas) {
        try {
          const count = await fn();
          checks[`tabela.${nome}`] = {
            ok: true,
            detail: `${count} linha${count === 1 ? "" : "s"}`,
          };
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          checks[`tabela.${nome}`] = {
            ok: false,
            detail: msg.split("\n")[0].slice(0, 200),
          };
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      checks.conexao = { ok: false, detail: msg.split("\n")[0].slice(0, 300) };
    }
  } else {
    checks.conexao = { ok: false, detail: "pulado (DATABASE_URL ausente)" };
  }

  // 5. NEXTAUTH_SECRET
  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  checks.NEXTAUTH_SECRET = {
    ok: hasSecret,
    detail: hasSecret ? "definida" : "AUSENTE — login vai falhar",
  };

  // Veredicto
  const allOk = Object.values(checks).every((c) => c.ok);
  const failed = Object.entries(checks).filter(([, c]) => !c.ok);

  return NextResponse.json(
    {
      ok: allOk,
      timestamp: new Date().toISOString(),
      checks,
      ...(failed.length > 0 && {
        hint: failed.map(([k, v]) => `${k}: ${v.detail}`).join(" · "),
      }),
    },
    { status: allOk ? 200 : 503 },
  );
}
