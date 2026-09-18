using Microsoft.Extensions.DependencyInjection;

namespace SimuladorInvestimentos.Application;

/// <summary>
/// Registro da camada de aplicação no contêiner de injeção de dependências.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registra os casos de uso e as implementações de domínio que eles consomem.
    /// </summary>
    /// <param name="services">Coleção de serviços do host.</param>
    /// <returns>A mesma coleção, para encadeamento.</returns>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        // Aqui entram, como singletons, o caso de uso (ICalculateCdbUseCase) e as
        // implementações do domínio (ICdbCalculator, IIncomeTaxPolicy) quando forem criadas.
        return services;
    }
}
