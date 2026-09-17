namespace SimuladorInvestimentos.Domain.Cdb;

/// <summary>
/// Serviço de domínio que aplica a fórmula VF = VI x [1 + (CDI x TB)] mês a mês
/// e o imposto de renda sobre o rendimento.
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
