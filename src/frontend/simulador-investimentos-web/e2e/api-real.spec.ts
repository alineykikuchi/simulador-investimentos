import { test } from '@playwright/test';
import { CDB_VECTORS } from './fixtures/cdb-api';
import { SimuladorPage } from './fixtures/simulador-page';

/**
 * Ponta a ponta de verdade: sem mock, o `ng serve` encaminha `/api` para a API .NET em
 * `localhost:5080`. Só roda com `E2E_REAL_API=1`, para o run padrão não depender do backend.
 *
 *   E2E_REAL_API=1 npm run e2e -- --grep @api
 */
test.describe('API real', { tag: '@api' }, () => {
  test.skip(!process.env['E2E_REAL_API'], 'Defina E2E_REAL_API=1 com a API em localhost:5080.');

  for (const vector of Object.values(CDB_VECTORS)) {
    test(`deve calcular ${vector.typedAmount} por ${vector.request.months} meses com os valores da API`, async ({
      page,
    }) => {
      const simulador = new SimuladorPage(page);
      await simulador.goto();

      await simulador.simulate(vector);

      await simulador.expectResult(vector);
    });
  }
});
