namespace SimuladorInvestimentos.Domain.Cdb.ValueObjects;

/// <summary>
/// Resultado de um cálculo de CDB: o que o investimento rendeu (bruto), o imposto e o líquido.
/// </summary>
/// <param name="InitialAmount">Valor inicial aplicado.</param>
/// <param name="Months">Prazo em meses usado no cálculo.</param>
/// <param name="GrossAmount">Resultado bruto (VF ao final do último mês).</param>
/// <param name="IncomeTaxRate">Alíquota de IR aplicada, em forma decimal (22,5% => 0.225).</param>
/// <param name="IncomeTaxAmount">Imposto retido sobre o rendimento.</param>
/// <param name="NetAmount">Resultado líquido (bruto menos imposto).</param>
public sealed record CdbCalculation(
    decimal InitialAmount,
    int Months,
    decimal GrossAmount,
    decimal IncomeTaxRate,
    decimal IncomeTaxAmount,
    decimal NetAmount);
