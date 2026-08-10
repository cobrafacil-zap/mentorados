// =========================================================
// FIELDS_BY_KEY — descreve os campos do form de cada `key`.
// Cada entrada é a lista ordenada de FieldDef's. O form
// renderiza um FieldInput por entry, agrupado em seções
// conforme `section` (separador visual com label + ajuda).
// =========================================================

import { DEFAULT_CONTENT, type PageContentKey } from "@/lib/pageContent";
import type { FieldDef } from "./FieldInput";

interface FieldGroup {
  title: string;
  description?: string;
  fields: FieldDef[];
}

export const FIELDS_BY_KEY: Record<PageContentKey, FieldGroup[]> = {
  home_hero: [
    {
      title: "Cabeçalho",
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow (selo acima do título)" },
        {
          kind: "segment",
          label: "Título principal",
          keys: { before: "titleBefore", highlight: "titleHighlight", after: "titleAfter" },
          defaults: {
            before: DEFAULT_CONTENT.home_hero.titleBefore,
            highlight: DEFAULT_CONTENT.home_hero.titleHighlight,
            after: DEFAULT_CONTENT.home_hero.titleAfter,
          },
        },
        { kind: "textarea", key: "subtitle", label: "Subtítulo / parágrafo principal", rows: 4 },
      ],
    },
    {
      title: "Botões (CTAs)",
      fields: [
        { kind: "text", key: "ctaPrimaryLabel", label: "CTA primário — texto" },
        { kind: "url", key: "ctaPrimaryHref", label: "CTA primário — destino" },
        { kind: "text", key: "ctaSecondaryLabel", label: "CTA secundário — texto" },
        { kind: "url", key: "ctaSecondaryHref", label: "CTA secundário — destino" },
      ],
    },
    {
      title: "Bullets (lista curta)",
      description: "Aparece abaixo dos CTAs (ex.: 'Sem login · Sem cartão · Acesso imediato')",
      fields: [
        { kind: "list", key: "bullets", label: "Bullets", itemLabel: "Bullet" },
      ],
    },
  ],

  home_featured: [
    {
      title: "Card 'Comece por aqui'",
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow (badge canto superior)" },
        { kind: "text", key: "titlePrefix", label: "Pill acima do título (ex: 'Vídeo introdutório')" },
        { kind: "text", key: "ctaPrimaryLabel", label: "CTA primário — texto" },
        { kind: "text", key: "ctaSecondaryLabel", label: "CTA secundário — texto" },
        { kind: "url", key: "ctaSecondaryHref", label: "CTA secundário — destino" },
      ],
    },
  ],

  home_cta: [
    {
      title: "CTA final da home",
      fields: [
        {
          kind: "segment",
          label: "Título",
          keys: { before: "titleBefore", highlight: "titleHighlight", after: "titleAfter" },
          defaults: {
            before: DEFAULT_CONTENT.home_cta.titleBefore,
            highlight: DEFAULT_CONTENT.home_cta.titleHighlight,
            after: DEFAULT_CONTENT.home_cta.titleAfter,
          },
        },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 3 },
        { kind: "text", key: "ctaPrimaryLabel", label: "CTA primário — texto" },
        { kind: "url", key: "ctaPrimaryHref", label: "CTA primário — destino" },
        { kind: "text", key: "ctaSecondaryLabel", label: "CTA secundário — texto" },
        { kind: "url", key: "ctaSecondaryHref", label: "CTA secundário — destino" },
      ],
    },
  ],

  global_navbar: [
    {
      title: "Links e CTA",
      fields: [
        {
          kind: "pairList",
          key: "links",
          label: "Links do menu",
          itemLabel: "Texto do link",
          hrefLabel: "Destino",
        },
        { kind: "text", key: "ctaLabel", label: "CTA 'começar agora' — texto" },
        { kind: "url", key: "ctaHref", label: "CTA 'começar agora' — destino" },
      ],
    },
  ],

  global_footer: [
    {
      title: "Descrição",
      fields: [
        { kind: "text", key: "descriptionPrefix", label: "Descrição — antes do destaque" },
        { kind: "text", key: "descriptionHighlight", label: "Descrição — destaque (em negrito)" },
        { kind: "textarea", key: "descriptionSuffix", label: "Descrição — depois do destaque", rows: 3 },
      ],
    },
    {
      title: "Links e contato",
      fields: [
        {
          kind: "pairList",
          key: "platformLinks",
          label: "Links da plataforma",
          itemLabel: "Texto",
          hrefLabel: "Destino",
        },
        { kind: "text", key: "contatoLabel", label: "Label 'Contato'" },
        { kind: "text", key: "contatoEmail", label: "E-mail de contato" },
        { kind: "text", key: "plataformaGratuitaLabel", label: "Selo 'Plataforma 100% gratuita'" },
      ],
    },
    {
      title: "Copyright",
      fields: [
        { kind: "textarea", key: "copyrightTagline", label: "Texto de copyright", rows: 2 },
      ],
    },
  ],

  page_metodo_header: pageHeaderFields("Cabeçalho da página /metodo"),
  page_aulas_header: pageHeaderFields("Cabeçalho da página /aulas"),
  page_ferramentas_header: pageHeaderFields("Cabeçalho da página /ferramentas"),

  page_metodo_explainer: [
    {
      title: "Cabeçalho",
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow" },
        {
          kind: "segment",
          label: "Título",
          keys: { before: "titleBefore", highlight: "titleHighlight", after: "titleAfter" },
          defaults: {
            before: DEFAULT_CONTENT.page_metodo_explainer.titleBefore,
            highlight: DEFAULT_CONTENT.page_metodo_explainer.titleHighlight,
            after: DEFAULT_CONTENT.page_metodo_explainer.titleAfter,
          },
        },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 4 },
      ],
    },
    {
      title: "Etapas",
      description: "Lista de 6 etapas exibidas com ícone + título + descrição. Os ícones não são editáveis.",
      fields: [
        {
          kind: "list",
          key: "steps",
          label: "Etapas (formato JSON: [{ title, description }])",
          itemLabel: "Etapa completa",
          help: "Use JSON.stringify / JSON.parse se preferir editar como objeto",
        },
      ],
    },
  ],

  page_metodo_how: [
    {
      title: "Cabeçalho",
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow" },
        { kind: "text", key: "title", label: "Título" },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 3 },
      ],
    },
    {
      title: "Etapas (numeradas)",
      description: "Lista de 6 itens com número + título + descrição.",
      fields: [
        {
          kind: "list",
          key: "steps",
          label: "Etapas (formato JSON com n, t, d)",
          itemLabel: "Etapa completa",
          help: "Cada item deve ter forma { n, t, d }",
        },
      ],
    },
  ],

  page_ferramentas_tools: [
    {
      title: "Cabeçalho (reservado)",
      description: "ToolsGrid hoje não usa header, mas as chaves ficam aqui para o futuro.",
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow" },
        { kind: "text", key: "title", label: "Título" },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 3 },
      ],
    },
    {
      title: "Ferramentas",
      description: "Lista de 4 ferramentas com nome, descrição, status, CTA e link.",
      fields: [
        {
          kind: "list",
          key: "tools",
          label: "Ferramentas (formato JSON com name, description, status, cta, href, accent)",
          itemLabel: "Ferramenta completa",
          help: "Cada item deve ter forma { name, description, status, cta, href, accent }",
        },
      ],
    },
  ],

  page_ferramentas_calculator: [
    {
      title: "Cabeçalho da calculadora",
      fields: [
        {
          kind: "segment",
          label: "Título",
          keys: { before: "titleBefore", highlight: "titleHighlight", after: "titleAfter" },
          defaults: {
            before: DEFAULT_CONTENT.page_ferramentas_calculator.titleBefore,
            highlight: DEFAULT_CONTENT.page_ferramentas_calculator.titleHighlight,
            after: DEFAULT_CONTENT.page_ferramentas_calculator.titleAfter,
          },
        },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 3 },
      ],
    },
  ],

  page_ferramentas_dashboard: [
    {
      title: "Cabeçalho do dashboard",
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow" },
        {
          kind: "segment",
          label: "Título",
          keys: { before: "titleBefore", highlight: "titleHighlight", after: "titleAfter" },
          defaults: {
            before: DEFAULT_CONTENT.page_ferramentas_dashboard.titleBefore,
            highlight: DEFAULT_CONTENT.page_ferramentas_dashboard.titleHighlight,
            after: DEFAULT_CONTENT.page_ferramentas_dashboard.titleAfter,
          },
        },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 3 },
      ],
    },
  ],
};

function pageHeaderFields(title: string): FieldGroup[] {
  return [
    {
      title: "SEO (metadata)",
      fields: [
        { kind: "text", key: "metadataTitle", label: "Title (aba + Google)" },
        { kind: "textarea", key: "metadataDescription", label: "Meta description (Google)", rows: 2 },
      ],
    },
    {
      title,
      fields: [
        { kind: "text", key: "eyebrow", label: "Eyebrow (selo)" },
        {
          kind: "segment",
          label: "Título",
          keys: { before: "titleBefore", highlight: "titleHighlight", after: "titleAfter" },
          defaults: { before: "", highlight: "", after: "" },
        },
        { kind: "textarea", key: "subtitle", label: "Subtítulo", rows: 3 },
      ],
    },
    {
      title: "Breadcrumbs",
      fields: [
        {
          kind: "crumbs",
          key: "crumbs",
          label: "Trilha de navegação",
          itemLabel: "Label",
          hrefLabel: "Link (opcional)",
          help: "Itens com link navegam, último item geralmente fica sem.",
        },
      ],
    },
  ];
}
