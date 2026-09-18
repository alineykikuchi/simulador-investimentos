using SimuladorInvestimentos.Domain.Common.Exceptions;

namespace SimuladorInvestimentos.Domain.Common.ValueObjects;

/// <summary>
/// Valor inicial da aplicação. Objeto de valor: só existe se for monetário e positivo.
/// </summary>
public sealed record InvestmentAmount
{
    /// <summary>Número máximo de casas decimais aceitas (centavos).</summary>
    public const int Scale = 2;

    private InvestmentAmount(decimal value) => Value = value;

    /// <summary>Valor em reais, com no máximo duas casas decimais.</summary>
    public decimal Value { get; }

    /// <summary>
    /// Cria o objeto de valor validando a invariante "valor monetário positivo".
    /// </summary>
    /// <exception cref="DomainException">Quando o valor não é positivo ou tem mais de duas casas decimais.</exception>
    public static InvestmentAmount Create(decimal value)
    {
        if (value <= 0m)
        {
            throw new DomainException("O valor inicial da aplicação deve ser maior que zero.");
        }

        if (decimal.Round(value, Scale) != value)
        {
            throw new DomainException("O valor inicial da aplicação deve ter no máximo duas casas decimais.");
        }

        return new InvestmentAmount(value);
    }

    public override string ToString() => Value.ToString("F2", System.Globalization.CultureInfo.InvariantCulture);
}
