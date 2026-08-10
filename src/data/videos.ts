// =========================================================
// Conteúdo: catálogo de vídeos
// Substitua `videoUrl` pelos links reais do YouTube/Vimeo.
// =========================================================

export type VideoCategory =
  | "Comece por aqui"
  | "Tráfego Pago"
  | "Estrutura da Operação"
  | "Criativos"
  | "Métricas"
  | "Evasão"
  | "Grupos"
  | "Vendas"
  | "Financeiro";

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: VideoCategory;
  videoUrl: string; // URL do vídeo (YouTube embed, Vimeo, etc.)
  thumbnail: string; // Imagem de capa
  featured?: boolean;
}

export const CATEGORIES: { key: VideoCategory | "Todos"; label: string }[] = [
  { key: "Todos", label: "Todos" },
  { key: "Comece por aqui", label: "Comece por aqui" },
  { key: "Tráfego Pago", label: "Tráfego Pago" },
  { key: "Estrutura da Operação", label: "Estrutura da Operação" },
  { key: "Criativos", label: "Criativos" },
  { key: "Métricas", label: "Métricas" },
  { key: "Evasão", label: "Evasão" },
  { key: "Grupos", label: "Grupos" },
  { key: "Vendas", label: "Vendas" },
  { key: "Financeiro", label: "Financeiro" },
];

export const VIDEOS: VideoItem[] = [
  {
    id: "comece-por-aqui",
    title: "Bem-vindo ao Método GL — Comece por aqui",
    description:
      "Entenda o que é o Método de Grupos Lucrativos, como funciona uma operação de ponta a ponta e como aproveitar a plataforma para aprender e analisar seus números.",
    duration: "12:34",
    category: "Comece por aqui",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70",
    featured: true,
  },
  {
    id: "o-que-sao-grupos-lucrativos",
    title: "O que é uma operação de Grupos Lucrativos",
    description:
      "Conceitos fundamentais: como grupos de ofertas funcionam, por que são lucrativos e onde entram o tráfego pago e a comissão.",
    duration: "08:42",
    category: "Comece por aqui",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "trafego-pago-para-grupos",
    title: "Tráfego pago aplicado a grupos",
    description:
      "Como estruturar campanhas de aquisição para levar pessoas qualificadas até a sua operação.",
    duration: "15:10",
    category: "Tráfego Pago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "estrutura-da-operacao",
    title: "Estrutura da operação: do lead ao lucro",
    description:
      "O fluxo completo: captação, entrada no grupo, retenção, oferta, comissão e análise de resultado.",
    duration: "11:05",
    category: "Estrutura da Operação",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "criativos-que-convertem",
    title: "Criativos que convertem para grupos",
    description:
      "Como criar peças, copies e formatos que geram entrada qualificada para o grupo.",
    duration: "09:58",
    category: "Criativos",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "metricas-essenciais",
    title: "Métricas essenciais da operação",
    description:
      "CPL, taxa de entrada, evasão, comissão, LTV: o que cada uma significa e como acompanhar.",
    duration: "13:22",
    category: "Métricas",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "evasao-como-reduzir",
    title: "Evasão: como identificar e reduzir",
    description:
      "Por que as pessoas saem dos grupos e o que fazer para aumentar a permanência e o LTV.",
    duration: "10:14",
    category: "Evasão",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "gestao-de-grupos",
    title: "Gestão de grupos: rotina e regras",
    description:
      "Rotina, moderação, regras e boas práticas para manter o grupo ativo e saudável.",
    duration: "07:48",
    category: "Grupos",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "vendas-e-ofertas",
    title: "Como divulgar ofertas sem matar o grupo",
    description:
      "Frequência, formato, copy e timing para gerar vendas sem comprometer a retenção.",
    duration: "12:00",
    category: "Vendas",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "financeiro-da-operacao",
    title: "O financeiro real da operação",
    description:
      "Como calcular resultado, margem e o impacto de cada métrica no caixa da operação.",
    duration: "14:30",
    category: "Financeiro",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70",
  },
];
