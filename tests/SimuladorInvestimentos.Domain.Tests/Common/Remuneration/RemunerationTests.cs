using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Tests.Support;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.Remuneration;

public sealed class RemunerationTests
{
    [Theory]
    [InlineData(0.00972, 1.00972)]
    [InlineData(0.01, 1.01)]
    public void MonthlyFactor_AnyMonthlyRate_ReturnsOnePlusRate(double monthlyRate, double expectedFactor)
    {
        var remuneration = new ConstantRemuneration((decimal)monthlyRate);

        remuneration.MonthlyFactor.Should().Be((decimal)expectedFactor);
    }
}
