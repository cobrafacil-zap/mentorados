import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { VIDEOS } from "@/data/videos";
import { videoCategoryLabel } from "@/lib/videoCategories";
import { VideoCategory } from "@prisma/client";

const LABEL_TO_KEY: Record<string, VideoCategory> = {
  "Comece por aqui": "COMECE_POR_AQUI",
  "Tráfego Pago": "TRAFEGO_PAGO",
  "Estrutura da Operação": "ESTRUTURA_DA_OPERACAO",
  "Criativos": "CRIATIVOS",
  "Métricas": "METRICAS",
  "Evasão": "EVASAO",
  "Grupos": "GRUPOS",
  "Vendas": "VENDAS",
  "Financeiro": "FINANCEIRO",
};

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const existing = await prisma.video.count();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < VIDEOS.length; i++) {
      const v = VIDEOS[i];
      const key = LABEL_TO_KEY[v.category] ?? LABEL_TO_KEY[videoCategoryLabel(v.category)];
      if (!key) {
        console.warn(`[SEED] Categoria desconhecida: ${v.category}`);
        skipped++;
        continue;
      }

      const data = {
        title: v.title,
        description: v.description,
        category: key,
        videoUrl: v.videoUrl,
        thumbnail: v.thumbnail,
        duration: v.duration,
        order: i,
        published: true,
        featured: !!v.featured,
      };

      const found = await prisma.video.findFirst({ where: { title: v.title } });
      if (found) {
        await prisma.video.update({ where: { id: found.id }, data });
        updated++;
      } else {
        await prisma.video.create({ data });
        created++;
      }
    }

    return NextResponse.json({
      ok: true,
      created,
      updated,
      skipped,
      total: VIDEOS.length,
      alreadyInDb: existing,
    });
  } catch (error) {
    console.error("[SEED VIDEOS] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no seed" },
      { status: 500 }
    );
  }
}
