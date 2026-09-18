namespace SimuladorInvestimentos.Api.Adapters;

/// <summary>
/// Espelho da seção <c>CdbRates</c> do <c>appsettings.json</c>, preenchido por binding de
/// configuração. Não valida nada: a validação é do domínio, feita por
/// <c>CdbRates.Create</c> quando o provider é construído. Sem valor padrão de propósito:
/// zero é inválido e força a configuração a existir.
/// </summary>
public sealed class CdbRatesOptions
{
    /// <summary>Nome da seção de configuração lida pelo binding.</summary>
    public const string SectionName = "CdbRates";

    /// <summary>CDI do último mês em forma decimal (0,9% => 0.009).</summary>
    public decimal MonthlyCdi { get; init; }

    /// <summary>Quanto o banco paga sobre o CDI (TB) em forma decimal (108% => 1.08).</summary>
    public decimal BankRate { get; init; }
}
