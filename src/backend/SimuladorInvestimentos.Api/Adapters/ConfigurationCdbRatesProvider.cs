using Microsoft.Extensions.Options;
using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;

namespace SimuladorInvestimentos.Api.Adapters;

/// <summary>
/// Implementação de <see cref="ICdbRatesProvider"/> que lê as taxas da seção
/// <c>CdbRates</c> da configuração e as converte no objeto de valor do domínio uma única vez.
/// </summary>
internal sealed class ConfigurationCdbRatesProvider : ICdbRatesProvider
{
    private readonly CdbRates _rates;

    public ConfigurationCdbRatesProvider(IOptions<CdbRatesOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);

        // Valida ao subir: configuração inválida derruba o host com a mensagem do domínio.
        var value = options.Value;
        _rates = CdbRates.Create(value.MonthlyCdi, value.BankRate);
    }

    public CdbRates GetCurrent() => _rates;
}
