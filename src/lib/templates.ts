/**
 * Registro de templates das páginas de mentorado + defaults do template "achados".
 *
 * - "classico": template original (campos raiz do Mentorado, componente LandingPage).
 * - "achados": réplica da referência Achados na Promo (config em `templateConfig`, componente LandingAchados).
 *
 * O `templateConfig` é JSON livre; `getAchadosConfig()` sempre faz merge com os
 * defaults, então mentorados antigos ou com config parcial nunca quebram a página.
 */

export const TEMPLATES = [
  {
    id: "classico",
    nome: "Clássico (original)",
    descricao: "Header vermelho, seção central, imagem circular e CTA verde.",
  },
  {
    id: "achados",
    nome: "Achados (carrosséis)",
    descricao: "Hero amarelo, carrosséis de ofertas/provas/cupons, CTA final com vagas.",
  },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export function isValidTemplate(value: unknown): value is TemplateId {
  return value === "classico" || value === "achados";
}

export interface AchadosConfig {
  // Hero
  heroBadge: string;
  heroTituloAntes: string;
  heroLogoUrl: string;
  heroLogoAlt: string;
  heroTituloDepois: string;
  heroSubtitulo: string;

  // CTA
  ctaTexto1: string;
  ctaTexto2: string;
  ctaSub: string;
  ctaFinal: string;
  ctaFinalSub: string;
  freeTag: string;

  // Contadores
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;

  // Prova social
  provaTitulo: string;
  provaSub: string;

  // Cupons
  cupomTitulo: string;
  cupomSub: string;
  cupomNota: string;

  // CTA final
  finalTitulo: string;
  finalSub: string;
  vagasPercent: number;
  vagasLabel: string;
  trust1: string;
  trust2: string;
  trust3: string;

  // Overlay
  overlayTitulo: string;
  overlaySub: string;
  overlayBenefit1: string;
  overlayBenefit2: string;
  overlayBenefit3: string;

  // Listas de imagens (URLs — upload ou link externo)
  ofertas: string[];
  provas: string[];
  cupons: string[];

  // Rodapé
  footerMarca: string;
  footerSub: string;
  footerDisclaimer: string;
  footerCopyright: string;

  // Cores
  corHeroBg: string;
  corHeroTitulo: string;
  corHeroSub: string;
  corPrimaria: string;
  corCta: string;
  corCtaHover: string;
  corCtaTexto: string;
  corFundo: string;
  corSessaoCupons: string;
  corFinalBg1: string;
  corFinalBg2: string;
  corRodapeBg: string;
  corRodapeDestaque: string;
}

export const DEFAULT_ACHADOS: AchadosConfig = {
  heroBadge: "● Entrada liberada hoje",
  heroTituloAntes: "Caçamos os menores preços",
  heroLogoUrl: "/templates/achados/logo.svg",
  heroLogoAlt: "Achados na Promo",
  heroTituloDepois: "e te avisamos no WhatsApp",
  heroSubtitulo:
    "Entre de graça e receba todo dia uma seleção com os descontos mais fortes. Só continua no grupo quem quer economizar de verdade!",

  ctaTexto1: "quero economizar",
  ctaTexto2: "me coloca no grupo!",
  ctaSub: "100% grátis • leva 5 segundos",
  ctaFinal: "🔥 Quero entrar no grupo VIP",
  ctaFinalSub: "Sua vaga fica reservada por pouco tempo",
  freeTag: "Sem pegadinha: você não paga nada nem informa dados",

  stat1Num: "+85 mil",
  stat1Label: "Caçadores de oferta",
  stat2Num: "R$0",
  stat2Label: "Pra participar",
  stat3Num: "+50",
  stat3Label: "Ofertas por dia",

  provaTitulo: "Quem entrou, não sai mais ⭐",
  provaSub: "Conversas reais de quem já está dentro",

  cupomTitulo: "Desconto dobrado: oferta + cupom 💸",
  cupomSub: "A gente combina o menor preço com cupom válido na hora",
  cupomNota: "👆 É esse tipo de achado que aparece no grupo todos os dias. Perdeu hoje, pagou mais caro amanhã.",

  finalTitulo: "Bora economizar de verdade? 🚀",
  finalSub:
    "Todo dia alguém do grupo conta quanto economizou. Amanhã pode ser você — mas só se estiver dentro.",
  vagasPercent: 73,
  vagasLabel: "% das vagas gratuitas de hoje já preenchidas",
  trust1: "🔒 Grupo fechado e seguro",
  trust2: "🚫 Zero spam, só oferta",
  trust3: "👋 Saia quando quiser",

  overlayTitulo: "Falta 1 toque! 🎉",
  overlaySub: "Estamos te levando para o grupo no WhatsApp…",
  overlayBenefit1: "⚡ Ofertas antes de esgotar",
  overlayBenefit2: "🎟️ Cupons exclusivos",
  overlayBenefit3: "💰 100% gratuito",

  ofertas: [
    "/templates/achados/oferta-1.jpg",
    "/templates/achados/oferta-2.jpg",
    "/templates/achados/oferta-3.jpg",
    "/templates/achados/oferta-4.jpg",
    "/templates/achados/oferta-5.jpg",
    "/templates/achados/oferta-6.jpg",
  ],
  provas: [
    "/templates/achados/prova-1.png",
    "/templates/achados/prova-2.png",
    "/templates/achados/prova-3.png",
  ],
  cupons: [
    "/templates/achados/cupom-1.svg",
    "/templates/achados/cupom-2.svg",
    "/templates/achados/cupom-3.svg",
    "/templates/achados/cupom-4.svg",
    "/templates/achados/cupom-5.svg",
    "/templates/achados/cupom-6.svg",
  ],

  footerMarca: "Achados na Promo",
  footerSub: "Garimpamos os menores preços e cupons pra você nunca mais pagar caro",
  footerDisclaimer:
    "Site demonstrativo de divulgação de ofertas, sem vínculo com os marketplaces citados. Podemos receber comissão de afiliado, sem custo extra pra você.",
  footerCopyright: "© 2026 Todos os direitos reservados - SM Company",

  corHeroBg: "#ffde59",
  corHeroTitulo: "#ffffff",
  corHeroSub: "#22265e",
  corPrimaria: "#22265e",
  corCta: "#22c55e",
  corCtaHover: "#16a34a",
  corCtaTexto: "#ffffff",
  corFundo: "#fffcf2",
  corSessaoCupons: "#fff4cf",
  corFinalBg1: "#ffc700",
  corFinalBg2: "#ffde59",
  corRodapeBg: "#1a1a1a",
  corRodapeDestaque: "#ffe600",
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

/** Merge seguro: config parcial/nula → defaults. Nunca lança. */
export function getAchadosConfig(raw: unknown): AchadosConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...DEFAULT_ACHADOS };
  const c = raw as Record<string, unknown>;
  const pick = (key: keyof AchadosConfig, fallback: string): string =>
    typeof c[key] === "string" && (c[key] as string).length > 0
      ? (c[key] as string)
      : (fallback as string);

  const vagas =
    typeof c.vagasPercent === "number" && Number.isFinite(c.vagasPercent)
      ? Math.min(100, Math.max(0, Math.round(c.vagasPercent as number)))
      : DEFAULT_ACHADOS.vagasPercent;

  // Listas vazias voltam para as imagens padrão (a LP nunca fica vazia).
  const ofertas = asStringArray(c.ofertas);
  const provas = asStringArray(c.provas);
  const cupons = asStringArray(c.cupons);

  return {
    ...DEFAULT_ACHADOS,
    ...Object.fromEntries(
      (Object.keys(DEFAULT_ACHADOS) as (keyof AchadosConfig)[])
        .filter((k) => !["ofertas", "provas", "cupons", "vagasPercent"].includes(k))
        .map((k) => [k, pick(k, DEFAULT_ACHADOS[k] as string)])
    ),
    vagasPercent: vagas,
    ofertas: ofertas.length > 0 ? ofertas : [...DEFAULT_ACHADOS.ofertas],
    provas: provas.length > 0 ? provas : [...DEFAULT_ACHADOS.provas],
    cupons: cupons.length > 0 ? cupons : [...DEFAULT_ACHADOS.cupons],
  } as AchadosConfig;
}
