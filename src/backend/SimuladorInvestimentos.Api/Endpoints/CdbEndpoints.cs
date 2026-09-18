using Microsoft.AspNetCore.Http.HttpResults;
using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;

namespace SimuladorInvestimentos.Api.Endpoints;

/// <summary>
/// Rotas do recurso CDB (<c>/api/v1/cdb</c>). O endpoint não contém regra de negócio:
/// despacha para o caso de uso e deixa a <c>DomainException</c> subir para o
/// <c>DomainExceptionHandler</c>, que responde 400 com ProblemDetails.
/// </summary>
internal static class CdbEndpoints
{
    /// <summary>
    /// Mapeia <c>POST /api/v1/cdb/calculations</c> no roteador.
    /// </summary>
    /// <param name="app">Roteador do host.</param>
    /// <returns>O mesmo roteador, para encadeamento.</returns>
    public static IEndpointRouteBuilder MapCdbEndpoints(this IEndpointRouteBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var group = app.MapGroup("/api/v1/cdb").WithTags("CDB");

        group.MapPost("/calculations", Calculate)
             .WithName("CalculateCdb")
             .WithSummary("Calcula o resultado bruto e líquido de um CDB")
             .Produces<CalculateCdbResponse>(StatusCodes.Status200OK)
             .ProducesProblem(StatusCodes.Status400BadRequest);

        return app;
    }

    // Síncrono de propósito: não há I/O. [FromBody] é implícito para tipo complexo em POST.
    private static Ok<CalculateCdbResponse> Calculate(CalculateCdbRequest request, ICalculateCdbUseCase useCase)
        => TypedResults.Ok(useCase.Execute(request));
}
