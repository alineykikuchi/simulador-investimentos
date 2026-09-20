using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Common.Exceptions;
using SimuladorInvestimentos.Domain.Common.Remuneration;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Common.Remuneration;

public sealed class PostFixedRemunerationTests
{
    [Fact]
    public void Create_PositiveValues_KeepsValues()
    {
        var remuneration = PostFixedRemuneration.Create(indexMonthlyRate: 0.009m, percentage: 1.08m);

        remuneration.IndexMonthlyRate.Should().Be(0.009m);
        remuneration.Percentage.Should().Be(1.08m);
    }

    [Fact]
    public void MonthlyRate_SpecificationValues_ReturnsIndexTimesPercentage()
    {
        var remuneration = PostFixedRemuneration.Create(indexMonthlyRate: 0.009m, percentage: 1.08m);

        remuneration.MonthlyRate.Should().Be(0.00972m);
    }

    [Fact]
    public void Create_SameValues_AreEqual()
    {
        var first = PostFixedRemuneration.Create(0.009m, 1.08m);
        var second = PostFixedRemuneration.Create(0.009m, 1.08m);

        first.Should().Be(second);
    }

    [Theory]
    [InlineData(0, 1.08)]
    [InlineData(-0.009, 1.08)]
    public void Create_NonPositiveIndexMonthlyRate_ThrowsDomainException(double indexMonthlyRate, double percentage)
    {
        var act = () => PostFixedRemuneration.Create((decimal)indexMonthlyRate, (decimal)percentage);

        act.Should().Throw<DomainException>()
            .WithMessage("A taxa mensal do indexador deve ser maior que zero.");
    }

    [Theory]
    [InlineData(0.009, 0)]
    [InlineData(0.009, -1.08)]
    public void Create_NonPositivePercentage_ThrowsDomainException(double indexMonthlyRate, double percentage)
    {
        var act = () => PostFixedRemuneration.Create((decimal)indexMonthlyRate, (decimal)percentage);

        act.Should().Throw<DomainException>()
            .WithMessage("O percentual pago sobre o indexador deve ser maior que zero.");
    }
}
