"use client";

// =========================================================
// FieldInput — renderiza um campo do form de conteúdo.
// Suporta: text, textarea, url, segment (highlight),
// list (string[]), pairList (label/href), crumbs.
// =========================================================

import { useState } from "react";

export type FieldDef =
  | { kind: "text"; key: string; label: string; placeholder?: string; help?: string }
  | { kind: "textarea"; key: string; label: string; rows?: number; help?: string }
  | { kind: "url"; key: string; label: string; placeholder?: string; help?: string }
  | { kind: "segment"; label: string; help?: string; keys: { before: string; highlight: string; after: string }; defaults: { before: string; highlight: string; after: string } }
  | { kind: "list"; key: string; label: string; itemLabel: string; help?: string }
  | { kind: "pairList"; key: string; label: string; itemLabel: string; hrefLabel: string; help?: string }
  | { kind: "crumbs"; key: string; label: string; help?: string; itemLabel?: string; hrefLabel?: string };

interface FieldInputProps {
  def: FieldDef;
  value: unknown;
  defaultValue: unknown;
  onChange: (next: unknown) => void;
}

export function FieldInput({ def, value, onChange }: FieldInputProps) {
  const [collapsed, setCollapsed] = useState(false);

  switch (def.kind) {
    case "text": {
      const v = typeof value === "string" ? value : "";
      return (
        <label className="block space-y-1.5">
          <FieldLabel label={def.label} help={def.help} />
          <input
            type="text"
            value={v}
            placeholder={def.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
          />
        </label>
      );
    }

    case "textarea": {
      const v = typeof value === "string" ? value : "";
      return (
        <label className="block space-y-1.5">
          <FieldLabel label={def.label} help={def.help} />
          <textarea
            value={v}
            rows={def.rows ?? 4}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
          />
        </label>
      );
    }

    case "url": {
      const v = typeof value === "string" ? value : "";
      return (
        <label className="block space-y-1.5">
          <FieldLabel label={def.label} help={def.help} />
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <path d="M10 14a5 5 0 007.07 0l3-3a5 5 0 10-7.07-7.07l-1.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M14 10a5 5 0 00-7.07 0l-3 3a5 5 0 107.07 7.07l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="url"
              value={v}
              placeholder={def.placeholder ?? "https://… ou /caminho"}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a1230]/55 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
            />
          </div>
        </label>
      );
    }

    case "segment": {
      const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
      const vBefore = typeof obj[def.keys.before] === "string" ? (obj[def.keys.before] as string) : def.defaults.before;
      const vHighlight = typeof obj[def.keys.highlight] === "string" ? (obj[def.keys.highlight] as string) : def.defaults.highlight;
      const vAfter = typeof obj[def.keys.after] === "string" ? (obj[def.keys.after] as string) : def.defaults.after;

      return (
        <div className="space-y-1.5">
          <FieldLabel label={def.label} help={def.help} />
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Antes</span>
              <input
                type="text"
                value={vBefore}
                onChange={(e) => onChange({ ...obj, [def.keys.before]: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#ffb066]">Highlight (gradient)</span>
              <input
                type="text"
                value={vHighlight}
                onChange={(e) => onChange({ ...obj, [def.keys.highlight]: e.target.value })}
                className="w-full rounded-lg border border-[#ff7a18]/40 bg-[#0a1230]/55 px-3 py-2 text-sm font-semibold text-[#ffb066] placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Depois</span>
              <input
                type="text"
                value={vAfter}
                onChange={(e) => onChange({ ...obj, [def.keys.after]: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
              />
            </label>
          </div>
        </div>
      );
    }

    case "list": {
      const arr = Array.isArray(value) ? (value as unknown[]) : [];
      return (
        <ListField
          label={def.label}
          itemLabel={def.itemLabel}
          help={def.help}
          values={arr}
          onChange={onChange}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      );
    }

    case "pairList": {
      const arr = Array.isArray(value) ? (value as unknown[]) : [];
      return (
        <PairListField
          label={def.label}
          itemLabel={def.itemLabel}
          hrefLabel={def.hrefLabel}
          help={def.help}
          values={arr}
          onChange={onChange}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      );
    }

    case "crumbs": {
      const arr = Array.isArray(value) ? (value as unknown[]) : [];
      return (
        <PairListField
          label={def.label}
          itemLabel={def.itemLabel ?? "Label"}
          hrefLabel={def.hrefLabel ?? "Link (opcional)"}
          help={def.help ?? "Último item geralmente não tem link"}
          values={arr}
          onChange={onChange}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          hrefOptional
        />
      );
    }
  }
}

function FieldLabel({ label, help }: { label: string; help?: string }) {
  return (
    <span className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      {help && <span className="text-[10px] text-slate-500">{help}</span>}
    </span>
  );
}

function ListField({
  label,
  itemLabel,
  values,
  help,
  onChange,
  collapsed,
  setCollapsed,
}: {
  label: string;
  itemLabel: string;
  help?: string;
  values: unknown[];
  onChange: (next: unknown[]) => void;
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
}) {
  const list: string[] = values.map((v) => (typeof v === "string" ? v : ""));

  function update(i: number, val: string) {
    const next = [...list];
    next[i] = val;
    onChange(next);
  }
  function add() {
    onChange([...list, ""]);
  }
  function remove(i: number) {
    onChange(list.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} help={help} />
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        {list.length === 0 && (
          <p className="text-xs text-slate-500">Nenhum item. Clique em “Adicionar” para começar.</p>
        )}
        {list.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-mono text-slate-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <input
              type="text"
              value={v}
              placeholder={`${itemLabel} ${i + 1}`}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
            />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para cima" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 14l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Mover para baixo" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 10l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => remove(i)} aria-label="Remover" className="flex h-7 w-7 items-center justify-center rounded-md border border-[#ff5c7a]/20 bg-[#ff5c7a]/5 text-[#ffb0bf] hover:bg-[#ff5c7a]/15">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        ))}
        {!collapsed && (
          <button type="button" onClick={add} className="mt-1 w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-slate-400 hover:border-[#ff7a18]/40 hover:text-[#ffb066]">
            + Adicionar {itemLabel.toLowerCase()}
          </button>
        )}
        {collapsed && (
          <button type="button" onClick={() => setCollapsed(false)} className="mt-1 w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-slate-400 hover:border-[#ff7a18]/40 hover:text-[#ffb066]">
            Expandir lista
          </button>
        )}
      </div>
    </div>
  );
}

function PairListField({
  label,
  itemLabel,
  hrefLabel,
  help,
  values,
  onChange,
  collapsed,
  setCollapsed,
  hrefOptional = false,
}: {
  label: string;
  itemLabel: string;
  hrefLabel: string;
  help?: string;
  values: unknown[];
  onChange: (next: unknown[]) => void;
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  hrefOptional?: boolean;
}) {
  const list: { label: string; href: string }[] = values.map((v) => {
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return {
        label: typeof o.label === "string" ? o.label : "",
        href: typeof o.href === "string" ? o.href : "",
      };
    }
    return { label: "", href: "" };
  });

  function update(i: number, key: "label" | "href", val: string) {
    const next = list.map((row, idx) => (idx === i ? { ...row, [key]: val } : row));
    onChange(next);
  }
  function add() {
    onChange([...list, { label: "", href: "" }]);
  }
  function remove(i: number) {
    onChange(list.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} help={help} />
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        {list.length === 0 && (
          <p className="text-xs text-slate-500">Nenhum item. Clique em “Adicionar” para começar.</p>
        )}
        {list.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-flex h-9 w-7 flex-shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-mono text-slate-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <input
              type="text"
              value={row.label}
              placeholder={itemLabel}
              onChange={(e) => update(i, "label", e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
            />
            <input
              type="text"
              value={row.href}
              placeholder={hrefLabel}
              onChange={(e) => update(i, "href", e.target.value)}
              className="w-40 rounded-lg border border-white/10 bg-[#0a1230]/55 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-[#ff7a18]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/20"
            />
            <button type="button" onClick={() => remove(i)} aria-label="Remover" className="flex h-9 w-7 flex-shrink-0 items-center justify-center rounded-md border border-[#ff5c7a]/20 bg-[#ff5c7a]/5 text-[#ffb0bf] hover:bg-[#ff5c7a]/15">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        ))}
        {!collapsed && (
          <button type="button" onClick={add} className="mt-1 w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-slate-400 hover:border-[#ff7a18]/40 hover:text-[#ffb066]">
            + Adicionar item
          </button>
        )}
        {collapsed && (
          <button type="button" onClick={() => setCollapsed(false)} className="mt-1 w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-slate-400 hover:border-[#ff7a18]/40 hover:text-[#ffb066]">
            Expandir lista
          </button>
        )}
        {hrefOptional && (
          <p className="text-[10px] text-slate-500">
            Dica: itens sem link ficam como o trecho atual do breadcrumb.
          </p>
        )}
      </div>
    </div>
  );
}
