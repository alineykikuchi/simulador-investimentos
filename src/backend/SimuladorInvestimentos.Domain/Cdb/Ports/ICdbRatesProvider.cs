using SimuladorInvestimentos.Domain.Cdb.ValueObjects;

namespace SimuladorInvestimentos.Domain.Cdb.Ports;

/// <summary>
/// Fornece as taxas vigentes (CDI e TB). Nesta versão os valores são fixos e vêm de configuração;
/// a abstração existe para que uma fonte externa (API do CDI, banco de dados) entre sem
/// alterar o cálculo.
/// </summary>
public interface ICdbRatesProvider
{
    /// <summary>Taxas vigentes a serem usadas no cálculo.</summary>
    CdbRates GetCurrent();
}
