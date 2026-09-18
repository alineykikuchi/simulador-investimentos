using AwesomeAssertions;
using Moq;
using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;
using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Cdb.ValueObjects;
using SimuladorInvestimentos.Domain.Common.Exceptions;
using SimuladorInvestimentos.Domain.Common.ValueObjects;
using Xunit;

namespace SimuladorInvestimentos.Application.Tests.UseCases.Cdb.CalculateCdb;

public sealed class CalculateCdbUseCaseTests
{
    private readonly Mock<ICdbCalculator> _calculator = new(MockBehavior.Strict);
    private readonly CdbCalculation _calculation = CreateCalculation();
    private readonly CalculateCdbUseCase _sut;

    public CalculateCdbUseCaseTests()
    {
        // caminho feliz como default; cada teste sobrescreve só o que precisa
        _calculator
            .Setup(c => c.Calculate(It.IsAny<InvestmentAmount>(), It.IsAny<InvestmentTerm>()))
            .Returns(_calculation);

        _sut = new CalculateCdbUseCase(_calculator.Object);
    }

    [Fact]
    public void Execute_ValidRequest_BuildsValueObjectsAndCalculatesOnce()
    {
        var request = new CalculateCdbRequest(1000m, 12);

        _sut.Execute(request);

        _calculator.Verify(
            c => c.Calculate(
                It.Is<InvestmentAmount>(a => a.Value == 1000m),
                It.Is<InvestmentTerm>(t => t.Months == 12)),
            Times.Once);
    }

    [Fact]
    public void Execute_ValidRequest_ReturnsResponseMappedFromCalculation()
    {
        var request = new CalculateCdbRequest(1000m, 2);

        var response = _sut.Execute(request);

        response.Should().Be(CalculateCdbResponse.From(_calculation));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Execute_NonPositiveAmount_ThrowsDomainExceptionAndDoesNotCalculate(double initialAmount)
    {
        var request = new CalculateCdbRequest((decimal)initialAmount, 12);

        var act = () => _sut.Execute(request);

        act.Should().Throw<DomainException>()
            .WithMessage("O valor inicial da aplicação deve ser maior que zero.");
        _calculator.Verify(
            c => c.Calculate(It.IsAny<InvestmentAmount>(), It.IsAny<InvestmentTerm>()),
            Times.Never);
    }

    [Fact]
    public void Execute_AmountWithMoreThanTwoDecimals_ThrowsDomainExceptionAndDoesNotCalculate()
    {
        var request = new CalculateCdbRequest(10.001m, 12);

        var act = () => _sut.Execute(request);

        act.Should().Throw<DomainException>()
            .WithMessage("O valor inicial da aplicação deve ter no máximo duas casas decimais.");
        _calculator.Verify(
            c => c.Calculate(It.IsAny<InvestmentAmount>(), It.IsAny<InvestmentTerm>()),
            Times.Never);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(0)]
    public void Execute_TermBelowTwoMonths_ThrowsDomainExceptionAndDoesNotCalculate(int months)
    {
        var request = new CalculateCdbRequest(1000m, months);

        var act = () => _sut.Execute(request);

        act.Should().Throw<DomainException>()
            .WithMessage("O prazo de resgate deve ser maior que 1 mês.");
        _calculator.Verify(
            c => c.Calculate(It.IsAny<InvestmentAmount>(), It.IsAny<InvestmentTerm>()),
            Times.Never);
    }

    [Fact]
    public void Execute_NullRequest_ThrowsArgumentNullException()
    {
        var act = () => _sut.Execute(null!);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("request");
        _calculator.Verify(
            c => c.Calculate(It.IsAny<InvestmentAmount>(), It.IsAny<InvestmentTerm>()),
            Times.Never);
    }

    [Fact]
    public void Constructor_NullCalculator_ThrowsArgumentNullException()
    {
        var act = () => new CalculateCdbUseCase(null!);

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("calculator");
    }

    /// <summary>
    /// Vetor 1000 / 2 meses a 0,972% ao mês, com precisão cheia: bruto 1019.5344784,
    /// alíquota 22,5%, IR 4.39525764, líquido = bruto - IR. É o mesmo vetor de
    /// <see cref="CalculateCdbResponseTests"/>, para o mapeamento ser verificável a olho.
    /// </summary>
    private static CdbCalculation CreateCalculation()
    {
        var gross = 1000m * 1.00972m * 1.00972m;
        var tax = (gross - 1000m) * 0.225m;

        return new CdbCalculation(1000m, 2, gross, 0.225m, tax, gross - tax);
    }
}
