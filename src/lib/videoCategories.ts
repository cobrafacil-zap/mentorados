// =========================================================
// Categorias de vídeo (espelha o enum VideoCategory do Prisma).
// Mantido em arquivo separado para reuso entre server e client.
// =========================================================

import { VideoCategory } from "@prisma/client";

export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, string> = {
  COMECE_POR_AQUI: "Comece por aqui",
  TRAFEGO_PAGO: "Tráfego Pago",
  ESTRUTURA_DA_OPERACAO: "Estrutura da Operação",
  CRIATIVOS: "Criativos",
  METRICAS: "Métricas",
  EVASAO: "Evasão",
  GRUPOS: "Grupos",
  VENDAS: "Vendas",
  FINANCEIRO: "Financeiro",
};

export const VIDEO_CATEGORY_KEYS = Object.keys(VIDEO_CATEGORY_LABELS) as VideoCategory[];

export function videoCategoryLabel(value: string): string {
  return (VIDEO_CATEGORY_LABELS as Record<string, string>)[value] ?? value;
}

// Re-exporta o sistema de módulos (trilhas) para conveniência.
export { MODULES, moduleForCategory, moduleBySlug, MODULE_ORDER } from "./modules";
