using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Domain.Common.Tax;

/// <summary>
/// Política de imposto de renda sobre o rendimento de um título de renda fixa (CDB hoje;
/// LCI, LCA ou Tesouro Direto amanhã). A tabela regressiva (22,5% / 20% / 17,5% / 15%)
/// é apenas uma implementação possível desta política.
/// </summary>
public interface IIncomeTaxPolicy
{
    /// <summary>
    /// Retorna a alíquota aplicável ao prazo informado, em forma decimal (22,5% => 0.225).
    /// </summary>
    /// <param name="term">Prazo de resgate da aplicação.</param>
    decimal GetRate(InvestmentTerm term);
}
