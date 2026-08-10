"use client";

import { useMemo, useState } from "react";
import { NumberField } from "./NumberField";
import { BRL, INT, PCT, calculateOperation } from "@/lib/calc";

const DEFAULT_INPUTS = {
  pessoas: 500,
  pedidos: 75,
  gasto: 1000,
  receita: 1500,
};

export function OperationCalculator() {
  const [pessoas, setPessoas] = useState(DEFAULT_INPUTS.pessoas);
  const [pedidos, setPedidos] = useState(DEFAULT_INPUTS.pedidos);
  const [gasto, setGasto] = useState(DEFAULT_INPUTS.gasto);
  const [receita, setReceita] = useState(DEFAULT_INPUTS.receita);

  const inputs = { pessoas, pedidos, gasto, receita };
  const result = useMemo(() => calculateOperation(inputs), [pessoas, pedidos, gasto, receita]);

  const pedidosInvalid = pedidos > pessoas;
  const hasError =
    pessoas <= 0 ||
    pedidos < 0 ||
    gasto < 0 ||
    receita < 0 ||
    pedidosInvalid;

  // Cenários rápidos (taxas hipotéticas aplicadas à base atual)
  const taxaAtual = result.taxaConversao;
  const cenarios = useMemo(() => {
    const taxas = [
      { label: "Pessimista", taxa: Math.max(0.02, taxaAtual * 0.5) },
      { label: "Atual", taxa: taxaAtual },
      { label: "Otimista", taxa: Math.min(1, taxaAtual * 1.5) },
    ];
    return taxas.map((t) => {
      const pedidosCenario = Math.round(pessoas * t.taxa);
      const receitaCenario = pedidosCenario * (pedidos > 0 ? receita / pedidos : 0);
      const lucro = receitaCenario - gasto;
      const roi = gasto > 0 ? lucro / gasto : 0;
      return {
        ...t,
        pedidosCenario,
        receitaCenario,
        lucro,
        roi,
      };
    });
  }, [pessoas, pedidos, gasto, receita, taxaAtual]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho curto */}
      <div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Calculadora de <span className="text-gradient-orange">Operação</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Preencha com os dados reais do seu grupo. A calculadora descobre
          conversão, lucro, ROI e quanto custa, de fato, cada pessoa que comprou.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <div className="lg:col-span-2">
          <div className="glass h-full rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff7a18]/15 text-[#ffb066] ring-1 ring-[#ff7a18]/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Dados da operação
            </div>

            <div className="space-y-4">
              <NumberField
                label="Pessoas no grupo"
                hint="quantidade"
                value={pessoas}
                onChange={setPessoas}
                decimals={0}
                invalid={pessoas <= 0}
                invalidMessage="Informe uma quantidade maior que zero."
              />
              <NumberField
                label="Pedidos"
                hint="vindos do seu link"
                value={pedidos}
                onChange={setPedidos}
                decimals={0}
                invalid={pedidos < 0 || pedidosInvalid}
                invalidMessage={
                  pedidosInvalid
                    ? "Pedidos não pode ser maior que pessoas no grupo."
                    : "Informe uma quantidade maior ou igual a zero."
                }
              />
              <NumberField
                label="Gasto total"
                hint="tráfego + criativos"
                value={gasto}
                onChange={setGasto}
                prefix="R$"
                decimals={2}
                invalid={gasto < 0}
                invalidMessage="Informe um valor maior ou igual a zero."
              />
              <NumberField
                label="Receita total"
                hint="comissão recebida"
                value={receita}
                onChange={setReceita}
                prefix="R$"
                decimals={2}
                invalid={receita < 0}
                invalidMessage="Informe um valor maior ou igual a zero."
              />
            </div>

            <button
              onClick={() => {
                setPessoas(DEFAULT_INPUTS.pessoas);
                setPedidos(DEFAULT_INPUTS.pedidos);
                setGasto(DEFAULT_INPUTS.gasto);
                setReceita(DEFAULT_INPUTS.receita);
              }}
              className="mt-5 text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Restaurar exemplo
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Taxa de conversão" value={PCT(result.taxaConversao, 1)} hint="pedidos ÷ pessoas" />
            <MetricCard label="Ticket médio" value={BRL(result.ticketMedio)} hint="receita ÷ pedidos" />
            <MetricCard label="Custo por pessoa" value={BRL(result.custoPorPessoa)} hint="gasto ÷ pessoas" />
            <MetricCard
              label="CAC efetivo"
              value={BRL(result.cacEfetivo)}
              hint="gasto ÷ pedidos"
              accent="orange-strong"
              highlight
            />
            <MetricCard
              label="Lucro"
              value={BRL(result.lucro)}
              hint="receita − gasto"
              accent={result.lucro >= 0 ? "success" : "danger"}
              highlight
            />
            <MetricCard
              label="ROI"
              value={PCT(result.roi, 1)}
              hint="retorno sobre o gasto"
              accent={result.roi >= 0 ? "success" : "danger"}
              highlight
            />
            <MetricCard
              label="Comissão / pessoa"
              value={BRL(result.comissaoMediaPorPessoa)}
              hint="receita ÷ pessoas"
              accent="orange"
              className="sm:col-span-2"
            />
          </div>

          {hasError && (
            <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
              Ajuste os campos para ver os cálculos completos.
            </div>
          )}
        </div>
      </div>

      {/* Cenários rápidos */}
      <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/10 blur-2xl" />
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
          Cenários
        </div>
        <h3 className="text-lg font-semibold text-white">E se a taxa de conversão fosse diferente?</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">
          Comparação rápida baseada no seu gasto e ticket atual. Serve só como referência — não muda seus inputs.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {cenarios.map((c) => {
            const isCurrent = c.label === "Atual";
            return (
              <div
                key={c.label}
                className={`relative rounded-xl border p-5 transition ${
                  isCurrent
                    ? "border-[#ff7a18]/50 bg-[#ff7a18]/5 ring-orange"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                {isCurrent && (
                  <div className="absolute right-3 top-3 rounded-full bg-[#ff7a18] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                    Atual
                  </div>
                )}
                <div className="text-xs uppercase tracking-wider text-slate-400">{c.label}</div>
                <div className="mt-1 text-xl font-bold text-white">
                  {PCT(c.taxa, 1)} <span className="text-xs font-normal text-slate-400">de conversão</span>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pedidos</span>
                    <span className="font-semibold text-white">{INT(c.pedidosCenario)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receita estimada</span>
                    <span className="font-semibold text-white">{BRL(c.receitaCenario)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lucro estimado</span>
                    <span className={`font-semibold ${c.lucro >= 0 ? "text-[#1fd29c]" : "text-[#ff5c7a]"}`}>
                      {BRL(c.lucro)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ROI</span>
                    <span className={`font-semibold ${c.roi >= 0 ? "text-[#1fd29c]" : "text-[#ff5c7a]"}`}>
                      {PCT(c.roi, 1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conceito de Lead Final — equivalente didático */}
      {!hasError && (
        <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/15 blur-2xl" />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
            Conceito-chave
          </div>
          <h3 className="text-lg font-semibold text-white">Custo real por pedido</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300">
            Trazer uma pessoa para o grupo é só o começo. Se poucas compram, o
            custo real de cada venda é maior do que parece. Esta é a métrica que
            mostra se a operação está pagando o esforço.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <Pill label="Pessoas" value={INT(pessoas)} tone="muted" />
            <Arrow />
            <Pill label="Conversão" value={PCT(result.taxaConversao, 1)} tone="muted" />
            <Arrow />
            <Pill label="CAC efetivo" value={BRL(result.cacEfetivo)} tone="orange" />
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Você trouxe <span className="font-semibold text-white">{INT(pessoas)}</span>{" "}
            pessoas e converteu <span className="font-semibold text-white">{PCT(result.taxaConversao, 1)}</span>.
            O custo real de cada uma que comprou foi{" "}
            <span className="font-semibold text-[#ffb066]">{BRL(result.cacEfetivo)}</span>.
          </p>
        </div>
      )}
    </div>
  );
}

type Accent = "orange" | "orange-strong" | "blue" | "success" | "danger";

const accentText: Record<Accent, string> = {
  orange: "text-[#ffb066]",
  "orange-strong": "text-[#ff7a18]",
  blue: "text-[#a3b8ff]",
  success: "text-[#1fd29c]",
  danger: "text-[#ff5c7a]",
};

function MetricCard({
  label,
  value,
  hint,
  accent = "blue",
  highlight,
  className = "",
}: {
  label: string;
  value: string;
  hint: string;
  accent?: Accent;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        highlight
          ? "border-[#ff7a18]/35 bg-[#ff7a18]/[0.06]"
          : "border-white/10 bg-white/[0.02]"
      } ${className}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accentText[accent]}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>
      {highlight && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#ff7a18]/15 blur-2xl" />
      )}
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: string; tone: "muted" | "orange" }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${
        tone === "orange"
          ? "border-[#ff7a18]/40 bg-[#ff7a18]/10"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${tone === "orange" ? "text-[#ffb066]" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <span aria-hidden="true" className="text-[#ff7a18]">
      <svg width="22" height="14" viewBox="0 0 32 20" fill="none">
        <path d="M2 10h26M22 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}