namespace SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;

/// <summary>
/// Dados informados na tela (item 1 da especificação).
/// </summary>
/// <param name="InitialAmount">Valor monetário positivo a ser aplicado.</param>
/// <param name="Months">Prazo de resgate em meses, maior que 1.</param>
public sealed record CalculateCdbRequest(decimal InitialAmount, int Months);
