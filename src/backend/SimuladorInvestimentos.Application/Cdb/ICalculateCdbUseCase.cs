namespace SimuladorInvestimentos.Application.Cdb;

/// <summary>
/// Caso de uso "calcular investimento em CDB": valida a entrada construindo os objetos de
/// valor do domínio, delega o cálculo ao domínio e devolve o contrato da API.
/// </summary>
public interface ICalculateCdbUseCase
{
    /// <summary>
    /// Executa o cálculo.
    /// </summary>
    /// <param name="request">Dados informados pelo usuário.</param>
    /// <exception cref="SimuladorInvestimentos.Domain.Common.Exceptions.DomainException">Quando a entrada viola uma regra de negócio.</exception>
    CalculateCdbResponse Execute(CalculateCdbRequest request);
}
