# Testes E2E (Playwright)

Specs de ponta a ponta do front, executados contra o `ng serve` em `http://localhost:4200`.

```bash
npm run e2e            # headless, sobe o dev-server se a porta 4200 estiver livre
npm run e2e:ui         # modo interativo (UI mode)
npm run e2e:headed     # navegador visível
npm run e2e:report     # abre o último relatório HTML
npm run e2e:typecheck  # só compila os specs (tsconfig.e2e.json)

E2E_REAL_API=1 npm run e2e -- --grep @api   # contra a API .NET em localhost:5080
```

## Organização

| Arquivo                      | Cobre                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `simulador.spec.ts`          | carga inicial, cálculo completo, contrato da requisição, Enter, carregando, limpar, máscara |
| `validacao.spec.ts`          | erros locais (vazio, prazo 1, fracionado, valor zero), foco, `aria-invalid`, sem chamada à API |
| `erros-api.spec.ts`          | 400 com `detail`, 400 com `errors`, 500, API fora do ar, recuperação após erro           |
| `responsivo.spec.ts`         | coluna única em 390 px (sem scroll horizontal, rola até o resultado) e duas colunas em 1280 |
| `api-real.spec.ts`           | os vetores da spec contra a API real (`@api`, só com `E2E_REAL_API=1`)                 |
| `fixtures/cdb-api.ts`        | mock explícito de `POST /api/v1/cdb/calculations` + vetores da spec da API             |
| `fixtures/simulador-page.ts` | page object: seletores acessíveis, `expectResult`, `expectPlaceholder`, regex de R$    |

## Convenções

- O `ng serve` aplica o `proxy.conf.json`, então `/api` vai para a API .NET em `localhost:5080`.
  Todo spec do run padrão intercepta a rota com `mockCdbApi`/`mockCdbApiOffline`; só o `@api`
  depende do backend.
- Cada teste declara a resposta que quer (`okResponse(vetor)`, `problemResponse(detail)`, objeto
  literal). O mock devolve `requests` para afirmar o corpo enviado ou a ausência de chamada.
- Prefira seletores acessíveis (`getByRole`, `getByLabel`, `getByText`) a classes CSS.
- Nome do `test` em português, dizendo o comportamento, como nos specs do Vitest.
- `test-results/` e `playwright-report/` são gerados e ignorados pelo git.
