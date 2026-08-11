"use client";

// =========================================================
// OperationCalculator
//
// Calculadora financeira de uma operação de grupos.
// Modelo: você divulga o mesmo link de afiliado no grupo.
// Todos os pedidos do período são atribuídos a esta operação.
//
// Mercadoplaces (Shopee, Mercado Livre, etc.) não rastreiam a
// venda por pessoa — então as métricas "taxa de conversão",
// "CAC" e "ticket" são estimativas, não verdade contábil.
// O que entra/sai do caixa (Lucro e ROI) é o que decide o jogo.
// =========================================================

import { useMemo, useState } from "react";
import { NumberField } from "./NumberField";
import { BRL, INT, PCT, calculateOperation } from "@/lib/calc";
import {
  DEFAULT_CONTENT,
  type CalculatorHeader,
} from "@/lib/pageContent";

const CALC_DEFAULTS = DEFAULT_CONTENT.page_ferramentas_calculator;

const EMPTY_INPUTS = {
  pessoasTrafego: 0, // quantas vieram do anúncio (opcional)
  pessoasGrupo: 0,   // total de pessoas no grupo agora
  pedidos: 0,
  gasto: 0,
  receita: 0,
};

export function OperationCalculator(props: Partial<CalculatorHeader> = {}) {
  const {
    titleBefore = CALC_DEFAULTS.titleBefore,
    titleHighlight = CALC_DEFAULTS.titleHighlight,
    titleAfter = CALC_DEFAULTS.titleAfter,
    subtitle = CALC_DEFAULTS.subtitle,
  } = props;

  const [pessoasTrafego, setPessoasTrafego] = useState(EMPTY_INPUTS.pessoasTrafego);
  const [pessoasGrupo, setPessoasGrupo] = useState(EMPTY_INPUTS.pessoasGrupo);
  const [pedidos, setPedidos] = useState(EMPTY_INPUTS.pedidos);
  const [gasto, setGasto] = useState(EMPTY_INPUTS.gasto);
  const [receita, setReceita] = useState(EMPTY_INPUTS.receita);

  // Taxa de conversão editável — default vem do cenário atual,
  // mas o user pode "brincar" com ela nos cenários.
  const taxaAtual = pessoasGrupo > 0 ? pedidos / pessoasGrupo : 0;
  const [taxaCenario, setTaxaCenario] = useState(0.15);

  const inputs = { pessoas: pessoasGrupo, pedidos, gasto, receita };
  const result = useMemo(
    () => calculateOperation(inputs),
    [pessoasGrupo, pedidos, gasto, receita],
  );

  // Validações — só "Grup o" é obrigatório pra ter resultado.
  const grupoEmpty = pessoasGrupo <= 0;
  const pedidosInvalid = pedidos > pessoasGrupo && pessoasGrupo > 0;
  const trafegoInvalid = pessoasTrafego > pessoasGrupo && pessoasGrupo > 0;
  const hasError =
    grupoEmpty ||
    pessoasTrafego < 0 ||
    pedidos < 0 ||
    gasto < 0 ||
    receita < 0 ||
    pedidosInvalid;

  // CPL só faz sentido quando há pessoas de tráfego.
  const cplTrafego = pessoasTrafego > 0 ? gasto / pessoasTrafego : 0;

  // Cenário: "se a taxa de conversão fosse X, eu teria..."
  const cenario = useMemo(() => {
    const taxa = Math.min(1, Math.max(0, taxaCenario));
    const ticket = pedidos > 0 ? receita / pedidos : 0;
    const pedidosCenario = Math.round(pessoasGrupo * taxa);
    const receitaCenario = pedidosCenario * ticket;
    const lucroCenario = receitaCenario - gasto;
    const roiCenario = gasto > 0 ? lucroCenario / gasto : 0;
    return { taxa, pedidosCenario, receitaCenario, lucroCenario, roiCenario };
  }, [pessoasGrupo, taxaCenario, pedidos, receita, gasto]);

  const reset = () => {
    setPessoasTrafego(EMPTY_INPUTS.pessoasTrafego);
    setPessoasGrupo(EMPTY_INPUTS.pessoasGrupo);
    setPedidos(EMPTY_INPUTS.pedidos);
    setGasto(EMPTY_INPUTS.gasto);
    setReceita(EMPTY_INPUTS.receita);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {titleBefore}{" "}
          {titleHighlight && <span className="text-gradient-orange">{titleHighlight}</span>}{" "}
          {titleAfter}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          {subtitle}
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
              Seus números
            </div>

            <div className="space-y-4">
              <Section title="Pessoas" hint="quem entrou no grupo">
                <NumberField
                  label="Total no grupo"
                  hint="obrigatório"
                  value={pessoasGrupo}
                  onChange={setPessoasGrupo}
                  decimals={0}
                  placeholder="ex.: 500"
                  invalid={pessoasGrupo < 0}
                  invalidMessage="Não pode ser negativo."
                />
                <NumberField
                  label="Do tráfego pago"
                  hint="opcional"
                  value={pessoasTrafego}
                  onChange={setPessoasTrafego}
                  decimals={0}
                  placeholder="ex.: 250"
                  invalid={trafegoInvalid}
                  invalidMessage="Não pode ser maior que o total no grupo."
                />
              </Section>

              <Section title="Vendas" hint="pedidos + receita">
                <NumberField
                  label="Pedidos"
                  hint="vindos do seu link"
                  value={pedidos}
                  onChange={setPedidos}
                  decimals={0}
                  placeholder="ex.: 75"
                  invalid={pedidosInvalid || pedidos < 0}
                  invalidMessage={
                    pedidosInvalid
                      ? "Pedidos não pode ser maior que pessoas no grupo."
                      : "Não pode ser negativo."
                  }
                />
                <NumberField
                  label="Comissão total"
                  hint="o que você recebeu"
                  value={receita}
                  onChange={setReceita}
                  prefix="R$"
                  decimals={2}
                  placeholder="ex.: 1500,00"
                  invalid={receita < 0}
                  invalidMessage="Não pode ser negativo."
                />
              </Section>

              <Section title="Custos" hint="o que você gastou">
                <NumberField
                  label="Gasto total"
                  hint="tráfego + criativos"
                  value={gasto}
                  onChange={setGasto}
                  prefix="R$"
                  decimals={2}
                  placeholder="ex.: 1000,00"
                  invalid={gasto < 0}
                  invalidMessage="Não pode ser negativo."
                />
              </Section>
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-5 text-xs font-medium text-slate-400 transition hover:text-white"
            >
              Limpar tudo
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4 lg:col-span-3">
          {/* Sempre mostra Lucro e ROI, mesmo com 0 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <HighlightCard
              label="Lucro"
              value={BRL(result.lucro)}
              hint={result.lucro >= 0 ? "sobrou no caixa" : "prejuízo no período"}
              tone={result.lucro >= 0 ? "success" : "danger"}
              dim={hasError}
            />
            <HighlightCard
              label="ROI"
              value={hasError ? "—" : PCT(result.roi, 1)}
              hint="retorno sobre o gasto"
              tone={result.roi >= 0 ? "success" : "danger"}
              dim={hasError}
            />
          </div>

          {/* Métricas de referência */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                Referência
              </span>
              <span className="text-[10px] text-slate-500">
                Métricas derivadas — úteis pra decidir onde mexer
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="Taxa de conversão"
                value={pessoasGrupo > 0 ? PCT(taxaAtual, 1) : "—"}
                hint="pedidos ÷ total no grupo"
              />
              <MetricCard
                label="Ticket médio"
                value={pedidos > 0 ? BRL(result.ticketMedio) : "—"}
                hint="comissão ÷ pedidos"
              />
              <MetricCard
                label="Custo por pessoa (grupo)"
                value={pessoasGrupo > 0 ? BRL(result.custoPorPessoa) : "—"}
                hint="gasto ÷ total no grupo"
              />
              {pessoasTrafego > 0 && (
                <MetricCard
                  label="Custo por lead (CPL)"
                  value={BRL(cplTrafego)}
                  hint="gasto ÷ pessoas do tráfego"
                  accent="orange"
                />
              )}
              <MetricCard
                label="CAC efetivo"
                value={pedidos > 0 ? BRL(result.cacEfetivo) : "—"}
                hint="gasto ÷ pedidos"
                className="sm:col-span-2"
              />
              <MetricCard
                label="Comissão / pessoa"
                value={pessoasGrupo > 0 ? BRL(result.comissaoMediaPorPessoa) : "—"}
                hint="receita ÷ total no grupo"
                accent="orange"
                className="sm:col-span-2"
              />
            </div>
          </div>

          {hasError && (
            <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
              {grupoEmpty
                ? "Preencha o total de pessoas no grupo para ver o cálculo."
                : "Confira os campos: algum número não faz sentido (negativo ou acima do limite)."}
            </div>
          )}
        </div>
      </div>

      {/* Cenário: "e se a taxa fosse X?" */}
      <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/10 blur-2xl" />
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
          Sensibilidade
        </div>
        <h3 className="text-lg font-semibold text-white">
          E se a taxa de conversão fosse diferente?
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">
          Mantém seu gasto e ticket — só varia a taxa de conversão. Serve pra
          ter uma noção do que uma copy melhor (ou pior) muda no caixa.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-5">
          <div className="md:col-span-2">
            <NumberField
              label="Taxa de conversão"
              hint="de 0 a 1 (= 0% a 100%)"
              value={taxaCenario}
              onChange={(v) => setTaxaCenario(Math.min(1, Math.max(0, v)))}
              decimals={2}
              placeholder="0,15"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "5%", value: 0.05 },
                { label: "10%", value: 0.1 },
                { label: "15%", value: 0.15 },
                { label: "25%", value: 0.25 },
                { label: "40%", value: 0.4 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setTaxaCenario(p.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    Math.abs(taxaCenario - p.value) < 0.005
                      ? "border-[#ff7a18]/50 bg-[#ff7a18]/10 text-[#ffb066]"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Atual: {pessoasGrupo > 0 ? PCT(taxaAtual, 1) : "—"}
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label="Pedidos projetados"
                value={INT(cenario.pedidosCenario)}
                hint={`${PCT(cenario.taxa, 1)} × ${INT(pessoasGrupo)} pessoas`}
                accent="orange"
              />
              <MetricCard
                label="Receita projetada"
                value={BRL(cenario.receitaCenario)}
                hint="ticket atual mantido"
              />
              <MetricCard
                label="Lucro projetado"
                value={BRL(cenario.lucroCenario)}
                hint="receita − gasto"
                accent={cenario.lucroCenario >= 0 ? "success" : "danger"}
                highlight
              />
              <MetricCard
                label="ROI projetado"
                value={PCT(cenario.roiCenario, 1)}
                hint="retorno sobre o gasto"
                accent={cenario.roiCenario >= 0 ? "success" : "danger"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conceito-chave — focado no que importa (caixa) */}
      {pessoasGrupo > 0 && (
        <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#ff7a18]/15 blur-2xl" />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#ffb066]">
            Conceito-chave
          </div>
          <h3 className="text-lg font-semibold text-white">
            O que importa, no fim, é o caixa
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300">
            Métricas de conversão, CAC e ticket são úteis pra decidir onde
            mexer — mas o que fecha a conta é simples: você gastou X e recebeu
            Y. Lucro e ROI são as únicas que dizem se a operação está pagando
            o esforço.
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
            <span
              className={`font-semibold ${result.roi >= 0 ? "text-[#1fd29c]" : "text-[#ff5c7a]"}`}
            >
              {PCT(result.roi, 1)}
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
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
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
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
  dim,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "success" | "danger";
  dim?: boolean;
}) {
  const isGood = tone === "success";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 transition ${
        dim
          ? "border-white/10 bg-white/[0.02]"
          : isGood
            ? "border-[#1fd29c]/40 bg-[#1fd29c]/[0.08]"
            : "border-[#ff5c7a]/40 bg-[#ff5c7a]/[0.08]"
      }`}
    >
      {!dim && (
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
            isGood ? "bg-[#1fd29c]/25" : "bg-[#ff5c7a]/25"
          }`}
        />
      )}
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-200">
          {isGood && !dim ? (
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
        <div
          className={`mt-2 text-4xl font-bold tabular-nums ${
            dim ? "text-slate-500" : accentText[tone]
          }`}
        >
          {value}
        </div>
        <div className="mt-1 text-xs text-slate-400">{hint}</div>
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "muted" | "orange" | "danger";
}) {
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