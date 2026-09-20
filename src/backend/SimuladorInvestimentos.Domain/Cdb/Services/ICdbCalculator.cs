using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.ValueObjects;

namespace SimuladorInvestimentos.Domain.Cdb.Services;

/// <summary>
/// Serviço de domínio que aplica a fórmula VF = VI x [1 + taxa do mês] mês a mês (CDI x TB
/// na remuneração pós-fixada) e o imposto de renda sobre o rendimento.
/// </summary>
public interface ICdbCalculator
{
    /// <summary>
    /// Calcula o resultado bruto e líquido da aplicação.
    /// </summary>
    /// <param name="amount">Valor inicial aplicado.</param>
    /// <param name="term">Prazo de resgate em meses.</param>
    CdbCalculation Calculate(InvestmentAmount amount, InvestmentTerm term);
}
