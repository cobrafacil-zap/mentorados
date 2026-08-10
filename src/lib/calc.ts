// =========================================================
// Cálculos da operação de grupos
// Todas as funções são puras e determinísticas.
// =========================================================

export interface CalculatorInputs {
  investimento: number;       // R$
  pessoasEntraram: number;    // quantidade
  evasao: number;             // 0..1
  comissaoMedia: number;      // R$ por pessoa
}

export interface CalculatorOutputs {
  cpl: number;                       // investimento / pessoas que entraram
  pessoasPermaneceram: number;       // pessoasEntraram * (1 - evasao)
  pessoasPerdidas: number;           // pessoasEntraram * evasao
  custoPorPessoaRetida: number;      // investimento / pessoasPermaneceram
  comissaoPotencial: number;         // pessoasPermaneceram * comissaoMedia
  resultadoEstimado: number;         // comissaoPotencial - investimento
}

export function calculate(inputs: CalculatorInputs): CalculatorOutputs {
  const { investimento, pessoasEntraram, evasao, comissaoMedia } = inputs;
  const safeEntraram = Math.max(0, pessoasEntraram);
  const safeEvasao = Math.min(0.99, Math.max(0, evasao));
  const permanencia = safeEntraram * (1 - safeEvasao);
  const perdidas = safeEntraram * safeEvasao;
  const cpl = safeEntraram > 0 ? investimento / safeEntraram : 0;
  const custoPorPessoaRetida = permanencia > 0 ? investimento / permanencia : 0;
  const comissaoPotencial = permanencia * comissaoMedia;
  const resultadoEstimado = comissaoPotencial - investimento;
  return {
    cpl,
    pessoasPermaneceram: permanencia,
    pessoasPerdidas: perdidas,
    custoPorPessoaRetida,
    comissaoPotencial,
    resultadoEstimado,
  };
}

export const BRL = (n: number, decimals = 2) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const INT = (n: number) =>
  Math.round(n).toLocaleString("pt-BR");

export const PCT = (n: number, decimals = 0) =>
  `${(n * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
