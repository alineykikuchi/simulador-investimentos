namespace SimuladorInvestimentos.Domain.Common.Remuneration;

/// <summary>
/// Cláusula do contrato que diz como o dinheiro cresce: a forma de rentabilidade do título.
/// Objeto de valor abstrato; o tipo de rentabilidade é a própria classe (pós-fixada hoje;
/// prefixada e híbrida amanhã), não um enum com campos anuláveis. Cada subtipo responde a
/// uma única pergunta, "qual a taxa efetiva de um mês", e a composição mês a mês é de quem
/// calcula (<see cref="Cdb.Services.CompoundCdbCalculator"/>), não daqui. Independe de
/// produto: vale para CDB, LCI, LCA ou qualquer título de renda fixa.
/// </summary>
public abstract record Remuneration
{
    /// <summary>
    /// Taxa efetiva de um mês em forma decimal (0,972% => 0.00972). É o termo entre colchetes
    /// de VF = VI x [1 + taxa].
    /// </summary>
    public abstract decimal MonthlyRate { get; }

    /// <summary>Multiplicador de um mês: 1 + <see cref="MonthlyRate"/>.</summary>
    public decimal MonthlyFactor => 1m + MonthlyRate;
}
