using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.Tax;
using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Domain.Cdb.Services;

/// <summary>
/// Calculadora de CDB por juros compostos: aplica VF = VI x [1 + taxa do mês] mês a mês,
/// usando o resultado de um mês como valor inicial do seguinte, e em seguida retém o imposto
/// de renda sobre o rendimento com a alíquota que a <see cref="IIncomeTaxPolicy"/> decidir.
/// A taxa do mês vem da <see cref="Common.Remuneration.Remuneration"/> vigente (CDI x TB na
/// pós-fixada); a calculadora não sabe qual tipo de rentabilidade está compondo.
/// Toda a aritmética é em <see cref="decimal"/> e nenhum valor é arredondado: o resultado sai
/// com precisão cheia e quem apresenta arredonda. A remuneração é lida do
/// <see cref="ICdbRemunerationProvider"/> uma única vez por cálculo, antes do laço.
/// Complexidade O(meses), sem alocação dentro do laço.
/// </summary>
public sealed class CompoundCdbCalculator : ICdbCalculator
{
    private readonly IIncomeTaxPolicy _incomeTaxPolicy;
    private readonly ICdbRemunerationProvider _remunerationProvider;

    /// <summary>
    /// Cria a calculadora com a política de imposto e a fonte da remuneração vigente.
    /// </summary>
    /// <param name="incomeTaxPolicy">Política que decide a alíquota de IR pelo prazo.</param>
    /// <param name="remunerationProvider">Fonte da remuneração (tipo de rentabilidade e taxas) vigente.</param>
    /// <exception cref="ArgumentNullException">Quando qualquer dependência é nula.</exception>
    public CompoundCdbCalculator(IIncomeTaxPolicy incomeTaxPolicy, ICdbRemunerationProvider remunerationProvider)
    {
        ArgumentNullException.ThrowIfNull(incomeTaxPolicy);
        ArgumentNullException.ThrowIfNull(remunerationProvider);

        _incomeTaxPolicy = incomeTaxPolicy;
        _remunerationProvider = remunerationProvider;
    }

    /// <inheritdoc/>
    /// <exception cref="ArgumentNullException">
    /// Quando <paramref name="amount"/> ou <paramref name="term"/> é nulo.
    /// </exception>
    public CdbCalculation Calculate(InvestmentAmount amount, InvestmentTerm term)
    {
        ArgumentNullException.ThrowIfNull(amount);
        ArgumentNullException.ThrowIfNull(term);

        var factor = _remunerationProvider.GetCurrent().MonthlyFactor;

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
