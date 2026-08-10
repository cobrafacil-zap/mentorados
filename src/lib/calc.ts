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

// =========================================================
// Modelo "operação real" — dados que o usuário de fato tem.
// =========================================================

export interface OperationInputs {
  pessoas: number;       // Quantas pessoas estão no grupo
  pedidos: number;       // Quantos pedidos apareceram na loja vindos do seu link
  gasto: number;         // R$ gasto (tráfego, criativos, ferramentas)
  receita: number;       // R$ recebido em comissão
}

export interface OperationOutputs {
  taxaConversao: number;            // pedidos / pessoas  (0..1)
  ticketMedio: number;              // receita / pedidos
  custoPorPessoa: number;           // gasto / pessoas
  cacEfetivo: number;               // gasto / pedidos
  lucro: number;                    // receita - gasto
  roi: number;                      // lucro / gasto  (0..1)
  comissaoMediaPorPessoa: number;   // receita / pessoas
}

export function calculateOperation(inputs: OperationInputs): OperationOutputs {
  const { pessoas, pedidos, gasto, receita } = inputs;
  const safePessoas = Math.max(0, pessoas);
  const safePedidos = Math.max(0, Math.min(pedidos, safePessoas));
  const safeGasto = Math.max(0, gasto);
  const safeReceita = Math.max(0, receita);

  const taxaConversao = safePessoas > 0 ? safePedidos / safePessoas : 0;
  const ticketMedio = safePedidos > 0 ? safeReceita / safePedidos : 0;
  const custoPorPessoa = safePessoas > 0 ? safeGasto / safePessoas : 0;
  const cacEfetivo = safePedidos > 0 ? safeGasto / safePedidos : 0;
  const lucro = safeReceita - safeGasto;
  const roi = safeGasto > 0 ? lucro / safeGasto : 0;
  const comissaoMediaPorPessoa = safePessoas > 0 ? safeReceita / safePessoas : 0;

  return {
    taxaConversao,
    ticketMedio,
    custoPorPessoa,
    cacEfetivo,
    lucro,
    roi,
    comissaoMediaPorPessoa,
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
