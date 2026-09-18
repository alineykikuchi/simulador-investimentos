using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Common.Exceptions;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.Exceptions;

public sealed class DomainExceptionTests
{
    [Fact]
    public void Constructor_Parameterless_HasDefaultMessage()
    {
        var exception = new DomainException();

        exception.Message.Should().NotBeNullOrWhiteSpace();
        exception.InnerException.Should().BeNull();
    }

    [Fact]
    public void Constructor_Message_KeepsMessage()
    {
        var exception = new DomainException("regra violada");

        exception.Message.Should().Be("regra violada");
    }

    [Fact]
    public void Constructor_MessageAndInner_KeepsBoth()
    {
        var inner = new InvalidOperationException();

        var exception = new DomainException("regra violada", inner);

        exception.Message.Should().Be("regra violada");
        exception.InnerException.Should().BeSameAs(inner);
    }
}
