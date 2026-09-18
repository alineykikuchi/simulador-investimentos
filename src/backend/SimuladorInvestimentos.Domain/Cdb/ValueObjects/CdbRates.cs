using SimuladorInvestimentos.Domain.Common.Exceptions;

namespace SimuladorInvestimentos.Domain.Cdb.ValueObjects;

/// <summary>
/// Taxas usadas na fórmula VF = VI x [1 + (CDI x TB)]. Objeto de valor imutável.
/// </summary>
public sealed record CdbRates
{
    private CdbRates(decimal monthlyCdi, decimal bankRate)
    {
        MonthlyCdi = monthlyCdi;
        BankRate = bankRate;
    }

    /// <summary>CDI do último mês em forma decimal (0,9% => 0.009).</summary>
    public decimal MonthlyCdi { get; }

    /// <summary>Quanto o banco paga sobre o CDI (TB) em forma decimal (108% => 1.08).</summary>
    public decimal BankRate { get; }

    /// <summary>Taxa efetiva de um mês: CDI x TB.</summary>
    public decimal MonthlyYieldRate => MonthlyCdi * BankRate;

    /// <summary>
    /// Cria o objeto de valor validando que as duas taxas são positivas.
    /// </summary>
    /// <exception cref="DomainException">Quando qualquer uma das taxas não é positiva.</exception>
    public static CdbRates Create(decimal monthlyCdi, decimal bankRate)
    {
        if (monthlyCdi <= 0m)
        {
            throw new DomainException("O CDI mensal deve ser maior que zero.");
        }

        if (bankRate <= 0m)
        {
            throw new DomainException("A taxa do banco sobre o CDI (TB) deve ser maior que zero.");
        }

        return new CdbRates(monthlyCdi, bankRate);
    }
}
