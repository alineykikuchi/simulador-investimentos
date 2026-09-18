using SimuladorInvestimentos.Application.Tests.Support;
using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;
using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.Exceptions;
using SimuladorInvestimentos.Domain.Common.Tax;
using Xunit;

namespace SimuladorInvestimentos.Application.Tests.UseCases.Cdb.CalculateCdb;

public sealed class CalculateCdbUseCaseTests
{
    // Calculadora real (é pura); só a porta de taxas é substituída por um fake.
    private readonly CalculateCdbUseCase _useCase = new(
        new CompoundCdbCalculator(
            new RegressiveIncomeTaxPolicy(),
            new FixedCdbRatesProvider(CdbRates.Create(0.009m, 1.08m))));

    [Theory]
    [InlineData(1000.00, 2, 0.225, 1019.53, 4.40, 1015.13)]
    [InlineData(100.00, 3, 0.225, 102.94, 0.66, 102.28)]
    [InlineData(5000.00, 6, 0.225, 5298.78, 67.23, 5231.55)]
    [InlineData(5000.00, 7, 0.20, 5350.28, 70.06, 5280.22)]
    [InlineData(10000.00, 12, 0.20, 11230.82, 246.16, 10984.66)]
    [InlineData(2500.00, 24, 0.175, 3153.28, 114.32, 3038.96)]
    [InlineData(2500.00, 25, 0.15, 3183.93, 102.59, 3081.34)]
    [InlineData(123456.78, 36, 0.15, 174883.75, 7714.05, 167169.70)]
    public void Execute_ComMassaDeReferencia_RetornaResponseArredondado(
        double initialAmount,
        int months,
        double incomeTaxRate,
        double grossAmount,
        double incomeTaxAmount,
        double netAmount)
    {
        var request = new CalculateCdbRequest((decimal)initialAmount, months);

        var response = _useCase.Execute(request);

        Assert.Equal((decimal)grossAmount, response.GrossAmount);
        Assert.Equal((decimal)incomeTaxAmount, response.IncomeTaxAmount);
        Assert.Equal((decimal)netAmount, response.NetAmount);
        Assert.Equal((decimal)incomeTaxRate, response.IncomeTaxRate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Execute_ComValorNaoPositivo_LancaDomainException(double initialAmount)
    {
        var request = new CalculateCdbRequest((decimal)initialAmount, 12);

        var ex = Assert.Throws<DomainException>(() => _useCase.Execute(request));

        Assert.Contains("maior que", ex.Message, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(0)]
    public void Execute_ComPrazoMenorQueDois_LancaDomainException(int months)
    {
        var request = new CalculateCdbRequest(1000m, months);

        var ex = Assert.Throws<DomainException>(() => _useCase.Execute(request));

        Assert.Contains("maior que", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Execute_ComRequestNulo_LancaArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => _useCase.Execute(null!));
    }

    [Fact]
    public void Construtor_ComCalculadoraNula_LancaArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => new CalculateCdbUseCase(null!));
    }
}
