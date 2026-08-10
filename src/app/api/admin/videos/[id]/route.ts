import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { deleteVideo } from "@/lib/upload";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title.trim();
    if (typeof body.description === "string") data.description = body.description;
    if (isCategory(body.category)) data.category = body.category;
    if (typeof body.videoUrl === "string") data.videoUrl = body.videoUrl;
    if (body.thumbnail === null || typeof body.thumbnail === "string") {
      data.thumbnail = body.thumbnail;
    }
    if (typeof body.duration === "string") data.duration = body.duration;
    if (Number.isFinite(body.order)) data.order = Number(body.order);
    if (typeof body.published === "boolean") data.published = body.published;
    if (typeof body.featured === "boolean") data.featured = body.featured;

    const video = await prisma.video.update({ where: { id }, data });
    return NextResponse.json(video);
  } catch (error) {
    console.error("[ADMIN VIDEOS] PATCH error:", error);
    return NextResponse.json({ error: "Erro ao atualizar vídeo" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 });
    }

    // Tenta remover o arquivo do Storage (silencioso se não conseguir)
    if (video.videoUrl) {
      try { await deleteVideo(video.videoUrl); } catch (e) { console.warn("[ADMIN VIDEOS] delete file:", e); }
    }

    await prisma.video.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ADMIN VIDEOS] DELETE error:", error);
    return NextResponse.json({ error: "Erro ao excluir vídeo" }, { status: 500 });
  }
}
