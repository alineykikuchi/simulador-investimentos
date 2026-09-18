using SimuladorInvestimentos.Domain.Common.Exceptions;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.ValueObjects;

public sealed class InvestmentAmountTests
{
    [Theory]
    [InlineData(0.01)]
    [InlineData(1000)]
    [InlineData(1234.56)]
    public void Create_ComValorPositivo_MantemOValorInformado(decimal value)
    {
        var amount = InvestmentAmount.Create(value);

        Assert.Equal(value, amount.Value);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-0.01)]
    [InlineData(-1000)]
    public void Create_ComValorNaoPositivo_LancaDomainException(decimal value)
    {
        var exception = Assert.Throws<DomainException>(() => InvestmentAmount.Create(value));

        Assert.Contains("maior que zero", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Create_ComMaisDeDuasCasasDecimais_LancaDomainException()
        => Assert.Throws<DomainException>(() => InvestmentAmount.Create(10.001m));

    [Fact]
    public void Equals_ComMesmoValor_SaoIguais()
        => Assert.Equal(InvestmentAmount.Create(100m), InvestmentAmount.Create(100m));
}
