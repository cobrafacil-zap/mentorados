import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { VideoCategory } from "@prisma/client";

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
    const message = error instanceof Error ? error.message : "Erro ao listar vídeos";
    console.error("[ADMIN VIDEOS] GET error:", error);
    return NextResponse.json(
      {
        error: "Erro ao listar vídeos",
        detail: message,
        hint: message.toLowerCase().includes("does not exist") || message.toLowerCase().includes("relation")
          ? "A tabela 'Video' não existe. Rode `npx prisma migrate dev` (local) ou aplique a migration em produção."
          : undefined,
      },
      { status: 500 },
    );
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
        emAguardo: body.emAguardo ?? false,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar vídeo";
    console.error("[ADMIN VIDEOS] POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar vídeo", detail: message },
      { status: 500 },
    );
  }
}
