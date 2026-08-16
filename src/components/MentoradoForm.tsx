"use client";

import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Shape local (espelha `model Mentorado` em prisma/schema.prisma).
// Importar de `@prisma/client` trazia o PrismaClient inteiro pro bundle
// do client; `import type` não é confiável pra tree-shake em todos os bundlers.
type Mentorado = {
  id: string;
  slug: string;
  nome: string;
  ativo: boolean;
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

interface MentoradoFormProps {
  mentorado?: Mentorado;
}

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

export default function MentoradoForm({ mentorado }: MentoradoFormProps) {
  const router = useRouter();
  const isEditing = Boolean(mentorado);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(() => {
    const merged = { ...defaultValues, ...(mentorado || {}) };
    // Garante que campos nulos venham como string vazia
    return Object.fromEntries(
      Object.entries(merged).map(([key, value]) => [key, value ?? ""])
    ) as typeof defaultValues;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function updateField(name: keyof typeof defaultValues, value: string | boolean) {
    setForm((prev: typeof defaultValues) => ({ ...prev, [name]: value }));
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      slug: form.slug.toLowerCase().trim().replace(/\s+/g, "-"),
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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="linkCta" className="block text-sm font-medium">Link do botão CTA</label>
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
          <img src={form.imagemUrl} alt="Preview" className="mt-2 h-32 w-32 rounded-lg border border-zinc-700 object-cover" />
        ) : null}
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading || uploading}
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
