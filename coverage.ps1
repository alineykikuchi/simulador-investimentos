<#
.SYNOPSIS
Roda os testes do backend com cobertura, gera o relatório HTML e abre no navegador.

.DESCRIPTION
Equivale a executar, na raiz do repositório:
  dotnet test SimuladorInvestimentos.slnx
  reportgenerator -reports:TestResults/**/coverage.cobertura.xml -targetdir:coverage-report -reporttypes:Html
  start coverage-report\index.html

O relatório é gerado mesmo quando o quality gate de cobertura falha, para mostrar o que
ficou descoberto. O código de saída é o do `dotnet test`, então o script serve em CI com
`-NoOpen`.

.PARAMETER NoOpen
Gera o relatório sem abrir o navegador.

.EXAMPLE
.\coverage.ps1
.EXAMPLE
.\coverage.ps1 -NoOpen
#>
[CmdletBinding()]
param(
    [switch]$NoOpen
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

if (-not (Get-Command reportgenerator -ErrorAction SilentlyContinue)) {
    throw 'reportgenerator não encontrado. Instale uma vez com: dotnet tool install --global dotnet-reportgenerator-globaltool'
}

& dotnet test (Join-Path $root 'SimuladorInvestimentos.slnx')
$testExitCode = $LASTEXITCODE

$reports = Join-Path $root 'TestResults\**\coverage.cobertura.xml'
$targetDir = Join-Path $root 'coverage-report'
& reportgenerator "-reports:$reports" "-targetdir:$targetDir" '-reporttypes:Html'
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

if (-not $NoOpen) {
    Start-Process (Join-Path $targetDir 'index.html')
}

exit $testExitCode
