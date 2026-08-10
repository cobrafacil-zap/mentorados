"use client";

// =========================================================
// OperationCalculator
// Modelo: a calculadora assume que todos os pedidos do período
// vieram desta operação (você divulga o mesmo link no grupo).
// Vendas em marketplaces como Shopee / Mercado Livre não são
// rastreáveis por pessoa — então os números derivados (taxa de
// conversão, CAC, ticket) são REFERÊNCIA, não verdade contábil.
// O foco da calculadora é o que entra/sai do caixa: Lucro e ROI.
// =========================================================

import { useMemo, useState } from "react";
import { NumberField } from "./NumberField";
import { BRL, INT, PCT, calculateOperation } from "@/lib/calc";

const DEFAULT_INPUTS = {
  pessoasTrafego: 250,   // quantas entraram via tráfego pago
  pessoasGrupo: 500,     // total de pessoas no grupo agora
  pedidos: 75,
  gasto: 1000,
  receita: 1500,
};

export function OperationCalculator() {
  const [pessoasTrafego, setPessoasTrafego] = useState(DEFAULT_INPUTS.pessoasTrafego);
  const [pessoasGrupo, setPessoasGrupo] = useState(DEFAULT_INPUTS.pessoasGrupo);
  const [pedidos, setPedidos] = useState(DEFAULT_INPUTS.pedidos);
  const [gasto, setGasto] = useState(DEFAULT_INPUTS.gasto);
  const [receita, setReceita] = useState(DEFAULT_INPUTS.receita);

  const inputs = { pessoas: pessoasGrupo, pedidos, gasto, receita };
  const result = useMemo(() => calculateOperation(inputs), [pessoasGrupo, pedidos, gasto, receita]);

  const pedidosInvalid = pedidos > pessoasGrupo;
  const trafegoInvalid = pessoasTrafego > pessoasGrupo;
  const hasError =
    pessoasGrupo <= 0 ||
    pessoasTrafego < 0 ||
    pedidos < 0 ||
    gasto < 0 ||
    receita < 0 ||
    pedidosInvalid;

  // CPL = gasto ÷ pessoas que vieram do tráfego pago (métrica do tráfego)
  const cplTrafego = pessoasTrafego > 0 ? gasto / pessoasTrafego : 0;

  // Cenários rápidos: variação só da taxa de conversão.
  const taxaAtual = result.taxaConversao;
  const cenarios = useMemo(() => {
    const taxas = [
      { label: "Pessimista", taxa: Math.max(0.02, taxaAtual * 0.5) },
      { label: "Atual", taxa: taxaAtual },
      { label: "Otimista", taxa: Math.min(1, taxaAtual * 1.5) },
    ];
    return taxas.map((t) => {
      const pedidosCenario = Math.round(pessoasGrupo * t.taxa);
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
  }, [pessoasGrupo, pedidos, gasto, receita, taxaAtual]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho curto */}
      <div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Calculadora de <span className="text-gradient-orange">Operação</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Preencha com os dados reais do seu grupo. A calculadora mostra
          <span className="text-white"> lucro e ROI</span> (o que importa
          pro caixa) e, abaixo, métricas de referência como conversão e
          custo por pessoa — estas são aproximadas, porque o marketplace
          não diz de onde veio cada venda.
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
                label="Pessoas do tráfego pago"
                hint="vindas de anúncio"
                value={pessoasTrafego}
                onChange={setPessoasTrafego}
                decimals={0}
                invalid={pessoasTrafego < 0 || trafegoInvalid}
                invalidMessage={
                  trafegoInvalid
                    ? "Não pode ser maior que o total no grupo."
                    : "Informe uma quantidade maior ou igual a zero."
                }
              />
              <NumberField
                label="Total no grupo"
                hint="inclui indicações e orgânico"
                value={pessoasGrupo}
                onChange={setPessoasGrupo}
                decimals={0}
                invalid={pessoasGrupo <= 0}
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
                setPessoasTrafego(DEFAULT_INPUTS.pessoasTrafego);
                setPessoasGrupo(DEFAULT_INPUTS.pessoasGrupo);
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
        <div className="lg:col-span-3 space-y-4">
          {/* Cards em destaque: Lucro e ROI */}
          <div className="grid gap-3 sm:grid-cols-2">
            <HighlightCard
              label="Lucro"
              value={BRL(result.lucro)}
              hint={result.lucro >= 0 ? "sobrou no caixa" : "prejuízo no período"}
              tone={result.lucro >= 0 ? "success" : "danger"}
            />
            <HighlightCard
              label="ROI"
              value={PCT(result.roi, 1)}
              hint="retorno sobre o gasto"
              tone={result.roi >= 0 ? "success" : "danger"}
            />
          </div>

          {/* Referência (aproximada) — métricas derivadas */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Referência (aproximada)
              </span>
              <span className="text-[10px] text-slate-500">
                Mercadoplaces não rastreiam a venda por pessoa
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="Taxa de conversão"
                value={PCT(result.taxaConversao, 1)}
                hint="pedidos ÷ total no grupo"
              />
              <MetricCard
                label="Ticket médio"
                value={BRL(result.ticketMedio)}
                hint="receita ÷ pedidos"
              />
              <MetricCard
                label="Custo por pessoa (grupo)"
                value={BRL(result.custoPorPessoa)}
                hint="gasto ÷ total no grupo"
              />
              <MetricCard
                label="Custo por lead (tráfego)"
                value={BRL(cplTrafego)}
                hint="gasto ÷ pessoas do tráfego"
                accent="orange"
              />
              <MetricCard
                label="CAC efetivo (pedidos)"
                value={BRL(result.cacEfetivo)}
                hint="gasto ÷ pedidos"
                className="sm:col-span-2"
              />
              <MetricCard
                label="Comissão / pessoa"
                value={BRL(result.comissaoMediaPorPessoa)}
                hint="receita ÷ total no grupo"
                accent="orange"
                className="sm:col-span-2"
              />
            </div>
          </div>

          {hasError && (
            <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
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

      {/* Conceito-chave — focado no que importa (vendas) */}
      {!hasError && (
        <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/15 blur-2xl" />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
            Conceito-chave
          </div>
          <h3 className="text-lg font-semibold text-white">O que importa, no fim, é o caixa</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300">
            Métricas de conversão, CAC e ticket são úteis pra decidir onde mexer — mas
            o que fecha a conta é simples: você gastou X e recebeu Y. Lucro e ROI
            são as únicas que dizem se a operação está pagando o esforço.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <Pill label="Gasto" value={BRL(gasto)} tone="muted" />
            <Arrow />
            <Pill label="Receita" value={BRL(receita)} tone="muted" />
            <Arrow />
            <Pill
              label={result.lucro >= 0 ? "Lucro" : "Prejuízo"}
              value={BRL(result.lucro)}
              tone={result.lucro >= 0 ? "orange" : "danger"}
            />
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Você gastou <span className="font-semibold text-white">{BRL(gasto)}</span> e recebeu{" "}
            <span className="font-semibold text-white">{BRL(receita)}</span>. O retorno sobre o gasto foi{" "}
            <span className={`font-semibold ${result.roi >= 0 ? "text-[#1fd29c]" : "text-[#ff5c7a]"}`}>
              {PCT(result.roi, 1)}
            </span>.
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

function HighlightCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "success" | "danger";
}) {
  const isGood = tone === "success";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 ${
        isGood
          ? "border-[#1fd29c]/40 bg-[#1fd29c]/[0.08]"
          : "border-[#ff5c7a]/40 bg-[#ff5c7a]/[0.08]"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
          isGood ? "bg-[#1fd29c]/25" : "bg-[#ff5c7a]/25"
        }`}
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-200">
          {isGood ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
          {label}
        </div>
        <div className={`mt-2 text-4xl font-bold tabular-nums ${accentText[tone]}`}>{value}</div>
        <div className="mt-1 text-xs text-slate-400">{hint}</div>
      </div>
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: string; tone: "muted" | "orange" | "danger" }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${
        tone === "orange"
          ? "border-[#ff7a18]/40 bg-[#ff7a18]/10"
          : tone === "danger"
          ? "border-[#ff5c7a]/40 bg-[#ff5c7a]/10"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      <span
        className={`text-sm font-bold tabular-nums ${
          tone === "orange"
            ? "text-[#ffb066]"
            : tone === "danger"
            ? "text-[#ff5c7a]"
            : "text-white"
        }`}
      >
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