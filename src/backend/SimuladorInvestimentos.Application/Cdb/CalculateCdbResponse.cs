namespace SimuladorInvestimentos.Application.Cdb;

/// <summary>
/// Resultado apresentado na tela: bruto e líquido (os demais campos são informativos).
/// </summary>
/// <param name="GrossAmount">Resultado bruto do investimento.</param>
/// <param name="NetAmount">Resultado líquido do investimento.</param>
/// <param name="IncomeTaxRate">Alíquota de IR aplicada, em forma decimal.</param>
/// <param name="IncomeTaxAmount">Valor do imposto retido.</param>
public sealed record CalculateCdbResponse(
    decimal GrossAmount,
    decimal NetAmount,
    decimal IncomeTaxRate,
    decimal IncomeTaxAmount);
