using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;

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
    decimal IncomeTaxAmount)
{
    /// <summary>
    /// Converte o resultado do domínio no contrato da API, arredondando dinheiro para centavos.
    /// Regra de arredondamento: <c>GrossAmount</c> e <c>IncomeTaxAmount</c> são arredondados para
    /// <see cref="InvestmentAmount.Scale"/> casas com <see cref="MidpointRounding.AwayFromZero"/>
    /// (regra comercial brasileira) e <c>NetAmount</c> é derivado dos dois valores já
    /// arredondados, para que bruto − imposto = líquido feche na tela. Arredondar o líquido
    /// cheio separadamente poderia divergir em um centavo. <c>IncomeTaxRate</c> não é
    /// arredondada: é a alíquota tal como a política devolve. Este é o único lugar da solução
    /// que arredonda dinheiro.
    /// </summary>
    /// <param name="calculation">Resultado calculado pelo domínio, com precisão cheia.</param>
    /// <returns>Resposta com os valores monetários em centavos.</returns>
    /// <exception cref="ArgumentNullException">Quando <paramref name="calculation"/> é nulo.</exception>
    public static CalculateCdbResponse From(CdbCalculation calculation)
    {
        ArgumentNullException.ThrowIfNull(calculation);

        var gross = decimal.Round(calculation.GrossAmount, InvestmentAmount.Scale, MidpointRounding.AwayFromZero);
        var tax = decimal.Round(calculation.IncomeTaxAmount, InvestmentAmount.Scale, MidpointRounding.AwayFromZero);

        return new CalculateCdbResponse(gross, gross - tax, calculation.IncomeTaxRate, tax);
    }
}
