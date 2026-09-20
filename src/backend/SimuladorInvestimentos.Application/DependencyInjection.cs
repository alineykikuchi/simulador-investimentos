using Microsoft.Extensions.DependencyInjection;
using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;
using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Common.Tax;

namespace SimuladorInvestimentos.Application;

/// <summary>
/// Registro da camada de aplicação no contêiner de injeção de dependências.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registra, como singletons, o caso de uso <see cref="ICalculateCdbUseCase"/> e as
    /// implementações de domínio que ele consome (<see cref="IIncomeTaxPolicy"/> e
    /// <see cref="ICdbCalculator"/>). A porta <see cref="Domain.Cdb.Ports.ICdbRemunerationProvider"/>
    /// é registrada pela camada de API, que é quem lê a configuração.
    /// </summary>
    /// <param name="services">Coleção de serviços do host.</param>
    /// <returns>A mesma coleção, para encadeamento.</returns>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddSingleton<IIncomeTaxPolicy, RegressiveIncomeTaxPolicy>();
        services.AddSingleton<ICdbCalculator, CompoundCdbCalculator>();
        services.AddSingleton<ICalculateCdbUseCase, CalculateCdbUseCase>();

        return services;
    }
}
