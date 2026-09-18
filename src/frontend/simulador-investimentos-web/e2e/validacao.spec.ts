import { expect, test } from '@playwright/test';
import { CDB_VECTORS, mockCdbApi, okResponse } from './fixtures/cdb-api';
import { SimuladorPage } from './fixtures/simulador-page';

const AMOUNT_ERROR = 'Informe um valor maior que zero.';
const MONTHS_ERROR = 'Informe um prazo inteiro de pelo menos 2 meses.';
const VECTOR = CDB_VECTORS.tenThousandFor12Months;

test.describe('Validação do formulário', () => {
  test('deve exibir as dicas de preenchimento antes de qualquer erro', async ({ page }) => {
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await expect(page.getByText('Somente valores positivos.')).toBeVisible();
    await expect(page.getByText('Mínimo de 2 meses.')).toBeVisible();
    await expect(simulador.amount).not.toHaveAttribute('aria-invalid', 'true');
    await expect(simulador.months).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('deve apontar os dois campos, focar o valor e não chamar a API no envio vazio', async ({
    page,
  }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.submit();

    await expect(page.getByText(AMOUNT_ERROR)).toBeVisible();
    await expect(page.getByText(MONTHS_ERROR)).toBeVisible();
    await expect(simulador.amount).toHaveAttribute('aria-invalid', 'true');
    await expect(simulador.months).toHaveAttribute('aria-invalid', 'true');
    await expect(simulador.amount).toBeFocused();
    await expect(simulador.amount).toHaveAccessibleDescription(AMOUNT_ERROR);

    await simulador.expectPlaceholder('Nenhum cálculo ainda');
    expect(api.requests).toHaveLength(0);
  });

  test('deve rejeitar prazo de 1 mês e focar o prazo', async ({ page }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.amount.fill(VECTOR.typedAmount);
    await simulador.months.fill('1');
    await simulador.submit();

    await expect(page.getByText(MONTHS_ERROR)).toBeVisible();
    await expect(page.getByText(AMOUNT_ERROR)).toBeHidden();
    await expect(simulador.months).toHaveAttribute('aria-invalid', 'true');
    await expect(simulador.months).toBeFocused();
    expect(api.requests).toHaveLength(0);
  });

  test('deve rejeitar prazo fracionado', async ({ page }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.amount.fill(VECTOR.typedAmount);
    await simulador.months.fill('2.5');
    await simulador.submit();

    await expect(page.getByText(MONTHS_ERROR)).toBeVisible();
    expect(api.requests).toHaveLength(0);
  });

  test('deve rejeitar valor zero', async ({ page }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.amount.fill('0,00');
    await simulador.months.fill('12');
    await simulador.submit();

    await expect(page.getByText(AMOUNT_ERROR)).toBeVisible();
    await expect(simulador.amount).toBeFocused();
    expect(api.requests).toHaveLength(0);
  });

  test('deve descartar o resultado anterior quando um novo envio é inválido', async ({ page }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);
    await simulador.expectResult(VECTOR);

    await simulador.months.fill('1');
    await simulador.submit();

    await expect(page.getByText(MONTHS_ERROR)).toBeVisible();
    await simulador.expectPlaceholder('Nenhum cálculo ainda');
  });

  test('deve limpar o erro assim que o campo é corrigido e calcular em seguida', async ({
    page,
  }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.submit();
    await expect(page.getByText(AMOUNT_ERROR)).toBeVisible();

    await simulador.fill(VECTOR);

    await expect(page.getByText(AMOUNT_ERROR)).toBeHidden();
    await expect(page.getByText(MONTHS_ERROR)).toBeHidden();

    await simulador.submit();
    await simulador.expectResult(VECTOR);
  });
});
