import { expect, test } from '@playwright/test';
import {
  CDB_API_ROUTE,
  CDB_VECTORS,
  mockCdbApi,
  mockCdbApiOffline,
  okResponse,
  problemResponse,
} from './fixtures/cdb-api';
import { SimuladorPage } from './fixtures/simulador-page';

const VECTOR = CDB_VECTORS.tenThousandFor12Months;
const ERROR_TITLE = 'Não foi possível calcular';

test.describe('Erros da API', () => {
  test('deve exibir o detail do ProblemDetails quando a API responde 400', async ({ page }) => {
    const detail = 'O prazo deve ser maior que 1 mês.';
    await mockCdbApi(page, problemResponse(detail));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);

    await simulador.expectPlaceholder(ERROR_TITLE, detail);
    await expect(page.getByRole('button', { name: 'Calcular investimento' })).toBeEnabled();
  });

  test('deve exibir a primeira mensagem de errors quando o 400 vem sem detail', async ({
    page,
  }) => {
    await mockCdbApi(page, {
      status: 400,
      contentType: 'application/problem+json',
      body: {
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: { months: ['O prazo em meses deve ser maior que 1.'] },
      },
    });
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);

    await simulador.expectPlaceholder(ERROR_TITLE, 'O prazo em meses deve ser maior que 1.');
  });

  test('deve exibir a mensagem genérica quando a API responde 500', async ({ page }) => {
    await mockCdbApi(page, { status: 500, body: { title: 'Internal Server Error', status: 500 } });
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);

    await simulador.expectPlaceholder(
      ERROR_TITLE,
      'Não foi possível calcular agora. Tente novamente em instantes.',
    );
  });

  test('deve avisar que não conectou ao servidor quando a API está fora do ar', async ({
    page,
  }) => {
    await mockCdbApiOffline(page);
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);

    await simulador.expectPlaceholder(
      ERROR_TITLE,
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  });

  test('deve se recuperar do erro ao calcular de novo com a API respondendo', async ({ page }) => {
    await mockCdbApi(page, problemResponse('Falha temporária.'));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);
    await simulador.expectPlaceholder(ERROR_TITLE, 'Falha temporária.');

    await page.unroute(CDB_API_ROUTE);
    await mockCdbApi(page, okResponse(VECTOR));
    await simulador.submit();

    await simulador.expectResult(VECTOR);
  });
});
