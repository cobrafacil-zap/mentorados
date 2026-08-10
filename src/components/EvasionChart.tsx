"use client";

import { useMemo } from "react";

interface Point {
  evasao: number;            // 0..1
  custoPorPessoaRetida: number;
  pessoasPermaneceram: number;
  comissaoPotencial: number;
  resultadoEstimado: number;
}

interface Props {
  investimento: number;
  pessoasEntraram: number;
  comissaoMedia: number;
  evasaoAtual: number;
}

/**
 * Gráfico SVG nativo (sem dependência): mostra a relação entre
 * Evasão (eixo X) e Custo por Lead Retido (eixo Y). Marca o ponto atual.
 */
export function EvasionChart({ investimento, pessoasEntraram, comissaoMedia, evasaoAtual }: Props) {
  const { points, maxY, current } = useMemo(() => {
    const xs = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70];
    const pts: Point[] = xs.map((e) => {
      const permanencia = pessoasEntraram * (1 - e);
      const custo = permanencia > 0 ? investimento / permanencia : 0;
      const comissao = permanencia * comissaoMedia;
      return {
        evasao: e,
        custoPorPessoaRetida: custo,
        pessoasPermaneceram: permanencia,
        comissaoPotencial: comissao,
        resultadoEstimado: comissao - investimento,
      };
    });
    const maxY = Math.max(...pts.map((p) => p.custoPorPessoaRetida), 0.01) * 1.15;
    const closest = pts.reduce((a, b) =>
      Math.abs(a.evasao - evasaoAtual) < Math.abs(b.evasao - evasaoAtual) ? a : b
    );
    return { points: pts, maxY, current: closest };
  }, [investimento, pessoasEntraram, comissaoMedia, evasaoAtual]);

  const w = 640, h = 320;
  const padL = 56, padR = 16, padT = 24, padB = 44;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const x = (e: number) => padL + (e - 0.1) / 0.6 * innerW;
  const y = (v: number) => padT + innerH - (v / maxY) * innerH;

  // Eixo Y - 5 ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => (maxY * i) / 4);
  // Eixo X - ticks para cada ponto
  const xTicks = points;

  // Linha suavizada simples
  const pathLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.evasao)} ${y(p.custoPorPessoaRetida)}`)
    .join(" ");

  const pathArea = `${pathLine} L ${x(points[points.length - 1].evasao)} ${padT + innerH} L ${x(points[0].evasao)} ${padT + innerH} Z`;

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400">Gráfico interativo</div>
          <h3 className="text-lg font-semibold text-white">Evasão × Custo por Lead Retido</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff7a18]" />
            Curva da operação
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
            Cenário atual
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="block min-w-[640px] w-full"
          role="img"
          aria-label="Gráfico de Evasão por Custo por Lead Retido"
        >
          <defs>
            <linearGradient id="chart-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff7a18" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ff7a18" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* grid horizontal */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y(v)}
                y2={y(v)}
                stroke="rgba(99,130,200,0.12)"
                strokeDasharray="3 4"
              />
              <text
                x={padL - 8}
                y={y(v) + 3}
                textAnchor="end"
                fontSize="10"
                fill="#8a96b8"
              >
                R$ {v.toFixed(2).replace(".", ",")}
              </text>
            </g>
          ))}

          {/* eixo X */}
          <line
            x1={padL}
            x2={w - padR}
            y1={padT + innerH}
            y2={padT + innerH}
            stroke="rgba(99,130,200,0.25)"
          />
          {xTicks.map((p, i) => (
            <g key={i}>
              <line
                x1={x(p.evasao)}
                x2={x(p.evasao)}
                y1={padT + innerH}
                y2={padT + innerH + 5}
                stroke="rgba(99,130,200,0.3)"
              />
              <text
                x={x(p.evasao)}
                y={padT + innerH + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#8a96b8"
              >
                {Math.round(p.evasao * 100)}%
              </text>
            </g>
          ))}

          {/* área */}
          <path d={pathArea} fill="url(#chart-area)" />
          {/* linha */}
          <path
            d={pathLine}
            fill="none"
            stroke="#ff7a18"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1500,
              strokeDashoffset: 1500,
              animation: "draw-line 1.4s ease-out forwards",
            }}
          />
          {/* pontos */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={x(p.evasao)}
                cy={y(p.custoPorPessoaRetida)}
                r="3.5"
                fill="#ff7a18"
                stroke="#0a1230"
                strokeWidth="2"
              />
              <text
                x={x(p.evasao)}
                y={y(p.custoPorPessoaRetida) - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#e6ecff"
              >
                R$ {p.custoPorPessoaRetida.toFixed(2).replace(".", ",")}
              </text>
            </g>
          ))}

          {/* marcador cenário atual */}
          {current && (
            <g>
              <line
                x1={x(current.evasao)}
                x2={x(current.evasao)}
                y1={padT}
                y2={padT + innerH}
                stroke="rgba(255,255,255,0.45)"
                strokeDasharray="2 4"
              />
              <circle
                cx={x(current.evasao)}
                cy={y(current.custoPorPessoaRetida)}
                r="7"
                fill="white"
                stroke="#ff7a18"
                strokeWidth="3"
              />
            </g>
          )}

          {/* labels dos eixos */}
          <text
            x={padL}
            y={h - 8}
            fontSize="10"
            fill="#6b7aa3"
          >
            Evasão
          </text>
          <text
            x={8}
            y={padT - 8}
            fontSize="10"
            fill="#6b7aa3"
          >
            Custo por Lead Retido
          </text>
        </svg>
      </div>
    </div>
  );
}
