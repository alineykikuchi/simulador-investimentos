using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Common.Remuneration;

namespace SimuladorInvestimentos.Domain.Tests.Support;

/// <summary>
/// Fake da porta <see cref="ICdbRemunerationProvider"/>: devolve sempre a mesma remuneração
/// e conta quantas vezes foi consultado, para que os testes verifiquem quem a consome.
/// </summary>
internal sealed class FixedCdbRemunerationProvider : ICdbRemunerationProvider
{
    private readonly Remuneration _remuneration;

    public FixedCdbRemunerationProvider(Remuneration remuneration)
    {
        ArgumentNullException.ThrowIfNull(remuneration);

        _remuneration = remuneration;
    }

    /// <summary>Quantas vezes <see cref="GetCurrent"/> foi chamado.</summary>
    public int Calls { get; private set; }

    public Remuneration GetCurrent()
    {
        Calls++;
        return _remuneration;
    }
}
