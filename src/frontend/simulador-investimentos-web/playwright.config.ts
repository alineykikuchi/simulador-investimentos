import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração dos testes E2E (Playwright).
 *
 * - Os specs ficam em `e2e/` e são compilados com `tsconfig.e2e.json`, fora do build do app.
 * - `webServer` sobe o `ng serve` na porta 4200 quando ela não está em uso; localmente,
 *   se o `npm start` já estiver rodando, o Playwright reaproveita esse servidor.
 * - O `ng serve` usa o `proxy.conf.json`, então chamadas a `/api` continuam indo para a
 *   API .NET em `localhost:5080`. Specs que precisam do cálculo real dependem da API estar
 *   no ar; os demais podem interceptar `/api/**` com `page.route`.
 */

// Sobrescreva com `E2E_PORT=4300 npm run e2e` para não colidir com um `npm start` já aberto.
const PORT = Number(process.env['E2E_PORT'] ?? 4200);
const BASE_URL = `http://localhost:${PORT}`;
const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: BASE_URL,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
