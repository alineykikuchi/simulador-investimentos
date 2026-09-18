# Testes E2E (Playwright)

Specs de ponta a ponta do front, executados contra o `ng serve` em `http://localhost:4200`.

```bash
npm run e2e            # headless, sobe o dev-server se a porta 4200 estiver livre
npm run e2e:ui         # modo interativo (UI mode)
npm run e2e:headed     # navegador visível
npm run e2e:report     # abre o último relatório HTML
```

- O `ng serve` aplica o `proxy.conf.json`, então `/api` vai para a API .NET em `localhost:5080`.
  Specs que dependem do cálculo real precisam da API no ar; os demais devem interceptar
  `/api/**` com `page.route` para não depender do backend.
- Prefira seletores acessíveis (`getByRole`, `getByLabel`, `getByText`) a classes CSS.
- Nome do `test` em português, dizendo o comportamento, como nos specs do Vitest.
- `test-results/` e `playwright-report/` são gerados e ignorados pelo git.
