/** Contrato de entrada da Web API (POST /api/v1/cdb/calculations). */
export interface CalculateCdbRequest {
  /** Valor monetário positivo a ser aplicado. */
  initialAmount: number;
  /** Prazo de resgate em meses, maior que 1. */
  months: number;
}

/** Contrato de saída da Web API. */
export interface CalculateCdbResponse {
  /** Resultado bruto do investimento. */
  grossAmount: number;
  /** Resultado líquido do investimento. */
  netAmount: number;
  /** Alíquota de IR aplicada, em forma decimal (0.225 = 22,5%). */
  incomeTaxRate: number;
  /** Valor do imposto retido. */
  incomeTaxAmount: number;
}
