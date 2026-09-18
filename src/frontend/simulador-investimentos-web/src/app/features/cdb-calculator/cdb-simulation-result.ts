/**
 * Resultado da simulação como exibido pela tela. Todos os valores vêm da API já
 * arredondados; o front não recalcula nada (spec D5).
 */
export interface CdbSimulationResult {
  initialAmount: number;
  months: number;
  grossAmount: number;
  netAmount: number;
  incomeTaxRate: number;
  incomeTaxAmount: number;
  grossYield: number;
  netYield: number;
}
