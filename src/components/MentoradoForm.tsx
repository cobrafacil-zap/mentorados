"use client";

import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseToR2 } from "@/lib/storage-url";
import { TEMPLATES, DEFAULT_ACHADOS, getAchadosConfig, isValidTemplate, type AchadosConfig } from "@/lib/templates";
import { TemplateImageList } from "./TemplateImageList";

// Shape local (espelha `model Mentorado` em prisma/schema.prisma).
// Importar de `@prisma/client` trazia o PrismaClient inteiro pro bundle
// do client; `import type` não é confiável pra tree-shake em todos os bundlers.
type Mentorado = {
  id: string;
  slug: string;
  nome: string;
  ativo: boolean;
  template?: string;
  templateConfig?: unknown;
  tituloHero: string;
  tituloSecao: string;
  texto1: string;
  texto2: string;
  texto3: string;
  imagemUrl: string | null;
  linkCta: string;
  corTopo: string;
  corFundo: string;
  corBotao: string;
  corBotaoHover: string;
  corTexto: string;
  corTextoSecundario: string;
  pixelId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const defaultValues = {
  slug: "",
  nome: "",
  ativo: true,
  template: "classico",
  tituloHero: "APROVEITE AGORA AS MELHORES PROMOÇÕES DE 2026!",
  tituloSecao: "🤑 GRUPO VIP DE PROMOÇÕES E CUPONS",
  texto1: "Produtos com 50%, 60% e 70% OFF",
  texto2: "MAIS DE 50 MIL MEMBROS APROVEITANDO AS OFERTAS, ENTRE JÁ!",
  texto3: "JÁ SOMOS +50 MIL MEMBROS",
  imagemUrl: "",
  linkCta: "",
  corTopo: "#ff0000",
  corFundo: "#232323",
  corBotao: "#29E843",
  corBotaoHover: "#02FF07",
  corTexto: "#FFFFFF",
  corTextoSecundario: "#DADADA",
  pixelId: "",
};

const colorFields = [
  { name: "corTopo", label: "Cor do topo e rodapé" },
  { name: "corFundo", label: "Cor de fundo da seção principal" },
  { name: "corBotao", label: "Cor do botão" },
  { name: "corBotaoHover", label: "Cor do botão ao passar o mouse" },
  { name: "corTexto", label: "Cor do texto principal" },
  { name: "corTextoSecundario", label: "Cor do texto secundário" },
] as const;

const textFields = [
  { name: "tituloHero", label: "Título do topo" },
  { name: "tituloSecao", label: "Título da seção principal" },
  { name: "texto1", label: "Texto 1" },
  { name: "texto2", label: "Texto 2 (destaque)" },
  { name: "texto3", label: "Texto 3 (rodapé da seção)" },
] as const;

/* Campos de texto do template Achados, agrupados por seção */
const achadosSections: { title: string; fields: { name: keyof AchadosConfig; label: string; multiline?: boolean }[] }[] = [
  {
    title: "Hero",
    fields: [
      { name: "heroBadge", label: "Selo do topo (ex: ● Vagas abertas hoje)" },
      { name: "heroTituloAntes", label: "Título — antes do logo" },
      { name: "heroLogoAlt", label: "Texto alternativo do logo" },
      { name: "heroTituloDepois", label: "Título — depois do logo (destaque)" },
      { name: "heroSubtitulo", label: "Subtítulo do hero" },
    ],
  },
  {
    title: "Botões e chamada grátis",
    fields: [
      { name: "ctaTexto1", label: "Botão — linha 1" },
      { name: "ctaTexto2", label: "Botão — linha 2" },
      { name: "ctaSub", label: "Botão — observação" },
      { name: "ctaFinal", label: "Botão final" },
      { name: "ctaFinalSub", label: "Botão final — observação" },
      { name: "freeTag", label: "Linha 100% gratuito" },
    ],
  },
  {
    title: "Contadores",
    fields: [
      { name: "stat1Num", label: "Destaque 1 — número" },
      { name: "stat1Label", label: "Destaque 1 — rótulo" },
      { name: "stat2Num", label: "Destaque 2 — número" },
      { name: "stat2Label", label: "Destaque 2 — rótulo" },
      { name: "stat3Num", label: "Destaque 3 — número" },
      { name: "stat3Label", label: "Destaque 3 — rótulo" },
    ],
  },
  {
    title: "Prova social e cupons",
    fields: [
      { name: "provaTitulo", label: "Título prova social" },
      { name: "provaSub", label: "Subtítulo prova social" },
      { name: "cupomTitulo", label: "Título cupons" },
      { name: "cupomSub", label: "Subtítulo cupons" },
      { name: "cupomNota", label: "Nota abaixo dos cupons", multiline: true },
    ],
  },
  {
    title: "CTA final",
    fields: [
      { name: "finalTitulo", label: "Título final" },
      { name: "finalSub", label: "Subtítulo final" },
      { name: "vagasLabel", label: "Texto das vagas (ex: % das vagas...)" },
      { name: "trust1", label: "Confiança 1" },
      { name: "trust2", label: "Confiança 2" },
      { name: "trust3", label: "Confiança 3" },
    ],
  },
  {
    title: "Overlay (tela de redirecionamento)",
    fields: [
      { name: "overlayTitulo", label: "Título do overlay" },
      { name: "overlaySub", label: "Subtítulo do overlay" },
      { name: "overlayBenefit1", label: "Benefício 1" },
      { name: "overlayBenefit2", label: "Benefício 2" },
      { name: "overlayBenefit3", label: "Benefício 3" },
    ],
  },
  {
    title: "Rodapé",
    fields: [
      { name: "footerMarca", label: "Marca" },
      { name: "footerSub", label: "Descrição da marca" },
      { name: "footerDisclaimer", label: "Aviso legal", multiline: true },
      { name: "footerCopyright", label: "Copyright" },
    ],
  },
];

const achadosColors: { name: keyof AchadosConfig; label: string }[] = [
  { name: "corHeroBg", label: "Fundo do hero" },
  { name: "corHeroTitulo", label: "Título do hero" },
  { name: "corHeroSub", label: "Subtítulo do hero" },
  { name: "corPrimaria", label: "Cor primária (detalhes)" },
  { name: "corCta", label: "Cor do botão" },
  { name: "corCtaHover", label: "Botão hover" },
  { name: "corCtaTexto", label: "Texto do botão" },
  { name: "corFundo", label: "Fundo da página" },
  { name: "corSessaoCupons", label: "Fundo seção cupons" },
  { name: "corFinalBg1", label: "CTA final — gradiente 1" },
  { name: "corFinalBg2", label: "CTA final — gradiente 2" },
  { name: "corRodapeBg", label: "Fundo do rodapé" },
  { name: "corRodapeDestaque", label: "Destaque do rodapé" },
];

interface MentoradoFormProps {
  mentorado?: Mentorado;
}

export default function MentoradoForm({ mentorado }: MentoradoFormProps) {
  const router = useRouter();
  const isEditing = Boolean(mentorado);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(() => {
    const merged = { ...defaultValues, ...(mentorado || {}) };
    return Object.fromEntries(
      Object.entries(merged).map(([key, value]) => [key, value ?? ""])
    ) as typeof defaultValues;
  });
  const [template, setTemplate] = useState<string>(() =>
    isValidTemplate(mentorado?.template) ? mentorado!.template as string : "classico"
  );
  const [achados, setAchados] = useState<AchadosConfig>(() =>
    getAchadosConfig(mentorado?.templateConfig)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  function updateField(name: keyof typeof defaultValues, value: string | boolean) {
    setForm((prev: typeof defaultValues) => ({ ...prev, [name]: value }));
  }

  function updateAchados(name: keyof AchadosConfig, value: string | number | string[]) {
    setAchados((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      updateField("imagemUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      updateAchados("heroLogoUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no upload do logo");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      slug: form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
      template,
      // Preserva config ao voltar pro clássico (API ignora undefined no PUT)
      templateConfig: template === "achados" ? achados : undefined,
    };

    const url = isEditing ? `/api/mentorados/${mentorado!.id}` : "/api/mentorados";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Tem certeza que deseja excluir este mentorado?")) return;

    const res = await fetch(`/api/mentorados/${mentorado!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Erro ao excluir");
    }
  }

  function resetAchados() {
    if (!confirm("Restaurar todos os textos e cores padrão do template Achados? (As imagens serão mantidas)")) return;
    setAchados((prev) => ({ ...DEFAULT_ACHADOS, ofertas: prev.ofertas, provas: prev.provas, cupons: prev.cupons, heroLogoUrl: prev.heroLogoUrl }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      {error ? <div className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="nome" className="block text-sm font-medium">Nome</label>
          <input
            id="nome"
            value={form.nome}
            onChange={(e) => updateField("nome", e.target.value)}
            required
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="block text-sm font-medium">Slug (subdomínio)</label>
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
            disabled={isEditing}
            placeholder="ex: joao"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-red-500 focus:outline-none disabled:opacity-50"
          />
          {form.slug ? <p className="text-xs text-zinc-500">{form.slug}.metodogl.site</p> : null}
        </div>
      </div>

      {/* Seletor de template */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Template da página</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={`rounded-lg border p-4 text-left transition ${
                template === t.id
                  ? "border-green-500 bg-green-950/30"
                  : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    template === t.id ? "border-green-500" : "border-zinc-500"
                  }`}
                >
                  {template === t.id ? <span className="h-2 w-2 rounded-full bg-green-500" /> : null}
                </span>
                <span className="font-medium">{t.nome}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{t.descricao}</p>
            </button>
          ))}
        </div>
        {template === "classico" && isEditing && mentorado?.template === "achados" ? (
          <p className="text-xs text-amber-400">Ao salvar como Clássico, a config do Achados é preservada — dá pra voltar depois sem perder nada.</p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="linkCta" className="block text-sm font-medium">Link do botão CTA (WhatsApp)</label>
          <input
            id="linkCta"
            type="url"
            value={form.linkCta}
            onChange={(e) => updateField("linkCta", e.target.value)}
            required
            placeholder="https://..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pixelId" className="block text-sm font-medium">Meta Pixel ID</label>
          <input
            id="pixelId"
            value={form.pixelId}
            onChange={(e) => updateField("pixelId", e.target.value)}
            placeholder="1288586539700077"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="ativo"
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => updateField("ativo", e.target.checked)}
          className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-red-600"
        />
        <label htmlFor="ativo" className="text-sm font-medium">Mentorado ativo</label>
      </div>

      {template === "classico" ? (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Textos da página</h3>
            {textFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="block text-sm font-medium">{field.label}</label>
                <input
                  id={field.name}
                  value={String(form[field.name as keyof typeof defaultValues] ?? "")}
                  onChange={(e) => updateField(field.name as keyof typeof defaultValues, e.target.value)}
                  className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cores</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {colorFields.map((field) => (
                <div key={field.name} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 p-3">
                  <label htmlFor={field.name} className="text-sm font-medium">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      id={field.name}
                      type="color"
                      value={String(form[field.name as keyof typeof form] ?? "#000000")}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={String(form[field.name as keyof typeof form] ?? "")}
                      onChange={(e) => updateField(field.name, e.target.value)}
                      className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="imagem" className="block text-sm font-medium">Imagem da página</label>
            <input
              id="imagem"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-white"
            />
            {uploading ? <p className="text-xs text-zinc-400">Enviando...</p> : null}
            {form.imagemUrl ? (
              <img src={supabaseToR2(form.imagemUrl)} alt="Preview" className="mt-2 h-32 w-32 rounded-lg border border-zinc-700 object-cover" />
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Conteúdo do template Achados</h3>
            <button type="button" onClick={resetAchados} className="rounded bg-zinc-800 px-3 py-1 text-xs text-white hover:bg-zinc-700">
              Restaurar padrões
            </button>
          </div>

          {achadosSections.map((section) => (
            <div key={section.title} className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <h4 className="font-medium text-zinc-200">{section.title}</h4>
              {section.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={`achados-${field.name}`} className="block text-sm font-medium text-zinc-300">{field.label}</label>
                  {field.multiline ? (
                    <textarea
                      id={`achados-${field.name}`}
                      value={String(achados[field.name] ?? "")}
                      onChange={(e) => updateAchados(field.name, e.target.value)}
                      rows={3}
                      className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      id={`achados-${field.name}`}
                      value={String(achados[field.name] ?? "")}
                      onChange={(e) => updateAchados(field.name, e.target.value)}
                      className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}
              {section.title === "CTA final" ? (
                <div className="space-y-2">
                  <label htmlFor="achados-vagasPercent" className="block text-sm font-medium text-zinc-300">Percentual das vagas (0–100)</label>
                  <input
                    id="achados-vagasPercent"
                    type="number"
                    min={0}
                    max={100}
                    value={achados.vagasPercent}
                    onChange={(e) => updateAchados("vagasPercent", Number(e.target.value))}
                    className="w-32 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
              ) : null}
            </div>
          ))}

          <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <h4 className="font-medium text-zinc-200">Cores do template</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {achadosColors.map((field) => (
                <div key={field.name} className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 p-3">
                  <label htmlFor={`achados-${field.name}`} className="text-sm font-medium">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`achados-${field.name}`}
                      type="color"
                      value={String(achados[field.name] ?? "#000000")}
                      onChange={(e) => updateAchados(field.name, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={String(achados[field.name] ?? "")}
                      onChange={(e) => updateAchados(field.name, e.target.value)}
                      className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <label htmlFor="achados-logo" className="block text-sm font-medium">Logo do hero (ex: logo do marketplace)</label>
            <p className="text-xs text-zinc-500">Se vazio, usa a foto do mentorado (campo &quot;Imagem&quot; abaixo) ou o texto alternativo.</p>
            <div className="flex gap-2">
              <input
                id="achados-logo-url"
                type="url"
                value={achados.heroLogoUrl}
                onChange={(e) => updateAchados("heroLogoUrl", e.target.value)}
                placeholder="https://... (ou suba um arquivo)"
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
              />
              {achados.heroLogoUrl ? (
                <button type="button" onClick={() => updateAchados("heroLogoUrl", "")} className="shrink-0 rounded bg-zinc-800 px-3 py-2 text-sm text-white hover:bg-zinc-700">Limpar</button>
              ) : null}
            </div>
            <input
              id="achados-logo"
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-white"
            />
            {uploadingLogo ? <p className="text-xs text-zinc-400">Enviando...</p> : null}
            {achados.heroLogoUrl ? (
              <img src={supabaseToR2(achados.heroLogoUrl)} alt="Logo preview" className="mt-2 h-12 object-contain" />
            ) : null}
          </div>

          <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
            <h4 className="font-medium text-zinc-200">Imagens dos carrosséis</h4>
            <TemplateImageList label="Ofertas (hero)" hint="Fotos de produtos do carrossel principal" values={achados.ofertas} onChange={(v) => updateAchados("ofertas", v)} />
            <TemplateImageList label="Provas (depoimentos)" hint="Prints de depoimentos — formato vertical" values={achados.provas} onChange={(v) => updateAchados("provas", v)} tall />
            <TemplateImageList label="Cupons" hint="Prints de cupons — formato paisagem" values={achados.cupons} onChange={(v) => updateAchados("cupons", v)} />
          </div>

          <div className="space-y-2">
            <label htmlFor="imagem" className="block text-sm font-medium">Foto do mentorado (usada como logo reserva)</label>
            <input
              id="imagem"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-white"
            />
            {uploading ? <p className="text-xs text-zinc-400">Enviando...</p> : null}
            {form.imagemUrl ? (
              <img src={supabaseToR2(form.imagemUrl)} alt="Preview" className="mt-2 h-32 w-32 rounded-lg border border-zinc-700 object-cover" />
            ) : null}
          </div>
        </>
      )}

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading || uploading || uploadingLogo}
          className="rounded bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar mentorado"}
        </button>

        {isEditing ? (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded bg-zinc-800 px-6 py-2 font-medium text-white transition hover:bg-red-900"
          >
            Excluir
          </button>
        ) : null}
      </div>
    </form>
  );
}
