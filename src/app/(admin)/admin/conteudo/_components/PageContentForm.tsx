"use client";

// =========================================================
// PageContentForm — renderiza o form completo para uma
// `key`, baseado em `FIELDS_BY_KEY`. Suporta:
//  - campos simples (text, textarea, url)
//  - segment (título com highlight) — 3 inputs agrupados
//  - list (string[])
//  - pairList (label/href[])
//  - crumbs (label/href[] com último sem link)
//
// Salva via PUT /api/admin/conteudo/[key].
// Tem ações "Salvar", "Resetar para padrão" e "Padrão".
// =========================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "./Toast";
import { FieldInput, type FieldDef } from "./FieldInput";
import { FIELDS_BY_KEY } from "./fieldsByKey";
import type { PageContentKey } from "@/lib/pageContent";

interface FormState {
  /** estado dos campos do form (objeto matching o shape da key) */
  values: Record<string, unknown>;
  /** JSON cru como string para steps/tools (campos complexos) */
  raw: Record<string, string>;
  /** baseline pra detectar dirty */
  baseline: Record<string, unknown>;
  rawBaseline: Record<string, string>;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function PageContentForm({
  key,
  initial,
  defaultContent,
  saved,
  updatedAt,
}: {
  key: PageContentKey;
  initial: Record<string, unknown>;
  defaultContent: Record<string, unknown>;
  saved: boolean;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  // Separa arrays/objetos complexos (steps/tools) pra editar como JSON cru.
  const groups = FIELDS_BY_KEY[key] ?? [];
  const complexKeys = new Set<string>();
  for (const g of groups) {
    for (const f of g.fields) {
      if (f.kind === "list") complexKeys.add(f.key);
    }
  }

  const initialValues: Record<string, unknown> = {};
  const initialRaw: Record<string, string> = {};
  for (const g of groups) {
    for (const f of g.fields) {
      const v = getValueAtPath(initial, f);
      if (complexKeys.has(pathForField(f))) {
        initialRaw[pathForField(f)] = JSON.stringify(v ?? [], null, 2);
      } else {
        initialValues[pathForField(f)] = v ?? "";
      }
    }
  }

  const [form, setForm] = useState<FormState>({
    values: initialValues,
    raw: initialRaw,
    baseline: initialValues,
    rawBaseline: initialRaw,
  });

  function updateField(def: FieldDef, next: unknown) {
    const path = pathForField(def);
    if (complexKeys.has(path)) {
      setForm((s) => ({ ...s, raw: { ...s.raw, [path]: String(next) } }));
    } else {
      setForm((s) => ({ ...s, values: { ...s.values, [path]: next } }));
    }
  }

  function isDirty(): boolean {
    for (const path of Object.keys(form.values)) {
      if (!deepEqual(form.values[path], form.baseline[path])) return true;
    }
    for (const path of Object.keys(form.raw)) {
      if (form.raw[path] !== form.rawBaseline[path]) return true;
    }
    return false;
  }

  function buildPayload(): Record<string, unknown> {
    // Reconstrói o objeto do shape da key.
    // Para `segment`, o valor guardado é um objeto {before, highlight, after};
    // precisa virar 3 chaves top-level no payload.
    const out: Record<string, unknown> = {};
    for (const g of groups) {
      for (const f of g.fields) {
        const path = pathForField(f);
        const rawVal = form.raw[path];
        if (complexKeys.has(path)) {
          try {
            out[path] = JSON.parse(rawVal ?? "[]");
          } catch {
            // buildPayloadSafe garante que isso não acontece;
            // fallback usa baseline para não bloquear render.
            out[path] = form.baseline[path];
          }
        } else if (f.kind === "segment") {
          const segVal = (form.values[path] ?? {}) as Record<string, unknown>;
          out[f.keys.before] = segVal[f.keys.before] ?? "";
          out[f.keys.highlight] = segVal[f.keys.highlight] ?? "";
          out[f.keys.after] = segVal[f.keys.after] ?? "";
        } else {
          out[path] = form.values[path];
        }
      }
    }
    return out;
  }

  function buildPayloadSafe(): Record<string, unknown> | null {
    for (const path of Object.keys(form.raw)) {
      try {
        JSON.parse(form.raw[path] ?? "");
      } catch {
        return null;
      }
    }
    return buildPayload();
  }

  function onSave() {
    const payload = buildPayloadSafe();
    if (!payload) {
      toast.show("Há JSON inválido em um dos campos complexos. Corrija antes de salvar.", "danger");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/conteudo/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: payload }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        toast.show("Conteúdo salvo.", "success");
        // Atualiza baseline — form fica "limpo".
        setForm((s) => ({
          ...s,
          baseline: { ...s.values },
          rawBaseline: { ...s.raw },
        }));
        router.refresh();
      } catch (err) {
        toast.show(
          err instanceof Error ? err.message : "Erro ao salvar conteúdo.",
          "danger",
        );
      }
    });
  }

  function onReset() {
    // Volta tudo ao defaultContent.
    const nextValues: Record<string, unknown> = {};
    const nextRaw: Record<string, string> = {};
    for (const g of groups) {
      for (const f of g.fields) {
        const v = getValueAtPath(defaultContent, f);
        const path = pathForField(f);
        if (complexKeys.has(path)) {
          nextRaw[path] = JSON.stringify(v ?? [], null, 2);
        } else {
          nextValues[path] = v ?? "";
        }
      }
    }
    setForm((s) => ({ ...s, values: nextValues, raw: nextRaw }));
    toast.show("Formulário preenchido com os valores padrão. Clique em 'Salvar' para aplicar.", "info");
  }

  async function onDelete() {
    if (!confirm("Apagar a customização e voltar ao padrão? (o site volta a usar a cópia do código)")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/conteudo/${key}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        toast.show("Override apagado. O site está usando o padrão.", "success");
        router.refresh();
        // Reset local
        onReset();
      } catch (err) {
        toast.show(
          err instanceof Error ? err.message : "Erro ao apagar override.",
          "danger",
        );
      }
    });
  }

  const dirty = isDirty();

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Status
          </span>
          {saved ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1fd29c]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Com override no banco
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">Usando padrão (sem override)</span>
          )}
        </div>
        {updatedAt && (
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Última atualização
            </span>
            <span className="text-xs text-slate-300">{formatDate(updatedAt)}</span>
          </div>
        )}
        {dirty && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-[#ffb066]/30 bg-[#ffb066]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffb066] animate-pulse-dot" />
            alterações não salvas
          </span>
        )}
        <div className={`flex items-center gap-2 ${dirty ? "" : "ml-auto"}`}>
          <button
            type="button"
            onClick={onSave}
            disabled={pending || !dirty}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={pending}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-50"
          >
            Preencher com padrão
          </button>
          {saved && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="rounded-lg border border-[#ff5c7a]/30 bg-[#ff5c7a]/10 px-3 py-2 text-xs text-[#ffb0bf] hover:bg-[#ff5c7a]/20 disabled:opacity-50"
            >
              Resetar para padrão
            </button>
          )}
        </div>
      </div>

      {/* Grupos de campos */}
      {groups.map((group, gi) => (
        <section key={gi} className="glass rounded-2xl p-5">
          <header className="mb-4">
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
            {group.description && (
              <p className="mt-1 text-xs text-slate-400">{group.description}</p>
            )}
          </header>
          <div className="space-y-4">
            {group.fields.map((def) => {
              const path = pathForField(def);
              if (complexKeys.has(path)) {
                return (
                  <ComplexJsonField
                    key={path}
                    def={def}
                    value={form.raw[path] ?? ""}
                    onChange={(next) => updateField(def, next)}
                  />
                );
              }
              return (
                <FieldInput
                  key={path}
                  def={def}
                  value={form.values[path]}
                  defaultValue={getValueAtPath(defaultContent, def)}
                  onChange={(next) => updateField(def, next)}
                />
              );
            })}
          </div>
        </section>
      ))}

      {/* Sticky save bar (recurso simplificado: dup dos controles) */}
      <div className="sticky bottom-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !dirty}
          className="btn-primary shadow-2xl disabled:opacity-50"
        >
          {pending ? "Salvando…" : dirty ? "Salvar alterações" : "Nada a salvar"}
        </button>
      </div>
    </div>
  );
}

function ComplexJsonField({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (next: string) => void;
}) {
  const label = (def as unknown as { label: string }).label;
  const help = (def as unknown as { help?: string }).help;

  // Feedback inline de JSON válido.
  let valid = true;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) valid = false;
  } catch {
    valid = false;
  }

  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-[10px] text-slate-500">{help}</span>
      </span>
      <textarea
        value={value}
        rows={10}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={`w-full rounded-lg border px-3 py-2 font-mono text-xs leading-relaxed text-white focus:outline-none focus:ring-2 ${
          valid
            ? "border-white/10 bg-[#0a1230]/70 focus:border-[#ff7a18]/60 focus:ring-[#ff7a18]/20"
            : "border-[#ff5c7a]/50 bg-[#ff5c7a]/5 focus:border-[#ff5c7a] focus:ring-[#ff5c7a]/30"
        }`}
      />
      <div className="flex items-center gap-2 text-[10px]">
        {valid ? (
          <span className="inline-flex items-center gap-1 text-[#1fd29c]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            JSON válido — {Array.isArray(parsed) ? parsed.length : 0} item(ns)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[#ffb0bf]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            JSON inválido
          </span>
        )}
      </div>
    </label>
  );
}

// =========================================================
// Helpers
// =========================================================

/** Resolve o `path` do campo no objeto de content. */
function pathForField(def: FieldDef): string {
  switch (def.kind) {
    case "segment": {
      // Segment usa 3 chaves diferentes — path é uma string composta.
      // O form trata segment internamente; aqui só devolvemos algo único.
      return `__segment__${def.keys.before}`;
    }
    case "list":
    case "pairList":
    case "crumbs":
      return def.key;
    default:
      return def.key;
  }
}

function getValueAtPath(content: Record<string, unknown>, def: FieldDef): unknown {
  switch (def.kind) {
    case "segment":
      return {
        [def.keys.before]: content[def.keys.before],
        [def.keys.highlight]: content[def.keys.highlight],
        [def.keys.after]: content[def.keys.after],
      };
    default:
      return content[def.key];
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
