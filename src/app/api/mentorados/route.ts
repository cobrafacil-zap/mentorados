import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/subdomain";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const mentorados = await prisma.mentorado.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(mentorados);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    const slug = body.slug?.toLowerCase().trim();
    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    const existing = await prisma.mentorado.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 409 });
    }

    const mentorado = await prisma.mentorado.create({
      data: {
        slug,
        nome: body.nome,
        ativo: body.ativo ?? true,
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

    return NextResponse.json(mentorado, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar mentorado" }, { status: 500 });
  }
}
