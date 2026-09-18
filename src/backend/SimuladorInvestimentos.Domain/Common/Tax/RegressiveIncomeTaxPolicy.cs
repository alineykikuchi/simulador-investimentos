using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Domain.Common.Tax;

/// <summary>
/// Tabela regressiva de imposto de renda da Receita Federal para títulos de renda fixa:
/// 22,5% até 6 meses, 20% até 12 meses, 17,5% até 24 meses e 15% acima de 24 meses.
/// A faixa é decidida exclusivamente pelo prazo de resgate; os limites são inclusivos
/// ("até 6" inclui o sexto mês). O prazo já chega validado por <see cref="InvestmentTerm"/>.
/// </summary>
public sealed class RegressiveIncomeTaxPolicy : IIncomeTaxPolicy
{
    private const int SixMonths = 6;
    private const int TwelveMonths = 12;
    private const int TwentyFourMonths = 24;

    private const decimal UpToSixMonthsRate = 0.225m;
    private const decimal UpToTwelveMonthsRate = 0.20m;
    private const decimal UpToTwentyFourMonthsRate = 0.175m;
    private const decimal AboveTwentyFourMonthsRate = 0.15m;

    /// <inheritdoc/>
    /// <exception cref="ArgumentNullException">Quando <paramref name="term"/> é nulo.</exception>
    public decimal GetRate(InvestmentTerm term)
    {
        ArgumentNullException.ThrowIfNull(term);

        if (term.Months <= SixMonths)
        {
            return UpToSixMonthsRate;
        }

        if (term.Months <= TwelveMonths)
        {
            return UpToTwelveMonthsRate;
        }

        if (term.Months <= TwentyFourMonths)
        {
            return UpToTwentyFourMonthsRate;
        }

        return AboveTwentyFourMonthsRate;
    }
}
