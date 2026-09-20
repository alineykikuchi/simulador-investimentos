using SimuladorInvestimentos.Domain.Common.Remuneration;

namespace SimuladorInvestimentos.Domain.Cdb.Ports;

/// <summary>
/// Fornece a remuneração vigente do CDB simulado. Nesta versão é uma
/// <see cref="PostFixedRemuneration"/> com CDI e TB fixos vindos de configuração; a
/// abstração existe para que outra fonte (API do CDI, banco de dados) ou outro tipo de
/// rentabilidade entre sem alterar o cálculo.
/// </summary>
public interface ICdbRemunerationProvider
{
    /// <summary>Remuneração vigente a ser usada no cálculo.</summary>
    Remuneration GetCurrent();
}
