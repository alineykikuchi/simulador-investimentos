# Simulador de Investimentos — Web

Tela do simulador de CDB em Angular 21 (standalone, zoneless, signals). O usuário informa o
valor e o prazo em meses, a aplicação chama a API .NET e exibe o resultado bruto, o imposto de
renda e o resultado líquido. Toda regra de negócio (fórmula, alíquota, arredondamento) fica na
API; o front valida apenas o formato dos campos e mostra o que ela devolve.

As regras de negócio, os pré-requisitos e o passo a passo da solução completa estão no
`README.md` da raiz do repositório.

## Como executar

```bash
npm install
npm start               # http://localhost:4200
```

O `proxy.conf.json` encaminha as chamadas a `/api` para a API em `http://localhost:5080`,
então o código usa caminhos relativos e não conhece host nem porta. Para ver o resultado do
cálculo, a API precisa estar no ar (`dotnet run --project src/backend/SimuladorInvestimentos.Api --launch-profile http`
a partir da raiz); com ela fora, a tela mostra o estado de erro.

Outros comandos:

```bash
npm run build           # bundle de produção em dist/
npm run test:ci         # testes unitários (Vitest), uma execução
npm run test:coverage   # com relatório de cobertura
npm run e2e             # testes de ponta a ponta (Playwright), headless
npm run e2e:ui          # Playwright em modo interativo
npm run e2e:report      # abre o último relatório HTML dos E2E
```

## Estrutura

```
src/
├── app/
│   ├── core/
│   │   ├── i18n/locale.ts                  locale pt-BR registrado para moeda e percentual
│   │   ├── models/                         contrato da API (CdbCalculation, ProblemDetails)
│   │   └── services/cdb-api.ts             único ponto que usa HttpClient (POST /api/v1/cdb/calculations)
│   └── features/cdb-calculator/
│       ├── cdb-calculator.*                container: liga formulário, estado e painel de resultado
│       ├── cdb-form/                       formulário reativo tipado (valor em R$ e prazo em meses)
│       ├── cdb-result/                     painel de resultado (bruto, IR, líquido, alíquota)
│       ├── cdb-result-placeholder/         estados vazio, carregando e erro
│       ├── field-message/                  ajuda ou erro de campo, ligado ao input por aria-describedby
│       ├── brl-amount-input.ts             diretiva de entrada monetária em pt-BR
│       ├── cdb-simulation.ts               estado da simulação (signals + resource)
│       ├── cdb-parameters.ts               textos dos parâmetros vigentes (CDI e taxa do banco)
│       └── income-tax-bracket-pipe.ts      rótulo da faixa da tabela regressiva
├── styles/                                 tokens de design, base global e breakpoints
└── styles.scss                             fontes auto-hospedadas (sem requisição a terceiros)
```

Convenções que sustentam essa árvore:

- **Componentes pequenos, uma responsabilidade.** Estado de servidor vive em service
  (`CdbSimulation`), nunca no componente; o componente consome signals.
- **Inputs, outputs e control flow nativos** (`input()`, `output()`, `@if`, `@for`).
- **Validação de formato no front, regra de negócio na API.** Quando a API recusa a entrada,
  a tela mostra o `detail` do `ProblemDetails` devolvido com status 400.
- **Acessibilidade:** `label` ligado ao campo, foco visível, erro anunciado via
  `aria-describedby` e `aria-invalid`, resultado em região `aria-live="polite"`.
- **Responsivo, mobile-first:** uma coluna no celular e no tablet, duas colunas a partir do
  desktop; o painel de resultado se adapta ao espaço com container queries.

## Testes

Testes unitários com [Vitest](https://vitest.dev/) (`ng test`), um `*.spec.ts` ao lado de
cada componente, service, diretiva e pipe. Componentes que chamam a API testam com
`provideHttpClientTesting()`, sem depender do backend.

Testes de ponta a ponta com [Playwright](https://playwright.dev/) em `e2e/`. O
`playwright.config.ts` sobe o `ng serve` na porta 4200 quando nada está escutando nela
(`E2E_PORT` troca a porta):

```bash
npx playwright install chromium   # uma vez por máquina
npm run e2e
```

Mais detalhes em `e2e/README.md`.
