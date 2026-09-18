using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.Exceptions;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Cdb.ValueObjects;

public sealed class CdbRatesTests
{
    [Fact]
    public void Create_PositiveRates_KeepsValues()
    {
        var rates = CdbRates.Create(monthlyCdi: 0.009m, bankRate: 1.08m);

        rates.MonthlyCdi.Should().Be(0.009m);
        rates.BankRate.Should().Be(1.08m);
    }

    [Fact]
    public void MonthlyYieldRate_SpecificationRates_ReturnsCdiTimesBankRate()
    {
        var rates = CdbRates.Create(monthlyCdi: 0.009m, bankRate: 1.08m);

        rates.MonthlyYieldRate.Should().Be(0.00972m);
    }

    [Theory]
    [InlineData(0, 1.08)]
    [InlineData(-0.009, 1.08)]
    public void Create_NonPositiveMonthlyCdi_ThrowsDomainException(double monthlyCdi, double bankRate)
    {
        var act = () => CdbRates.Create((decimal)monthlyCdi, (decimal)bankRate);

        act.Should().Throw<DomainException>()
            .WithMessage("O CDI mensal deve ser maior que zero.");
    }

    [Theory]
    [InlineData(0.009, 0)]
    [InlineData(0.009, -1.08)]
    public void Create_NonPositiveBankRate_ThrowsDomainException(double monthlyCdi, double bankRate)
    {
        var act = () => CdbRates.Create((decimal)monthlyCdi, (decimal)bankRate);

        act.Should().Throw<DomainException>()
            .WithMessage("A taxa do banco sobre o CDI (TB) deve ser maior que zero.");
    }
}
