import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { isPageContentKey, DEFAULT_CONTENT } from "@/lib/pageContent";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }
  return { ok: true as const };
}

/**
 * GET /api/admin/conteudo/[key]
 * Retorna { key, content, defaultContent, saved } para a chave pedida.
 * - `saved = false` quando a linha não existe no DB
 * - `defaultContent` é sempre o fallback hardcoded (útil para o form mostrar diff)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { key } = await params;
  if (!isPageContentKey(key)) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  try {
    const row = await prisma.pageContent.findUnique({ where: { key } });
    const fallback = DEFAULT_CONTENT[key];
    return NextResponse.json({
      key,
      saved: !!row,
      content: row?.content ?? fallback,
      defaultContent: fallback,
      updatedAt: row?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("[ADMIN CONTEUDO] GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao carregar conteúdo" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/conteudo/[key]
 * Body: { content: object }
 * Upsert. O `content` é salvo como Json. Validação de shape é superficial
 * (apenas checa se é objeto) — o admin usa o form que conhece a estrutura.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { key } = await params;
  if (!isPageContentKey(key)) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  let body: { content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (typeof body.content !== "object" || body.content === null || Array.isArray(body.content)) {
    return NextResponse.json({ error: "`content` precisa ser objeto" }, { status: 400 });
  }

  try {
    const row = await prisma.pageContent.upsert({
      where: { key },
      create: { key, content: body.content as object },
      update: { content: body.content as object },
    });
    return NextResponse.json({ ok: true, key: row.key, updatedAt: row.updatedAt });
  } catch (error) {
    console.error("[ADMIN CONTEUDO] PUT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao salvar conteúdo" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/conteudo/[key]
 * Remove a linha — `getPageContent` volta a usar o fallback hardcoded.
 * Útil para o admin resetar.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { key } = await params;
  if (!isPageContentKey(key)) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  try {
    await prisma.pageContent.delete({ where: { key } }).catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ADMIN CONTEUDO] DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao resetar conteúdo" },
      { status: 500 },
    );
  }
}
