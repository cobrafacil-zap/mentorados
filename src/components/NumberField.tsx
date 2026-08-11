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
  /** Decimal places the user can input. Default 0 (integer). */
  decimals?: number;
  invalid?: boolean;
  invalidMessage?: string;
  /** Placeholder shown when value is 0 (or matches `emptyValue`). */
  placeholder?: string;
  /** Treat this value as "empty" — won't show leading zeros. Default 0. */
  emptyValue?: number;
}

/**
 * Tries several pt-BR / en-US layouts user might paste:
 *   "1500"        → 1500
 *   "1.500"       → 1500   (pt-BR milhar)
 *   "1.500,50"    → 1500.5
 *   "1500,5"      → 1500.5
 *   "1500.5"      → 1500.5  (en-US decimal)
 *   "R$ 1.500,00" → 1500
 *   ""            → 0
 */
function parseRaw(raw: string): number {
  if (raw === "") return 0;
  let s = raw.replace(/r?\$|\s/gi, "").trim();
  if (s === "" || s === "-" || s === "," || s === "." || s === "-," || s === "-.") return 0;
  const dots = (s.match(/\./g) || []).length;
  const commas = (s.match(/,/g) || []).length;
  if (dots > 0 && commas > 0) {
    // pt-BR: ponto é milhar, vírgula é decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (commas > 0) {
    // só vírgula: decimal (1,5 → 1.5)
    s = s.replace(",", ".");
  } else if (dots > 1) {
    // só pontos (2+): heurística simples — tira todos os pontos,
    // trata como inteiro grande. Pt-BR bem formado tem no máximo
    // 1 ponto (e nesse caso cai no branch dots === 1 abaixo).
    s = s.replace(/\./g, "");
  } else if (dots === 1) {
    // só um ponto: pode ser milhar (1.500) OU decimal (1.5).
    // Heurística pt-BR: se tem exatamente 3 dígitos após o ponto, é milhar.
    const [, after] = s.split(".");
    if (after.length !== 3) {
      // decimal tipo 1.5, 12.34 — mantém como está
    } else {
      // "1.500" → 1500
      s = s.replace(".", "");
    }
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Lightweight number field — raw value displayed as user types,
 * formatted only in the result cards. Avoids the cursor-jump and
 * "can't edit" issues of formatted-on-input controls.
 *
 * - decimals=0 → integer field
 * - decimals=2 → 2 decimal places allowed (não força zeros à direita)
 * - empty value shows placeholder (instead of "0")
 */
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
  placeholder,
  emptyValue = 0,
}: NumberFieldProps) {
  const handle = useCallback(
    (raw: string) => {
      const parsed = parseRaw(raw);
      let clamped = parsed;
      if (typeof min === "number" && clamped < min) clamped = min;
      if (typeof max === "number" && clamped > max) clamped = max;
      onChange(clamped);
    },
    [onChange, min, max],
  );

  // Show raw value (no locale formatting) so the user can type freely.
  // `0` becomes empty so the placeholder shows.
  const isEmpty = value === emptyValue;
  const display = isEmpty
    ? ""
    : decimals > 0
      ? value.toString()
      : Math.trunc(value).toString();

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
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          value={display}
          onChange={(e) => handle(e.target.value)}
          placeholder={placeholder ?? (prefix ? "0" : "0")}
          aria-invalid={invalid || undefined}
          aria-label={label}
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