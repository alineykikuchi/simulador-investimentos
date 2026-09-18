using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.Tax;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using SimuladorInvestimentos.Domain.Tests.Support;
using Xunit;

namespace SimuladorInvestimentos.Domain.Tests.Cdb.Services;

public sealed class CompoundCdbCalculatorTests
{
    private const decimal MonthlyCdi = 0.009m;
    private const decimal BankRate = 1.08m;

    [Theory]
    [InlineData(1000.00, 2, 0.225, 1019.53, 4.40)]
    [InlineData(100.00, 3, 0.225, 102.94, 0.66)]
    [InlineData(5000.00, 6, 0.225, 5298.78, 67.23)]
    [InlineData(5000.00, 7, 0.20, 5350.28, 70.06)]
    [InlineData(10000.00, 12, 0.20, 11230.82, 246.16)]
    [InlineData(2500.00, 24, 0.175, 3153.28, 114.32)]
    [InlineData(2500.00, 25, 0.15, 3183.93, 102.59)]
    [InlineData(123456.78, 36, 0.15, 174883.75, 7714.05)]
    public void Calculate_ComMassaDeReferencia_RetornaValoresEsperados(
        double initialAmount,
        int months,
        double incomeTaxRate,
        double grossAmount,
        double incomeTaxAmount)
    {
        var calculator = CreateCalculator();

        var actual = calculator.Calculate(
            InvestmentAmount.Create((decimal)initialAmount),
            InvestmentTerm.Create(months));

        Assert.Equal((decimal)incomeTaxRate, actual.IncomeTaxRate);
        Assert.Equal((decimal)grossAmount, decimal.Round(actual.GrossAmount, 2, MidpointRounding.AwayFromZero));
        Assert.Equal((decimal)incomeTaxAmount, decimal.Round(actual.IncomeTaxAmount, 2, MidpointRounding.AwayFromZero));
        Assert.Equal(actual.GrossAmount - actual.IncomeTaxAmount, actual.NetAmount);
    }

    [Fact]
    public void Calculate_ComDoisMeses_ComposeDuasVezes()
    {
        var calculator = CreateCalculator();
        var expectedGross = 1000m * 1.00972m * 1.00972m;

        var actual = calculator.Calculate(InvestmentAmount.Create(1000m), InvestmentTerm.Create(2));

        Assert.Equal(expectedGross, actual.GrossAmount);
    }

    [Fact]
    public void Calculate_PreservaEntradaNoResultado()
    {
        var calculator = CreateCalculator();
        var amount = InvestmentAmount.Create(2500m);
        var term = InvestmentTerm.Create(24);

        var actual = calculator.Calculate(amount, term);

        Assert.Equal(amount.Value, actual.InitialAmount);
        Assert.Equal(term.Months, actual.Months);
    }

    [Fact]
    public void Calculate_ChamaProviderUmaVez()
    {
        var provider = CreateProvider();
        var calculator = new CompoundCdbCalculator(new RegressiveIncomeTaxPolicy(), provider);

        calculator.Calculate(InvestmentAmount.Create(1000m), InvestmentTerm.Create(36));

        Assert.Equal(1, provider.Calls);
    }

    [Fact]
    public void Calculate_ComAmountNulo_LancaArgumentNullException()
    {
        var calculator = CreateCalculator();

        Assert.Throws<ArgumentNullException>(() => calculator.Calculate(null!, InvestmentTerm.Create(2)));
    }

    [Fact]
    public void Calculate_ComTermNulo_LancaArgumentNullException()
    {
        var calculator = CreateCalculator();

        Assert.Throws<ArgumentNullException>(() => calculator.Calculate(InvestmentAmount.Create(1000m), null!));
    }

    [Theory]
    [InlineData(true, false)]
    [InlineData(false, true)]
    public void Construtor_ComDependenciaNula_LancaArgumentNullException(bool nullPolicy, bool nullProvider)
    {
        IIncomeTaxPolicy policy = nullPolicy ? null! : new RegressiveIncomeTaxPolicy();
        ICdbRatesProvider provider = nullProvider ? null! : CreateProvider();

        Assert.Throws<ArgumentNullException>(() => new CompoundCdbCalculator(policy, provider));
    }

    private static FixedCdbRatesProvider CreateProvider() =>
        new(CdbRates.Create(MonthlyCdi, BankRate));

    private static CompoundCdbCalculator CreateCalculator() =>
        new(new RegressiveIncomeTaxPolicy(), CreateProvider());
}
