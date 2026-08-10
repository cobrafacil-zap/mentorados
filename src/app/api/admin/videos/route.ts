import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { VideoCategory } from "@prisma/client";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  }
  return { ok: true as const };
}

function isCategory(value: unknown): value is VideoCategory {
  return typeof value === "string" && value in
    ({} as Record<VideoCategory, unknown>);
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const videos = await prisma.video.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("[ADMIN VIDEOS] GET error:", error);
    return NextResponse.json({ error: "Erro ao listar vídeos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }
    if (!body.videoUrl || typeof body.videoUrl !== "string") {
      return NextResponse.json({ error: "URL do vídeo é obrigatória" }, { status: 400 });
    }
    if (!isCategory(body.category)) {
      return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
    }
    if (!body.duration || typeof body.duration !== "string") {
      return NextResponse.json({ error: "Duração é obrigatória" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title: body.title.trim(),
        description: (body.description ?? "").toString(),
        category: body.category,
        videoUrl: body.videoUrl,
        thumbnail: body.thumbnail ?? null,
        duration: body.duration,
        order: Number.isFinite(body.order) ? Number(body.order) : 0,
        published: body.published ?? true,
        featured: body.featured ?? false,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("[ADMIN VIDEOS] POST error:", error);
    return NextResponse.json({ error: "Erro ao criar vídeo" }, { status: 500 });
  }
}
