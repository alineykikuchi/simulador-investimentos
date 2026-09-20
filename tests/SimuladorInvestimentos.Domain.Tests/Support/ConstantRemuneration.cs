using SimuladorInvestimentos.Domain.Common.Remuneration;

namespace SimuladorInvestimentos.Domain.Tests.Support;

/// <summary>
/// Fake de <see cref="Remuneration"/>: devolve a taxa mensal informada, sem regra nenhuma.
/// Serve para provar que quem consome a abstração (a calculadora) funciona com qualquer
/// tipo de rentabilidade, não só com a <see cref="PostFixedRemuneration"/>.
/// </summary>
internal sealed record ConstantRemuneration(decimal MonthlyRate) : Remuneration
{
    /// <inheritdoc/>
    public override decimal MonthlyRate { get; } = MonthlyRate;
}
