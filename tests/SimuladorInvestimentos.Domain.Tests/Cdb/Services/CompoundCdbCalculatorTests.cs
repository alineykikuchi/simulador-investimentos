using AwesomeAssertions;
using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Common.Remuneration;
using SimuladorInvestimentos.Domain.Common.Tax;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using SimuladorInvestimentos.Domain.Tests.Support;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Cdb.Services;

public sealed class CompoundCdbCalculatorTests
{
    private readonly FixedCdbRemunerationProvider _remunerationProvider;
    private readonly CompoundCdbCalculator _sut;

    public CompoundCdbCalculatorTests()
    {
        _remunerationProvider = new FixedCdbRemunerationProvider(PostFixedRemuneration.Create(0.009m, 1.08m));
        _sut = new CompoundCdbCalculator(new RegressiveIncomeTaxPolicy(), _remunerationProvider);
    }

    [Theory]
    [InlineData(1000.00, 2, 0.225, 1019.53, 4.40)]
    [InlineData(100.00, 3, 0.225, 102.94, 0.66)]
    [InlineData(5000.00, 6, 0.225, 5298.78, 67.23)]
    [InlineData(5000.00, 7, 0.20, 5350.28, 70.06)]
    [InlineData(10000.00, 12, 0.20, 11230.82, 246.16)]
    [InlineData(2500.00, 24, 0.175, 3153.28, 114.32)]
    [InlineData(2500.00, 25, 0.15, 3183.93, 102.59)]
    [InlineData(123456.78, 36, 0.15, 174883.75, 7714.05)]
    public void Calculate_ReferenceVectors_ReturnsExpectedValues(
        double initialAmount,
        int months,
        double incomeTaxRate,
        double grossAmount,
        double incomeTaxAmount)
    {
        var amount = InvestmentAmount.Create((decimal)initialAmount);
        var term = InvestmentTerm.Create(months);

        var actual = _sut.Calculate(amount, term);

        actual.IncomeTaxRate.Should().Be((decimal)incomeTaxRate);
        decimal.Round(actual.GrossAmount, 2, MidpointRounding.AwayFromZero).Should().Be((decimal)grossAmount);
        decimal.Round(actual.IncomeTaxAmount, 2, MidpointRounding.AwayFromZero).Should().Be((decimal)incomeTaxAmount);
        actual.NetAmount.Should().Be(actual.GrossAmount - actual.IncomeTaxAmount);
    }

    [Fact]
    public void Calculate_TwoMonths_CompoundsTwice()
    {
        var expectedGross = 1000m * 1.00972m * 1.00972m;

        var actual = _sut.Calculate(InvestmentAmount.Create(1000m), InvestmentTerm.Create(2));

        actual.GrossAmount.Should().Be(expectedGross);
    }

    [Fact]
    public void Calculate_AnyInput_PreservesInputInResult()
    {
        var amount = InvestmentAmount.Create(2500m);
        var term = InvestmentTerm.Create(24);

        var actual = _sut.Calculate(amount, term);

        actual.InitialAmount.Should().Be(amount.Value);
        actual.Months.Should().Be(term.Months);
    }

    [Fact]
    public void Calculate_AnyRemuneration_CompoundsItsMonthlyRate()
    {
        // 1% ao mês por 2 meses: 1000 x 1,01 x 1,01 = 1020,10 (calculado à mão).
        var provider = new FixedCdbRemunerationProvider(new ConstantRemuneration(0.01m));
        var sut = new CompoundCdbCalculator(new RegressiveIncomeTaxPolicy(), provider);

        var actual = sut.Calculate(InvestmentAmount.Create(1000m), InvestmentTerm.Create(2));

        actual.GrossAmount.Should().Be(1020.10m);
    }

    [Fact]
    public void Calculate_AnyInput_ReadsRemunerationOnce()
    {
        _sut.Calculate(InvestmentAmount.Create(1000m), InvestmentTerm.Create(36));

        _remunerationProvider.Calls.Should().Be(1);
    }

    [Fact]
    public void Calculate_NullAmount_ThrowsArgumentNullException()
    {
        var act = () => _sut.Calculate(null!, InvestmentTerm.Create(2));

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("amount");
    }

    [Fact]
    public void Calculate_NullTerm_ThrowsArgumentNullException()
    {
        var act = () => _sut.Calculate(InvestmentAmount.Create(1000m), null!);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("term");
    }

    [Fact]
    public void Constructor_NullTaxPolicy_ThrowsArgumentNullException()
    {
        var act = () => new CompoundCdbCalculator(null!, _remunerationProvider);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("incomeTaxPolicy");
    }

    [Fact]
    public void Constructor_NullRemunerationProvider_ThrowsArgumentNullException()
    {
        var act = () => new CompoundCdbCalculator(new RegressiveIncomeTaxPolicy(), null!);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("remunerationProvider");
    }
}
