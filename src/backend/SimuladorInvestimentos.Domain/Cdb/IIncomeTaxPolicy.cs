namespace SimuladorInvestimentos.Domain.Cdb;

/// <summary>
/// Política de imposto de renda sobre o rendimento do CDB. A tabela regressiva
/// (22,5% / 20% / 17,5% / 15%) é apenas uma implementação possível desta política.
/// </summary>
public interface IIncomeTaxPolicy
{
    /// <summary>
    /// Retorna a alíquota aplicável ao prazo informado, em forma decimal (22,5% => 0.225).
    /// </summary>
    /// <param name="term">Prazo de resgate da aplicação.</param>
    decimal GetRate(InvestmentTerm term);
}
