using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.Tax;
using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Domain.Cdb.Services;

/// <summary>
/// Calculadora de CDB por juros compostos: aplica VF = VI x [1 + (CDI x TB)] mês a mês,
/// usando o resultado de um mês como valor inicial do seguinte, e em seguida retém o imposto
/// de renda sobre o rendimento com a alíquota que a <see cref="IIncomeTaxPolicy"/> decidir.
/// Toda a aritmética é em <see cref="decimal"/> e nenhum valor é arredondado: o resultado sai
/// com precisão cheia e quem apresenta arredonda. As taxas são lidas do
/// <see cref="ICdbRatesProvider"/> uma única vez por cálculo, antes do laço.
/// Complexidade O(meses), sem alocação dentro do laço.
/// </summary>
public sealed class CompoundCdbCalculator : ICdbCalculator
{
    private readonly IIncomeTaxPolicy _incomeTaxPolicy;
    private readonly ICdbRatesProvider _ratesProvider;

    /// <summary>
    /// Cria a calculadora com a política de imposto e a fonte das taxas vigentes.
    /// </summary>
    /// <param name="incomeTaxPolicy">Política que decide a alíquota de IR pelo prazo.</param>
    /// <param name="ratesProvider">Fonte das taxas (CDI e TB) vigentes.</param>
    /// <exception cref="ArgumentNullException">Quando qualquer dependência é nula.</exception>
    public CompoundCdbCalculator(IIncomeTaxPolicy incomeTaxPolicy, ICdbRatesProvider ratesProvider)
    {
        ArgumentNullException.ThrowIfNull(incomeTaxPolicy);
        ArgumentNullException.ThrowIfNull(ratesProvider);

        _incomeTaxPolicy = incomeTaxPolicy;
        _ratesProvider = ratesProvider;
    }

    /// <inheritdoc/>
    /// <exception cref="ArgumentNullException">
    /// Quando <paramref name="amount"/> ou <paramref name="term"/> é nulo.
    /// </exception>
    public CdbCalculation Calculate(InvestmentAmount amount, InvestmentTerm term)
    {
        ArgumentNullException.ThrowIfNull(amount);
        ArgumentNullException.ThrowIfNull(term);

        var rates = _ratesProvider.GetCurrent();
        var factor = 1m + rates.MonthlyYieldRate;

        var gross = amount.Value;
        for (var month = 0; month < term.Months; month++)
        {
            gross *= factor;
        }

        var yield = gross - amount.Value;
        var rate = _incomeTaxPolicy.GetRate(term);
        var tax = yield * rate;
        var net = gross - tax;

        return new CdbCalculation(amount.Value, term.Months, gross, rate, tax, net);
    }
}
