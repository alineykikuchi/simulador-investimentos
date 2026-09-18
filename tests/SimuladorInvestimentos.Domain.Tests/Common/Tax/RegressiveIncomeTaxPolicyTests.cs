using SimuladorInvestimentos.Domain.Common.Tax;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.Tax;

public sealed class RegressiveIncomeTaxPolicyTests
{
    [Theory]
    [InlineData(2, 0.225)]
    [InlineData(6, 0.225)]
    [InlineData(7, 0.20)]
    [InlineData(12, 0.20)]
    [InlineData(13, 0.175)]
    [InlineData(24, 0.175)]
    [InlineData(25, 0.15)]
    [InlineData(360, 0.15)]
    public void GetRate_ComPrazoEmCadaFaixa_RetornaAliquotaDaTabela(int months, double expectedRate)
    {
        var policy = new RegressiveIncomeTaxPolicy();
        var term = InvestmentTerm.Create(months);

        var rate = policy.GetRate(term);

        Assert.Equal((decimal)expectedRate, rate);
    }

    [Fact]
    public void GetRate_ComTermNulo_LancaArgumentNullException()
    {
        var policy = new RegressiveIncomeTaxPolicy();

        Assert.Throws<ArgumentNullException>(() => policy.GetRate(null!));
    }
}
