using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;

/// <summary>
/// Implementação de <see cref="ICalculateCdbUseCase"/>: constrói os objetos de valor a partir
/// da requisição (o que valida a entrada), delega o cálculo a <see cref="ICdbCalculator"/> e
/// mapeia o resultado com <see cref="CalculateCdbResponse.From"/>. Não captura exceções de
/// domínio, não loga e não conhece HTTP.
/// </summary>
public sealed class CalculateCdbUseCase : ICalculateCdbUseCase
{
    private readonly ICdbCalculator _calculator;

    /// <summary>
    /// Cria o caso de uso com a calculadora de CDB que ele orquestra.
    /// </summary>
    /// <param name="calculator">Serviço de domínio que compõe os juros e aplica o IR.</param>
    /// <exception cref="ArgumentNullException">Quando <paramref name="calculator"/> é nulo.</exception>
    public CalculateCdbUseCase(ICdbCalculator calculator)
    {
        ArgumentNullException.ThrowIfNull(calculator);

        _calculator = calculator;
    }

    /// <inheritdoc />
    /// <exception cref="ArgumentNullException">Quando <paramref name="request"/> é nulo.</exception>
    public CalculateCdbResponse Execute(CalculateCdbRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var amount = InvestmentAmount.Create(request.InitialAmount);
        var term = InvestmentTerm.Create(request.Months);

        return CalculateCdbResponse.From(_calculator.Calculate(amount, term));
    }
}
