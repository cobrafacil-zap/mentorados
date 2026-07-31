import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/upload";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;

  const mentorado = await prisma.mentorado.findUnique({ where: { id } });
  if (!mentorado) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(mentorado);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;

  try {
    const body = await request.json();
    const existing = await prisma.mentorado.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const updated = await prisma.mentorado.update({
      where: { id },
      data: {
        nome: body.nome,
        ativo: body.ativo,
        tituloHero: body.tituloHero,
        tituloSecao: body.tituloSecao,
        texto1: body.texto1,
        texto2: body.texto2,
        texto3: body.texto3,
        imagemUrl: body.imagemUrl,
        linkCta: body.linkCta,
        corTopo: body.corTopo,
        corFundo: body.corFundo,
        corBotao: body.corBotao,
        corBotaoHover: body.corBotaoHover,
        corTexto: body.corTexto,
        corTextoSecundario: body.corTextoSecundario,
        pixelId: body.pixelId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar mentorado" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;

  try {
    const existing = await prisma.mentorado.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    if (existing.imagemUrl) await deleteImage(existing.imagemUrl);

    await prisma.mentorado.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao excluir mentorado" }, { status: 500 });
  }
}
