using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SimuladorInvestimentos.Domain.Common.Exceptions;

namespace SimuladorInvestimentos.Api.ExceptionHandling;

/// <summary>
/// Traduz violações de regra de negócio (<see cref="DomainException"/>) em HTTP 400
/// com corpo ProblemDetails, mantendo o domínio livre de detalhes de transporte.
/// </summary>
internal sealed class DomainExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        if (exception is not DomainException domainException)
        {
            return false;
        }

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Requisição inválida",
            Detail = domainException.Message,
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
        };

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken).ConfigureAwait(false);

        return true;
    }
}
