// =========================================================
// Trilhas (módulos) da plataforma Método GL
// Mapeamento: categoria do vídeo → módulo da trilha
//
// Zero dependência do banco. Se um dia for preciso criar
// módulos dinamicamente, troque MODULES por uma consulta
// `prisma.module.findMany()` — as funções consumidoras já
// recebem um array, então a troca é localizada.
// =========================================================

import type { VideoCategory } from "@/data/videos";

export type ModuleSlug =
  | "fundamentos"
  | "trafego"
  | "retencao"
  | "escala";

export interface ModuleDef {
  /** slug único, kebab-case */
  slug: ModuleSlug;
  /** ordem de exibição (1-based no display) */
  order: number;
  /** título exibido: "01. Fundamentos" */
  title: string;
  /** versão curta sem o numeral: "Fundamentos" */
  shortTitle: string;
  /** descrição curta exibida no header da seção */
  summary: string;
  /** categorias que pertencem a este módulo (rótulo público) */
  videoCategoryKeys: VideoCategory[];
}

export const MODULES: ModuleDef[] = [
  {
    slug: "fundamentos",
    order: 1,
    title: "01. Fundamentos",
    shortTitle: "Fundamentos",
    summary:
      "O que é o Método GL, como uma operação de grupos dá dinheiro e o fluxo do lead até o lucro.",
    videoCategoryKeys: ["Comece por aqui", "Estrutura da Operação"],
  },
  {
    slug: "trafego",
    order: 2,
    title: "02. Tráfego",
    shortTitle: "Tráfego",
    summary:
      "Como levar pessoas qualificadas para o grupo: criativos, campanhas e as métricas que importam.",
    videoCategoryKeys: ["Tráfego Pago", "Criativos", "Métricas"],
  },
  {
    slug: "retencao",
    order: 3,
    title: "03. Retenção",
    shortTitle: "Retenção",
    summary:
      "Manter o grupo vivo: rotina, regras e como reduzir evasão para preservar LTV.",
    videoCategoryKeys: ["Grupos", "Evasão"],
  },
  {
    slug: "escala",
    order: 4,
    title: "04. Escala",
    shortTitle: "Escala",
    summary:
      "Vender sem matar o grupo e fechar a conta: como a comissão vira caixa.",
    videoCategoryKeys: ["Vendas", "Financeiro"],
  },
];

/** Slugs dos módulos na ordem canônica de exibição */
export const MODULE_ORDER: ModuleSlug[] = MODULES.map((m) => m.slug);

/** Encontra o módulo que contém a categoria dada, ou null. */
export function moduleForCategory(category: VideoCategory): ModuleDef | null {
  return MODULES.find((m) => m.videoCategoryKeys.includes(category)) ?? null;
}

/** Encontra o módulo pelo slug. */
export function moduleBySlug(slug: string): ModuleDef | null {
  return MODULES.find((m) => m.slug === slug) ?? null;
}
