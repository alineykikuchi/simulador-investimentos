using SimuladorInvestimentos.Api.Adapters;
using SimuladorInvestimentos.Api.ExceptionHandling;
using SimuladorInvestimentos.Domain.Cdb.Ports;

namespace SimuladorInvestimentos.Api;

/// <summary>
/// Registro dos serviços de transporte da API (ProblemDetails, tratamento de exceções,
/// OpenAPI, health checks e CORS) e do adapter de taxas do CDB no contêiner de injeção
/// de dependências.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Nome da política de CORS que libera o front-end (origens em <c>Cors:AllowedOrigins</c>).
    /// </summary>
    public const string FrontendCorsPolicy = "Frontend";

    /// <summary>
    /// Registra os serviços da camada de API: transporte (ProblemDetails, exception handler,
    /// OpenAPI, health checks e CORS) e o provider de taxas do CDB, que faz o bind da seção
    /// <c>CdbRates</c> em <see cref="CdbRatesOptions"/> e expõe <see cref="ICdbRatesProvider"/>
    /// como singleton validado ao subir.
    /// </summary>
    /// <param name="services">Coleção de serviços do host.</param>
    /// <param name="configuration">Configuração da aplicação (origem das origens permitidas no CORS).</param>
    /// <returns>A mesma coleção, para encadeamento.</returns>
    public static IServiceCollection AddApi(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddProblemDetails();
        services.AddExceptionHandler<DomainExceptionHandler>();
        services.AddOpenApi();
        services.AddHealthChecks();

        // Em Development o ASP.NET liga ThrowOnBadRequest e o erro de binding viraria 500 via
        // ExceptionHandlerMiddleware; desligado, o binding responde 400 em qualquer ambiente.
        services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = false);

        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        services.AddCors(options => options.AddPolicy(
            FrontendCorsPolicy,
            policy => policy
                .WithOrigins(allowedOrigins)
                .WithMethods("GET", "POST")
                .AllowAnyHeader()));

        services.AddOptions<CdbRatesOptions>().BindConfiguration(CdbRatesOptions.SectionName);
        services.AddSingleton<ICdbRatesProvider, ConfigurationCdbRatesProvider>();

        return services;
    }
}
