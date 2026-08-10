// =========================================================
// Conteúdo editável das páginas públicas (LP) via admin.
//
// Catálogo de `key`s — cada chave é um contrato. O `content`
// salvo no banco é JSON no formato declarado em `CONTENT_SHAPE`
// (validado manualmente; o DB é Json livre).
//
// `DEFAULT_CONTENT` é o fallback hardcoded que mantém o site
// funcionando mesmo sem nada no banco.
//
// ⚠️  Este arquivo é SEGURO para client components: NÃO importa
// Prisma nem nada server-only. As funções que acessam o banco
// estão em `./pageContent.server.ts`.
// =========================================================

export const PAGE_CONTENT_KEYS = [
  "home_hero",
  "home_featured",
  "home_cta",
  "global_navbar",
  "global_footer",
  "page_metodo_header",
  "page_metodo_explainer",
  "page_metodo_how",
  "page_aulas_header",
  "page_ferramentas_header",
  "page_ferramentas_tools",
  "page_ferramentas_calculator",
  "page_ferramentas_dashboard",
] as const;

export type PageContentKey = typeof PAGE_CONTENT_KEYS[number];

// ─── Tipos de cada bloco ────────────────────────────────────

export interface HomeHero {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  bullets: readonly string[];
}

export interface HomeFeatured {
  eyebrow: string;
  titlePrefix: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export interface HomeCta {
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface GlobalNavbar {
  links: readonly NavLink[];
  ctaLabel: string;
  ctaHref: string;
}

export interface GlobalFooter {
  descriptionPrefix: string;
  descriptionHighlight: string;
  descriptionSuffix: string;
  platformLinks: readonly NavLink[];
  contatoLabel: string;
  contatoEmail: string;
  plataformaGratuitaLabel: string;
  copyrightTagline: string;
}

export interface Crumb {
  label: string;
  href?: string;
}

export interface PageHeaderContent {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  crumbs: readonly Crumb[];
}

export interface StepBase {
  key?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface MethodExplainerContent {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
  steps: readonly StepBase[];
}

export interface HowItWorksStep {
  n: string;
  t: string;
  d: string;
}

export interface HowItWorksContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: readonly HowItWorksStep[];
}

export interface ToolItem {
  name: string;
  description: string;
  status: string;
  cta: string;
  href: string;
  accent: boolean;
}

export interface ToolsContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  tools: readonly ToolItem[];
}

export interface CalculatorHeader {
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
}

export interface DashboardContent {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  subtitle: string;
}

// =========================================================
// Defaults (espelham a copy atual do site)
// =========================================================

export const DEFAULT_CONTENT = {
  home_hero: {
    eyebrow: "Plataforma 100% gratuita",
    titleBefore: "Aprenda a transformar",
    titleHighlight: "grupos em uma operação",
    titleAfter: "lucrativa.",
    subtitle:
      "Conteúdos, estratégias e ferramentas gratuitas para você aprender a estruturar sua operação de grupos, trabalhar com tráfego pago e acompanhar as métricas que realmente importam.",
    ctaPrimaryLabel: "COMEÇAR A APRENDER",
    ctaPrimaryHref: "/aulas",
    ctaSecondaryLabel: "CONHECER O MÉTODO GL",
    ctaSecondaryHref: "/metodo",
    bullets: ["Sem login", "Sem cartão", "Acesso imediato"],
  } satisfies HomeHero,

  home_featured: {
    eyebrow: "Comece por aqui",
    titlePrefix: "Vídeo introdutório",
    ctaPrimaryLabel: "Assistir agora",
    ctaSecondaryLabel: "Ver todas as aulas",
    ctaSecondaryHref: "/aulas",
  } satisfies HomeFeatured,

  home_cta: {
    titleBefore: "Pronto para entender a sua",
    titleHighlight: "operação",
    titleAfter: "de verdade?",
    subtitle:
      "Comece pelo vídeo introdutório e, em seguida, simule os números do seu grupo na calculadora.",
    ctaPrimaryLabel: "COMEÇAR A APRENDER",
    ctaPrimaryHref: "/aulas",
    ctaSecondaryLabel: "ABRIR A CALCULADORA",
    ctaSecondaryHref: "/ferramentas",
  } satisfies HomeCta,

  global_navbar: {
    links: [
      { label: "Método GL", href: "/metodo" },
      { label: "Aulas", href: "/aulas" },
      { label: "Ferramentas", href: "/ferramentas" },
    ],
    ctaLabel: "COMEÇAR AGORA",
    ctaHref: "/aulas",
  } satisfies GlobalNavbar,

  global_footer: {
    descriptionPrefix: "",
    descriptionHighlight: "Método de Grupos Lucrativos.",
    descriptionSuffix:
      "Conteúdo gratuito para quem quer aprender a construir e analisar operações de grupos com tráfego pago.",
    platformLinks: [
      { label: "Método GL", href: "/metodo" },
      { label: "Aulas", href: "/aulas" },
      { label: "Ferramentas", href: "/ferramentas" },
    ],
    contatoLabel: "Contato",
    contatoEmail: "contato@metodogl.online",
    plataformaGratuitaLabel: "Plataforma 100% gratuita",
    copyrightTagline: "Conteúdo educacional. Resultados dependem de operação, mercado e execução.",
  } satisfies GlobalFooter,

  page_metodo_header: {
    metadataTitle: "O Método GL — Como funciona",
    metadataDescription:
      "Entenda a metodologia por trás do Método GL: do tráfego pago à retenção, oferta, comissão e análise de resultado.",
    eyebrow: "O Método GL",
    titleBefore: "A lógica por trás de",
    titleHighlight: "grupos lucrativos",
    titleAfter: "",
    subtitle:
      "Do tráfego pago ao lucro: como cada peça se encaixa, o que acontece em cada etapa e por que algumas operações funcionam enquanto outras não saem do lugar.",
    crumbs: [
      { label: "Início", href: "/" },
      { label: "O Método GL" },
    ],
  } satisfies PageHeaderContent,

  page_metodo_explainer: {
    eyebrow: "O Método",
    titleBefore: "O que é o",
    titleHighlight: "Método GL",
    titleAfter: "?",
    subtitle:
      "Uma metodologia criada para estruturar operações de grupos de ofertas — da aquisição de pessoas via tráfego pago até a retenção, divulgação e análise financeira da operação.",
    steps: [
      { title: "Tráfego", description: "Utilizamos tráfego pago para levar pessoas interessadas até a operação." },
      { title: "Entrada no grupo", description: "O visitante entra no grupo através de uma estrutura de captação." },
      { title: "Retenção", description: "Mantemos a pessoa engajada para que ela permaneça ativa no grupo." },
      { title: "Ofertas", description: "Divulgamos ofertas de forma estratégica para gerar conversão." },
      { title: "Comissão", description: "As compras via link geram comissão para a operação." },
      { title: "Lucro", description: "Comissão menos investimento: o resultado real da operação." },
    ],
  } satisfies MethodExplainerContent,

  page_metodo_how: {
    eyebrow: "Como funciona",
    title: "Da atração ao resultado, em um fluxo claro",
    subtitle:
      "Seis etapas que sustentam qualquer operação de grupos lucrativos — independentemente do nicho, do tamanho ou do orçamento.",
    steps: [
      { n: "01", t: "Atrair pessoas", d: "Utilizamos tráfego pago para levar pessoas interessadas até a operação." },
      { n: "02", t: "Entrada no grupo", d: "O visitante entra no grupo através de uma estrutura de captação." },
      { n: "03", t: "Retenção", d: "Depois de entrar, o objetivo é fazer com que a pessoa permaneça no grupo." },
      { n: "04", t: "Ofertas", d: "As ofertas são divulgadas de forma estratégica para gerar conversão." },
      { n: "05", t: "Comissão", d: "Os usuários compram através dos links e geram comissão para a operação." },
      { n: "06", t: "Análise", d: "A operação é acompanhada através das métricas que realmente importam." },
    ],
  } satisfies HowItWorksContent,

  page_aulas_header: {
    metadataTitle: "Aulas gratuitas — Método GL",
    metadataDescription:
      "Conteúdos gratuitos sobre operação de grupos, tráfego pago, criativos, métricas e muito mais. Assista direto na plataforma, sem cadastro.",
    eyebrow: "Aulas gratuitas",
    titleBefore: "Aprenda com o",
    titleHighlight: "Método GL",
    titleAfter: "",
    subtitle:
      "Quatro trilhas, do fundamento à escala. Sua evolução fica salva no seu navegador — sem cadastro, sem login.",
    crumbs: [
      { label: "Início", href: "/" },
      { label: "Aulas" },
    ],
  } satisfies PageHeaderContent,

  page_ferramentas_header: {
    metadataTitle: "Ferramentas gratuitas — Método GL",
    metadataDescription:
      "Calculadora de operação, métricas essenciais e ferramentas para analisar a sua operação de grupos de ofertas.",
    eyebrow: "Ferramentas gratuitas",
    titleBefore: "Analise a sua",
    titleHighlight: "operação",
    titleAfter: "",
    subtitle:
      "Ferramentas práticas para você entender, com os números reais do seu grupo, se a operação está pagando o esforço.",
    crumbs: [
      { label: "Início", href: "/" },
      { label: "Ferramentas" },
    ],
  } satisfies PageHeaderContent,

  page_ferramentas_tools: {
    eyebrow: "",
    title: "",
    subtitle: "",
    tools: [
      {
        name: "Calculadora de Operação",
        description: "Calcule conversão, CAC efetivo, lucro e ROI com dados reais do seu grupo.",
        status: "Disponível",
        cta: "Usar agora",
        href: "/ferramentas",
        accent: true,
      },
      {
        name: "Calculadora de CPL",
        description: "Descubra quanto você está pagando, em média, por cada entrada na operação.",
        status: "Em breve",
        cta: "Em breve",
        href: "#",
        accent: false,
      },
      {
        name: "Calculadora de Comissão",
        description: "Estime quanto sua operação pode gerar a partir das pessoas que permanecem.",
        status: "Em breve",
        cta: "Em breve",
        href: "#",
        accent: false,
      },
      {
        name: "Simulador de Operação",
        description: "Projete cenários otimistas, pessimistas e o caso-base para decidir o que fazer.",
        status: "Em breve",
        cta: "Em breve",
        href: "#",
        accent: false,
      },
    ],
  } satisfies ToolsContent,

  page_ferramentas_calculator: {
    titleBefore: "Calculadora de",
    titleHighlight: "operação",
    titleAfter: "",
    subtitle:
      "Use os números reais do seu grupo para descobrir conversão, CAC efetivo, comissão, lucro e ROI.",
  } satisfies CalculatorHeader,

  page_ferramentas_dashboard: {
    eyebrow: "Métricas",
    titleBefore: "As métricas que",
    titleHighlight: "importam",
    titleAfter: "",
    subtitle: "Entenda cada número da operação em uma frase — sem jargão, sem fórmula.",
  } satisfies DashboardContent,
} as const;

// =========================================================
// Labels humanos para o admin (`/admin/conteudo`).
// Cada label aparece como heading da seção na listagem.
// =========================================================

export const CONTENT_LABELS: Record<PageContentKey, { title: string; description: string; group: string }> = {
  home_hero: { title: "Hero da home", description: "Eyebrow, título, parágrafo, 2 CTAs e 3 bullets", group: "Home" },
  home_featured: { title: "Vídeo em destaque", description: "Card 'Comece por aqui' e CTAs do vídeo", group: "Home" },
  home_cta: { title: "CTA final da home", description: "Bloco final antes do footer", group: "Home" },
  global_navbar: { title: "Menu principal", description: "Links do topo e CTA 'Começar agora'", group: "Global" },
  global_footer: { title: "Rodapé", description: "Descrição, links e contato", group: "Global" },
  page_metodo_header: { title: "Cabeçalho de /metodo", description: "Metadata, eyebrow, título, subtítulo e crumbs", group: "Método" },
  page_metodo_explainer: { title: "Explicador do método", description: "Seção com 6 etapas (título + descrição)", group: "Método" },
  page_metodo_how: { title: "Como funciona", description: "Seção com 6 etapas numeradas", group: "Método" },
  page_aulas_header: { title: "Cabeçalho de /aulas", description: "Metadata, eyebrow, título, subtítulo e crumbs", group: "Aulas" },
  page_ferramentas_header: { title: "Cabeçalho de /ferramentas", description: "Metadata, eyebrow, título, subtítulo e crumbs", group: "Ferramentas" },
  page_ferramentas_tools: { title: "Grid de ferramentas", description: "Lista de ferramentas com status e CTA", group: "Ferramentas" },
  page_ferramentas_calculator: { title: "Cabeçalho da calculadora", description: "Título e subtítulo da calculadora de operação", group: "Ferramentas" },
  page_ferramentas_dashboard: { title: "Cabeçalho do dashboard", description: "Título e subtítulo do dashboard de métricas", group: "Ferramentas" },
};

export function isPageContentKey(value: string): value is PageContentKey {
  return (PAGE_CONTENT_KEYS as readonly string[]).includes(value);
}
