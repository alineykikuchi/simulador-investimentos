using SimuladorInvestimentos.Domain.Common.Exceptions;

namespace SimuladorInvestimentos.Domain.Common.Remuneration;

/// <summary>
/// Rentabilidade pós-fixada: acompanha um indexador de juros (CDI nesta versão) aplicado
/// de forma multiplicativa. Na fórmula VF = VI x [1 + (CDI x TB)], <see cref="IndexMonthlyRate"/>
/// é o CDI e <see cref="Percentage"/> é o TB. O percentual é cláusula do contrato, não
/// propriedade do índice: dois títulos atrelados ao mesmo CDI podem pagar percentuais
/// diferentes. Objeto de valor imutável.
/// </summary>
public sealed record PostFixedRemuneration : Remuneration
{
    private PostFixedRemuneration(decimal indexMonthlyRate, decimal percentage)
    {
        IndexMonthlyRate = indexMonthlyRate;
        Percentage = percentage;
    }

    /// <summary>Taxa do indexador no último mês em forma decimal (CDI de 0,9% => 0.009).</summary>
    public decimal IndexMonthlyRate { get; }

    /// <summary>Quanto o título paga sobre o indexador em forma decimal (108% => 1.08).</summary>
    public decimal Percentage { get; }

    /// <summary>Taxa efetiva de um mês: indexador x percentual (CDI x TB).</summary>
    public override decimal MonthlyRate => IndexMonthlyRate * Percentage;

    /// <summary>
    /// Cria o objeto de valor validando que a taxa do indexador e o percentual são positivos.
    /// </summary>
    /// <param name="indexMonthlyRate">Taxa mensal do indexador em forma decimal.</param>
    /// <param name="percentage">Percentual pago sobre o indexador em forma decimal.</param>
    /// <exception cref="DomainException">Quando qualquer um dos dois valores não é positivo.</exception>
    public static PostFixedRemuneration Create(decimal indexMonthlyRate, decimal percentage)
    {
        if (indexMonthlyRate <= 0m)
        {
            throw new DomainException("A taxa mensal do indexador deve ser maior que zero.");
        }

        if (percentage <= 0m)
        {
            throw new DomainException("O percentual pago sobre o indexador deve ser maior que zero.");
        }

        return new PostFixedRemuneration(indexMonthlyRate, percentage);
    }
}
