// =========================================================
// Funções server-side para ler vídeos do banco.
//
// Separado de `./videos.example.ts` (exemplo de seed que é
// usado pelo /api/admin/videos/seed) e dos components client,
// pra evitar que `@prisma/client` vaze pro bundle do navegador.
//
// Padrão espelha `pageContent.server.ts`: try/catch retornando
// fallback silencioso — nunca quebra a página pública mesmo
// se o DB cair, tabela inexistir, ou DATABASE_URL sumir.
// =========================================================

import { prisma } from "@/lib/prisma";
import { VIDEO_CATEGORY_LABELS } from "@/lib/videoCategories";
import type { VideoCategory } from "@prisma/client";
import type { VideoItem } from "@/data/videos.example";

/** Converte enum Prisma → rótulo PT-BR usado pelo client. */
function toLabel(enumValue: string): VideoItem["category"] {
  return (VIDEO_CATEGORY_LABELS[enumValue as VideoCategory] ??
    enumValue) as VideoItem["category"];
}

/**
 * Lê vídeos publicados para a página pública `/aulas`.
 * Retorna array vazio em caso de erro — UI já trata.
 */
export async function getPublicVideos(): Promise<VideoItem[]> {
  try {
    const rows = await prisma.video.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      duration: r.duration,
      category: toLabel(r.category),
      videoUrl: r.videoUrl,
      thumbnail: r.thumbnail ?? undefined,
      featured: r.featured || undefined,
      emAguardo: r.emAguardo || undefined,
    }));
  } catch (error) {
    console.warn(
      "[videos] Falha ao ler vídeos públicos, retornando lista vazia",
      error,
    );
    return [];
  }
}

/**
 * Devolve o vídeo em destaque (primeiro com `featured=true`,
 * ou o primeiro disponível). Usado pela home.
 */
export async function getFeaturedVideo(): Promise<VideoItem | null> {
  try {
    const rows = await prisma.video.findMany({
      where: { published: true },
      orderBy: [
        { featured: "desc" }, // true (1) antes de false (0)
        { order: "asc" },
        { createdAt: "desc" },
      ],
      take: 1,
    });
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      duration: r.duration,
      category: toLabel(r.category),
      videoUrl: r.videoUrl,
      thumbnail: r.thumbnail ?? undefined,
      featured: r.featured || undefined,
      emAguardo: r.emAguardo || undefined,
    };
  } catch (error) {
    console.warn("[videos] Falha ao ler vídeo destaque", error);
    return null;
  }
}