using AwesomeAssertions;
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
    public void Create_PositiveValue_KeepsValue(double value)
    {
        var amount = InvestmentAmount.Create((decimal)value);

        amount.Value.Should().Be((decimal)value);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-0.01)]
    [InlineData(-1000)]
    public void Create_NonPositiveValue_ThrowsDomainException(double value)
    {
        var act = () => InvestmentAmount.Create((decimal)value);

        act.Should().Throw<DomainException>()
            .WithMessage("O valor inicial da aplicação deve ser maior que zero.");
    }

    [Theory]
    [InlineData(10.001)]
    [InlineData(0.005)]
    [InlineData(1000.123)]
    public void Create_MoreThanTwoDecimalPlaces_ThrowsDomainException(double value)
    {
        var act = () => InvestmentAmount.Create((decimal)value);

        act.Should().Throw<DomainException>()
            .WithMessage("O valor inicial da aplicação deve ter no máximo duas casas decimais.");
    }

    [Fact]
    public void Equals_SameValue_AreEqual()
    {
        var first = InvestmentAmount.Create(100m);
        var second = InvestmentAmount.Create(100m);

        first.Should().Be(second);
    }

    [Fact]
    public void Equals_DifferentValue_AreNotEqual()
    {
        var first = InvestmentAmount.Create(100m);
        var second = InvestmentAmount.Create(100.01m);

        first.Should().NotBe(second);
    }

    [Theory]
    [InlineData(1234.5, "1234.50")]
    [InlineData(1000, "1000.00")]
    [InlineData(0.01, "0.01")]
    public void ToString_AnyValue_FormatsWithTwoDecimalsInvariantCulture(double value, string expected)
    {
        var amount = InvestmentAmount.Create((decimal)value);

        var text = amount.ToString();

        text.Should().Be(expected);
    }
}
