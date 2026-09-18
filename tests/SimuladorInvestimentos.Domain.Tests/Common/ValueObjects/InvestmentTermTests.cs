using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Common.Exceptions;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.ValueObjects;

public sealed class InvestmentTermTests
{
    [Theory]
    [InlineData(2)]
    [InlineData(6)]
    [InlineData(360)]
    public void Create_TermAboveOneMonth_KeepsMonths(int months)
    {
        var term = InvestmentTerm.Create(months);

        term.Months.Should().Be(months);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(0)]
    [InlineData(-3)]
    public void Create_TermOfOneMonthOrLess_ThrowsDomainException(int months)
    {
        var act = () => InvestmentTerm.Create(months);

        act.Should().Throw<DomainException>()
            .WithMessage("O prazo de resgate deve ser maior que 1 mês.");
    }

    [Fact]
    public void Equals_SameMonths_AreEqual()
    {
        var first = InvestmentTerm.Create(12);
        var second = InvestmentTerm.Create(12);

        first.Should().Be(second);
    }

    [Fact]
    public void ToString_AnyTerm_FormatsMonthsSuffix()
    {
        var term = InvestmentTerm.Create(12);

        var text = term.ToString();

        text.Should().Be("12 meses");
    }
}
