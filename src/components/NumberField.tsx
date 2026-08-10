"use client";

import { useCallback } from "react";

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  invalid?: boolean;
  invalidMessage?: string;
  /** Quando true, mostra o prefixo/suffix DENTRO do input só quando
   *  ele está focado/vazio. Útil para evitar que o cursor fique
   *  preso no meio do texto com prefixo. */
  inlinePrefix?: boolean;
}

const R_PREFIX = /^r?\$?\s*/i;

/**
 * Normaliza o texto cru digitado/colado para número JS.
 * Aceita:
 *   "1500"          → 1500
 *   "1.500"         → 1500   (ponto como milhar, como pt-BR)
 *   "1.500,50"      → 1500.5
 *   "1500,5"        → 1500.5
 *   "1500.5"        → 1500.5  (ponto como decimal, fallback)
 *   "R$ 1.500,00"   → 1500
 *   ""              → 0
 */
function parseRaw(raw: string): number {
  if (raw === "") return 0;
  // tira prefixo "R$" / "r$" e espaços
  let s = raw.replace(R_PREFIX, "").replace(/\s+/g, "");
  // conta pontos e vírgulas
  const dots = (s.match(/\./g) || []).length;
  const commas = (s.match(/,/g) || []).length;
  if (dots > 0 && commas > 0) {
    // estilo pt-BR: ponto é milhar, vírgula é decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (commas > 0) {
    // só vírgula: decimal
    s = s.replace(",", ".");
  }
  // resto: se houver múltiplos pontos, mantém só o último como decimal
  const parts = s.split(".");
  if (parts.length > 2) {
    const dec = parts.pop();
    s = parts.join("") + "." + dec;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  decimals = 0,
  invalid,
  invalidMessage,
}: NumberFieldProps) {
  const handle = useCallback(
    (raw: string) => {
      // 1) tira prefixo se colar com R$
      // 2) normaliza para número
      const parsed = parseRaw(raw);
      // 3) aplica min/max
      let clamped = parsed;
      if (typeof min === "number" && clamped < min) clamped = min;
      if (typeof max === "number" && clamped > max) clamped = max;
      onChange(clamped);
    },
    [onChange, min, max]
  );

  // Máscara: usa pt-BR com o número de decimais do campo.
  const display = (value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-300">
        <span>{label}</span>
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          value={display}
          onChange={(e) => handle(e.target.value)}
          aria-invalid={invalid || undefined}
          className={`gl-input ${prefix ? "pl-10" : ""} ${suffix ? "pr-12" : ""}`}
          min={min}
          max={max}
          step={step}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {invalid && invalidMessage && (
        <div className="mt-1 text-[11px] text-[#ff5c7a]">{invalidMessage}</div>
      )}
    </label>
  );
}