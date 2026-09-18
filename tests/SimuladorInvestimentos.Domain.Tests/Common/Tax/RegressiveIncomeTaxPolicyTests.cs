using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Common.Tax;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.Tax;

public sealed class RegressiveIncomeTaxPolicyTests
{
    private readonly RegressiveIncomeTaxPolicy _sut = new();

    [Theory]
    [InlineData(2, 0.225)]
    [InlineData(6, 0.225)]
    [InlineData(7, 0.20)]
    [InlineData(12, 0.20)]
    [InlineData(13, 0.175)]
    [InlineData(24, 0.175)]
    [InlineData(25, 0.15)]
    [InlineData(360, 0.15)]
    public void GetRate_TermInEachBracket_ReturnsTableRate(int months, double expected)
    {
        var term = InvestmentTerm.Create(months);

        var rate = _sut.GetRate(term);

        rate.Should().Be((decimal)expected);
    }

    [Fact]
    public void GetRate_NullTerm_ThrowsArgumentNullException()
    {
        var act = () => _sut.GetRate(null!);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("term");
    }
}
