namespace SimuladorInvestimentos.Domain.Common;

/// <summary>
/// Sinaliza a violação de uma invariante de domínio (regra de negócio), nunca uma falha técnica.
/// </summary>
public sealed class DomainException : Exception
{
    public DomainException()
    {
    }

    public DomainException(string message)
        : base(message)
    {
    }

    public DomainException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
