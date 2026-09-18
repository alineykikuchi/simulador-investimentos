using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;

namespace SimuladorInvestimentos.Application.Tests.Support;

/// <summary>
/// Fake da porta <see cref="ICdbRatesProvider"/>: devolve sempre as mesmas taxas e conta
/// quantas vezes foi consultado, para que os testes verifiquem quem a consome.
/// </summary>
internal sealed class FixedCdbRatesProvider : ICdbRatesProvider
{
    private readonly CdbRates _rates;

    public FixedCdbRatesProvider(CdbRates rates)
    {
        ArgumentNullException.ThrowIfNull(rates);

        _rates = rates;
    }

    /// <summary>Quantas vezes <see cref="GetCurrent"/> foi chamado.</summary>
    public int Calls { get; private set; }

    public CdbRates GetCurrent()
    {
        Calls++;
        return _rates;
    }
}
