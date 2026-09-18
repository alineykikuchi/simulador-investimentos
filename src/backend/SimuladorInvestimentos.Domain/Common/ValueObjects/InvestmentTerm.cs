using SimuladorInvestimentos.Domain.Common.Exceptions;

namespace SimuladorInvestimentos.Domain.Common.ValueObjects;

/// <summary>
/// Prazo de resgate da aplicação, em meses. Objeto de valor: a especificação exige prazo maior que 1.
/// </summary>
public sealed record InvestmentTerm
{
    /// <summary>Menor prazo aceito (o prazo precisa ser maior que 1 mês).</summary>
    public const int MinimumMonths = 2;

    private InvestmentTerm(int months) => Months = months;

    /// <summary>Quantidade de meses até o resgate.</summary>
    public int Months { get; }

    /// <summary>
    /// Cria o objeto de valor validando a invariante "prazo maior que um mês".
    /// </summary>
    /// <exception cref="DomainException">Quando o prazo é menor que <see cref="MinimumMonths"/>.</exception>
    public static InvestmentTerm Create(int months)
    {
        if (months < MinimumMonths)
        {
            throw new DomainException("O prazo de resgate deve ser maior que 1 mês.");
        }

        return new InvestmentTerm(months);
    }

    public override string ToString() => $"{Months} meses";
}
