using SimuladorInvestimentos.Domain.Cdb;
using SimuladorInvestimentos.Domain.Common;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Cdb;

public sealed class CdbRatesTests
{
    [Fact]
    public void MonthlyYieldRate_ComTaxasDaEspecificacao_RetornaCdiVezesTb()
    {
        var rates = CdbRates.Create(monthlyCdi: 0.009m, bankRate: 1.08m);

        Assert.Equal(0.00972m, rates.MonthlyYieldRate);
    }

    [Theory]
    [InlineData(0, 1.08)]
    [InlineData(-0.009, 1.08)]
    [InlineData(0.009, 0)]
    [InlineData(0.009, -1.08)]
    public void Create_ComTaxaNaoPositiva_LancaDomainException(decimal monthlyCdi, decimal bankRate)
        => Assert.Throws<DomainException>(() => CdbRates.Create(monthlyCdi, bankRate));
}
