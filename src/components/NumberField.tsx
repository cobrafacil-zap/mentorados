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
      // Aceita "1.234,56" e "1234.56" — padroniza para número.
      const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) onChange(parsed);
      else if (raw === "") onChange(0);
    },
    [onChange]
  );

  const display = value.toLocaleString("pt-BR", {
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
