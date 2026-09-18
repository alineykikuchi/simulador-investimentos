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
    public void Create_ComPrazoMaiorQueUmMes_MantemOPrazoInformado(int months)
    {
        var term = InvestmentTerm.Create(months);

        Assert.Equal(months, term.Months);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(0)]
    [InlineData(-3)]
    public void Create_ComPrazoMenorOuIgualAUmMes_LancaDomainException(int months)
    {
        var exception = Assert.Throws<DomainException>(() => InvestmentTerm.Create(months));

        Assert.Contains("maior que 1", exception.Message, StringComparison.Ordinal);
    }
}
