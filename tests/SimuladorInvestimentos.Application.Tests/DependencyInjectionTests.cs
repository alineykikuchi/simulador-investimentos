using AwesomeAssertions;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using SimuladorInvestimentos.Application.UseCases.Cdb.CalculateCdb;
using SimuladorInvestimentos.Domain.Cdb.Ports;
using SimuladorInvestimentos.Domain.Cdb.Services;
using SimuladorInvestimentos.Domain.Common.Tax;
using Xunit;

namespace SimuladorInvestimentos.Application.Tests;

public sealed class DependencyInjectionTests
{
    [Fact]
    public void AddApplication_NullServices_ThrowsArgumentNullException()
    {
        var act = () => ((IServiceCollection)null!).AddApplication();

        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("services");
    }

    [Fact]
    public void AddApplication_AnyCollection_ReturnsSameCollection()
    {
        var services = new ServiceCollection();

        var result = services.AddApplication();

        result.Should().BeSameAs(services);
    }

    [Theory]
    [InlineData(typeof(IIncomeTaxPolicy), typeof(RegressiveIncomeTaxPolicy))]
    [InlineData(typeof(ICdbCalculator), typeof(CompoundCdbCalculator))]
    [InlineData(typeof(ICalculateCdbUseCase), typeof(CalculateCdbUseCase))]
    public void AddApplication_AnyCollection_RegistersDomainServicesAndUseCaseAsSingletons(
        Type serviceType,
        Type implementationType)
    {
        var services = new ServiceCollection();

        services.AddApplication();

        services.Should().ContainSingle(d =>
            d.ServiceType == serviceType
            && d.ImplementationType == implementationType
            && d.Lifetime == ServiceLifetime.Singleton);
    }

    [Fact]
    public void AddApplication_WithRatesProviderRegistered_ResolvesUseCase()
    {
        // ICdbRatesProvider é registrado pela Api; sem ele o grafo não resolve.
        var ratesProvider = new Mock<ICdbRatesProvider>();
        var services = new ServiceCollection();

        using var provider = services
            .AddSingleton(ratesProvider.Object)
            .AddApplication()
            .BuildServiceProvider();

        provider.GetRequiredService<ICalculateCdbUseCase>().Should().BeOfType<CalculateCdbUseCase>();
    }
}
