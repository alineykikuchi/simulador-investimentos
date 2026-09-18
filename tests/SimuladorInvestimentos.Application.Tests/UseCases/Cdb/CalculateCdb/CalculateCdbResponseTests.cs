using AwesomeAssertions;
using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Application.Tests.UseCases.Cdb.CalculateCdb;

public sealed class CalculateCdbResponseTests
{
    [Fact]
    public void From_FullPrecisionValues_RoundsGrossAndTaxAndDerivesNet()
    {
        // 1000 por 2 meses a 0,972% ao mês: bruto 1019.5344784, IR (22,5%) 4.39525764.
        // O líquido cheio (1015.13922016) arredondado daria 1015.14; a regra exige 1019.53 - 4.40.
        var gross = 1000m * 1.00972m * 1.00972m;
        var tax = (gross - 1000m) * 0.225m;
        var calculation = new CdbCalculation(1000m, 2, gross, 0.225m, tax, gross - tax);

        var response = CalculateCdbResponse.From(calculation);

        response.GrossAmount.Should().Be(1019.53m);
        response.IncomeTaxAmount.Should().Be(4.40m);
        response.NetAmount.Should().Be(1015.13m);
    }

    [Fact]
    public void From_HalfCent_RoundsAwayFromZero()
    {
        var calculation = new CdbCalculation(100m, 2, 100.005m, 0.225m, 0.005m, 100m);

        var response = CalculateCdbResponse.From(calculation);

        response.GrossAmount.Should().Be(100.01m);
        response.IncomeTaxAmount.Should().Be(0.01m);
        response.NetAmount.Should().Be(100.00m);
    }

    [Fact]
    public void From_AnyCalculation_KeepsIncomeTaxRateUnrounded()
    {
        var calculation = new CdbCalculation(1000m, 24, 1200m, 0.175m, 35m, 1165m);

        var response = CalculateCdbResponse.From(calculation);

        response.IncomeTaxRate.Should().Be(0.175m);
    }

    [Fact]
    public void From_NullCalculation_ThrowsArgumentNullException()
    {
        var act = () => CalculateCdbResponse.From(null!);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("calculation");
    }
}
