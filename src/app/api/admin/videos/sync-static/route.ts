// =========================================================
// POST /api/admin/videos/sync-static
//
// Lê todos os vídeos do banco, gera o conteúdo de
// `src/data/videos.ts` no formato esperado por VideoLibrary,
// e commita no GitHub via App. Vercel pega o commit e
// faz deploy em ~30s — após isso, /aulas pública reflete
// o estado atual do painel (cria/editar/excluir).
//
// Esse é o "botão Sincronizar catálogo público" do admin.
//
// Requer: GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID,
// GITHUB_APP_PRIVATE_KEY no .env (e na Vercel).
// =========================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { commitFile, githubConfig } from "@/lib/github";
import { VIDEO_CATEGORY_LABELS } from "@/lib/videoCategories";
import type { VideoCategory } from "@prisma/client";

// Template do arquivo gerado. Comentário curto pra deixar claro
// que esse arquivo é gerado por sync e não editado à mão.
const FILE_HEADER = `// =========================================================
// Catálogo de vídeos — GERADO POR /api/admin/videos/sync-static.
// NÃO edite à mão: ele é reescrito toda vez que o admin clica
// em "Sincronizar catálogo público".
// Última atualização: ${new Date().toISOString()}
// =========================================================

import type { VideoCategory } from "@/lib/videoCategories";
`;

function escapeForTsString(value: string): string {
  // Escapa caracteres problemáticos pra colocar dentro de aspas duplas.
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .split("\n")
    .map((line, i, arr) => (i < arr.length - 1 ? line + "\\n" : line))
    .join("");
}

function indent(value: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => pad + line)
    .join("\n");
}

function buildVideoEntry(video: {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  videoUrl: string;
  thumbnail: string | null;
  featured: boolean;
  emAguardo: boolean;
}): string {
  const lines: string[] = [];
  lines.push("{");
  lines.push(`  id: "${escapeForTsString(video.id)}",`);
  lines.push(`  title: "${escapeForTsString(video.title)}",`);
  lines.push(`  description: "${escapeForTsString(video.description)}",`);
  lines.push(`  duration: "${escapeForTsString(video.duration)}",`);
  lines.push(
    `  category: "${escapeForTsString(VIDEO_CATEGORY_LABELS[video.category as VideoCategory] ?? video.category)}",`,
  );
  lines.push(`  videoUrl: "${escapeForTsString(video.videoUrl)}",`);
  lines.push(
    `  thumbnail: ${
      video.thumbnail ? `"${escapeForTsString(video.thumbnail)}"` : "undefined"
    },`,
  );
  if (video.featured) lines.push(`  featured: true,`);
  if (video.emAguardo) lines.push(`  emAguardo: true,`);
  // Apaga a vírgula do último campo.
  if (lines[lines.length - 1].endsWith(",")) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
  }
  lines.push("}");
  return lines.join("\n");
}

function buildVideosFile(videos: Parameters<typeof buildVideoEntry>[0][]): string {
  // Ordena por order (asc) e createdAt (desc) — mesmo critério do GET.
  const sorted = [...videos].sort((a, b) => {
    const ao = "order" in a ? (a as { order: number }).order : 0;
    const bo = "order" in b ? (b as { order: number }).order : 0;
    if (ao !== bo) return ao - bo;
    return 0; // createdAt desc fica pro sync próximo se quiser
  });

  const body = sorted.map((v) => indent(buildVideoEntry(v), 2)).join(",\n");

  return `${FILE_HEADER}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnail?: string;
  featured?: boolean;
  emAguardo?: boolean;
}

export const VIDEOS: VideoItem[] = [
${body}
];
`;
}

export async function POST(_request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!githubConfig.configured) {
    return NextResponse.json(
      {
        error:
          "GitHub App não configurado no ambiente. Adicione GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID e GITHUB_APP_PRIVATE_KEY no .env (e na Vercel).",
      },
      { status: 503 },
    );
  }

  try {
    const videos = await prisma.video.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    const fileContent = buildVideosFile(videos);

    const result = await commitFile({
      path: "src/data/videos.ts",
      content: fileContent,
      message: `chore(sync): catálogo público — ${videos.length} aula(s) [skip ci]`,
    });

    return NextResponse.json({
      ok: true,
      count: videos.length,
      commitSha: result.commitSha,
      commitUrl: result.htmlUrl,
      message: `Commitado: ${result.commitSha.slice(0, 7)} · Vercel vai deployar em ~30s`,
    });
  } catch (error) {
    console.error("[SYNC-STATIC] error:", error);
    const message = error instanceof Error ? error.message : "Erro ao sincronizar";
    return NextResponse.json(
      { error: "Erro ao sincronizar", detail: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Healthcheck da config do sync (não retorna credenciais).
  return NextResponse.json({
    configured: githubConfig.configured,
    repo: githubConfig.repo,
    branch: githubConfig.branch,
  });
}