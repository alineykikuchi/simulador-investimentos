using Microsoft.Extensions.Options;
using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Common.Remuneration;

namespace SimuladorInvestimentos.Api.Adapters;

/// <summary>
/// Implementação de <see cref="ICdbRemunerationProvider"/> que lê CDI e TB da seção
/// <c>CdbRates</c> da configuração e os converte, uma única vez, na
/// <see cref="PostFixedRemuneration"/> do domínio. Trocar o tipo de rentabilidade do CDB
/// simulado é trocar o que este adapter constrói; a calculadora não muda.
/// </summary>
internal sealed class ConfigurationCdbRemunerationProvider : ICdbRemunerationProvider
{
    private readonly Remuneration _remuneration;

    public ConfigurationCdbRemunerationProvider(IOptions<CdbRatesOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);

        // Valida ao subir: configuração inválida derruba o host com a mensagem do domínio.
        var value = options.Value;
        _remuneration = PostFixedRemuneration.Create(value.MonthlyCdi, value.BankRate);
    }

    public Remuneration GetCurrent() => _remuneration;
}
