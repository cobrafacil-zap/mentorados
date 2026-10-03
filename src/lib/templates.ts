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
  heroBadge: "● Vagas abertas hoje",
  heroTituloAntes: "As melhores ofertas do",
  heroLogoUrl: "",
  heroLogoAlt: "Mercado Livre",
  heroTituloDepois: "chegam direto no seu WhatsApp",
  heroSubtitulo:
    "Entre no grupo gratuito e receba promoções imperdíveis todos os dias, antes de todo mundo!",

  ctaTexto1: "aperte aqui para",
  ctaTexto2: "entrar no grupo!",
  ctaSub: "Grátis • Sem cadastro • Saia quando quiser",
  ctaFinal: "📲 Entrar no grupo agora, é grátis",
  ctaFinalSub: "Abre direto no WhatsApp",
  freeTag: "100% gratuito, nenhum dado pessoal solicitado",

  stat1Num: "+90 mil",
  stat1Label: "Membros",
  stat2Num: "R$0",
  stat2Label: "Custo",
  stat3Num: "Todo dia",
  stat3Label: "Ofertas novas",

  provaTitulo: "O que dizem as membras 💬",
  provaSub: "Prints reais de membros do grupo",

  cupomTitulo: "Cupons reais que chegam no grupo 🎟️",
  cupomSub: "Prints direto do Mercado Livre, válidos para todas as lojas",
  cupomNota: "👆 Esses cupons e muito mais chegam todo dia no grupo. Entre agora e não perca nenhum!",

  finalTitulo: "Ainda não entrou no grupo? 🎉",
  finalSub:
    "Mais de 90 mil mulheres já estão economizando todo dia. Sua vaga está reservada, por enquanto.",
  vagasPercent: 73,
  vagasLabel: "% das vagas de hoje já foram preenchidas",
  trust1: "🔒 100% seguro",
  trust2: "✅ Sem spam",
  trust3: "🚪 Saia quando quiser",

  overlayTitulo: "Você está quase lá!",
  overlaySub: "Abrindo o seu grupo de promoções no WhatsApp…",
  overlayBenefit1: "💸 100% grátis",
  overlayBenefit2: "📦 Ofertas todo dia",
  overlayBenefit3: "⚡ Antes de todo mundo",

  ofertas: [],
  provas: [],
  cupons: [],

  footerMarca: "Achados na Promo",
  footerSub: "Curadoria de cupons e promoções do Mercado Livre",
  footerDisclaimer:
    "Página de demonstração para fins de divulgação de ofertas. Não possui vínculo empresarial com o Mercado Livre.",
  footerCopyright: "© 2026 Todos os direitos reservados - SM Company",

  corHeroBg: "#ffde59",
  corHeroTitulo: "#ffffff",
  corHeroSub: "#22265e",
  corPrimaria: "#22265e",
  corCta: "#22c55e",
  corCtaHover: "#16a34a",
  corCtaTexto: "#ffffff",
  corFundo: "#fffcf2",
  corSessaoCupons: "#ffffff",
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

  return {
    ...DEFAULT_ACHADOS,
    ...Object.fromEntries(
      (Object.keys(DEFAULT_ACHADOS) as (keyof AchadosConfig)[])
        .filter((k) => !["ofertas", "provas", "cupons", "vagasPercent"].includes(k))
        .map((k) => [k, pick(k, DEFAULT_ACHADOS[k] as string)])
    ),
    vagasPercent: vagas,
    ofertas: asStringArray(c.ofertas),
    provas: asStringArray(c.provas),
    cupons: asStringArray(c.cupons),
  } as AchadosConfig;
}
