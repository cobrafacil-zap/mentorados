"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Números animados simples (count up) — não bloqueante, inicia ao montar.
 */
function CountUp({ to, prefix = "", suffix = "", decimals = 0, duration = 1200 }: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setV(eased * to);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span className="count">
      {prefix}
      {v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

function MiniBar({ value, max = 100, color = "#ff7a18" }: { value: number; max?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full animate-bar"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #ffb066)` }}
      />
    </div>
  );
}

function Sparkline({ data, color = "#ff7a18" }: { data: number[]; color?: string }) {
  const w = 120, h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = (n: number) =>
    h - ((n - min) / Math.max(0.0001, max - min)) * (h - 4) - 2;
  const path = data
    .map((n, i) => `${i === 0 ? "M" : "L"} ${(i / (data.length - 1)) * w} ${norm(n)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={`url(#spark-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24">
      {/* grid sutil de fundo */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      {/* blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#1d4ed8]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[#ff7a18]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Coluna texto */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb066]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a18] animate-pulse-dot" />
            Plataforma 100% gratuita
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Aprenda a transformar{" "}
            <span className="text-gradient">grupos em uma operação</span>{" "}
            <span className="text-gradient-orange">lucrativa.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Conteúdos, estratégias e ferramentas gratuitas para você aprender a
            estruturar sua operação de grupos, trabalhar com tráfego pago e
            acompanhar as métricas que realmente importam.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#aulas" className="btn-primary">
              COMEÇAR A APRENDER
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="#metodo" className="btn-ghost">
              CONHECER O MÉTODO GL
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="#1fd29c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sem login
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="#1fd29c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sem cartão
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="#1fd29c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Acesso imediato
            </div>
          </div>
        </div>

        {/* Mockup de dashboard */}
        <div className="relative animate-slide-up delay-200">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[#1d4ed8]/30 via-transparent to-[#ff7a18]/25 blur-2xl" />
      <div className="glass-strong relative rounded-2xl p-5 shadow-2xl animate-float">
        {/* Topo do "app" */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c7a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffb066]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#1fd29c]" />
          </div>
          <div className="rounded-md bg-black/30 px-2 py-1 text-[10px] text-slate-400">
            operação · semana
          </div>
        </div>

        {/* Cabeçalho */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Visão geral</div>
            <div className="text-lg font-semibold text-white">Painel da Operação</div>
          </div>
          <div className="rounded-lg border border-[#ff7a18]/30 bg-[#ff7a18]/10 px-2 py-1 text-[11px] font-semibold text-[#ffb066]">
            AO VIVO
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiMini label="Leads" value={<CountUp to={1284} />} hint="entradas" />
          <KpiMini label="CPL" value={<CountUp to={2} prefix="R$ " decimals={2} />} hint="por entrada" />
          <KpiMini label="Retidos" value={<CountUp to={768} />} hint="60%" />
          <KpiMini label="Comissão" value={<CountUp to={11520} prefix="R$ " />} hint="semana" />
        </div>

        {/* Gráfico principal + lista */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2 rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Resultado · últimos 14 dias</span>
              <span className="text-[#1fd29c]">+ 38%</span>
            </div>
            <svg viewBox="0 0 320 110" className="w-full">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a18" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ff7a18" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#ff7a18" />
                  <stop offset="100%" stopColor="#ffb066" />
                </linearGradient>
              </defs>
              {/* grid */}
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1="0"
                  x2="320"
                  y1={20 + i * 22}
                  y2={20 + i * 22}
                  stroke="rgba(99,130,200,0.12)"
                  strokeDasharray="3 3"
                />
              ))}
              {(() => {
                const data = [12, 18, 16, 22, 28, 24, 30, 36, 32, 40, 46, 42, 52, 60];
                const max = Math.max(...data);
                const min = Math.min(...data);
                const norm = (n: number) =>
                  90 - ((n - min) / (max - min)) * 70;
                const points = data.map((n, i) => `${(i / (data.length - 1)) * 320},${norm(n)}`).join(" ");
                const area = `${points} 320,100 0,100`;
                return (
                  <>
                    <path d={area} fill="url(#area)" />
                    <polyline
                      points={points}
                      fill="none"
                      stroke="url(#line)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 1000,
                        strokeDashoffset: 1000,
                        animation: "draw-line 1.6s 0.4s ease-out forwards",
                      }}
                    />
                    {data.map((n, i) => (
                      <circle
                        key={i}
                        cx={(i / (data.length - 1)) * 320}
                        cy={norm(n)}
                        r="2"
                        fill="#ff7a18"
                        opacity="0.9"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>01 ago</span>
              <span>14 ago</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="mb-2 text-xs text-slate-400">Funil</div>
            <ul className="space-y-2 text-xs">
              <li>
                <div className="mb-1 flex justify-between text-slate-300">
                  <span>Cliques</span><span>2.180</span>
                </div>
                <MiniBar value={92} />
              </li>
              <li>
                <div className="mb-1 flex justify-between text-slate-300">
                  <span>Entradas</span><span>1.284</span>
                </div>
                <MiniBar value={70} />
              </li>
              <li>
                <div className="mb-1 flex justify-between text-slate-300">
                  <span>Retidos</span><span>768</span>
                </div>
                <MiniBar value={48} color="#1d4ed8" />
              </li>
              <li>
                <div className="mb-1 flex justify-between text-slate-300">
                  <span>Compras</span><span>214</span>
                </div>
                <MiniBar value={22} color="#1fd29c" />
              </li>
            </ul>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <SmallMetric label="Evasão" value="40%" sub="200 pessoas" />
          <SmallMetric label="LTV" value="R$ 18,40" sub="por pessoa" />
          <SmallMetric label="Resultado" value="R$ 3.520" sub="líquido" />
        </div>

        <SparklineLegend />
      </div>
    </div>
  );
}

function KpiMini({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      <div className="text-[10px] text-slate-500">{hint}</div>
    </div>
  );
}

function SmallMetric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#ffb066]">{value}</div>
      <div className="text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}

function SparklineLegend() {
  const series = [
    { label: "Hoje", data: [10, 14, 12, 18, 22, 26, 30] },
    { label: "Média", data: [8, 12, 14, 12, 16, 18, 22] },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-3 py-2">
      <div className="flex items-center gap-4 text-[11px] text-slate-300">
        {series.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <Sparkline data={s.data} color={i === 0 ? "#ff7a18" : "#6382c8"} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-slate-500">atualizado agora</div>
    </div>
  );
}
