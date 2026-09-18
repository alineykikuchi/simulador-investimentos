using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Application.Tests.UseCases.Cdb.CalculateCdb;

public sealed class CalculateCdbResponseTests
{
    [Fact]
    public void From_ComValoresCheios_ArredondaBrutoEImpostoEDerivaLiquido()
    {
        // 1000 por 2 meses a 0,972% ao mês: bruto 1019.5344784, IR (22,5%) 4.39525764.
        // O líquido cheio (1015.13922016) arredondado daria 1015.14; a regra exige 1019.53 - 4.40.
        var gross = 1000m * 1.00972m * 1.00972m;
        var tax = (gross - 1000m) * 0.225m;
        var calculation = new CdbCalculation(1000m, 2, gross, 0.225m, tax, gross - tax);

        var response = CalculateCdbResponse.From(calculation);

        Assert.Equal(1019.53m, response.GrossAmount);
        Assert.Equal(4.40m, response.IncomeTaxAmount);
        Assert.Equal(1015.13m, response.NetAmount);
        Assert.Equal(0.225m, response.IncomeTaxRate);
    }

    [Fact]
    public void From_ComMeioCentavo_ArredondaParaCima()
    {
        var calculation = new CdbCalculation(100m, 2, 100.005m, 0.225m, 0.005m, 100m);

        var response = CalculateCdbResponse.From(calculation);

        Assert.Equal(100.01m, response.GrossAmount);
        Assert.Equal(0.01m, response.IncomeTaxAmount);
        Assert.Equal(100.00m, response.NetAmount);
    }

    [Fact]
    public void From_ComCalculationNulo_LancaArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => CalculateCdbResponse.From(null!));
    }
}
