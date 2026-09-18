import { expect, test } from '@playwright/test';
import { CDB_VECTORS, mockCdbApi, okResponse } from './fixtures/cdb-api';
import { SimuladorPage } from './fixtures/simulador-page';

const VECTOR = CDB_VECTORS.tenThousandFor12Months;

test.describe('Simulador de CDB', () => {
  test('deve carregar o simulador com o formulário de valor e prazo e o painel vazio', async ({
    page,
  }) => {
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await expect(page).toHaveTitle(/Simulador/i);
    await expect(page.getByText('Simulador de CDB', { exact: true })).toBeVisible();
    await expect(page.getByText(/CDI 0,9% a\.m\./)).toBeVisible();

    await expect(simulador.amount).toBeVisible();
    await expect(simulador.amount).toHaveValue('');
    await expect(simulador.months).toBeVisible();
    await expect(simulador.months).toHaveValue('');
    await expect(simulador.calculate).toBeEnabled();
    await expect(simulador.clear).toBeEnabled();

    await simulador.expectPlaceholder('Nenhum cálculo ainda', /Preencha o valor e o prazo/);
  });

  test('deve calcular 10.000,00 por 12 meses e exibir bruto, líquido, IR e rendimentos', async ({
    page,
  }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);

    await simulador.expectResult(VECTOR);
    await expect(simulador.resultPanel.getByText('7 a 12 meses · 20%')).toBeVisible();
    await expect(simulador.resultPanel.getByText('0,972% a.m.')).toBeVisible();
  });

  test('deve enviar à API exatamente o valor numérico e o prazo informados', async ({ page }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);
    await simulador.expectResult(VECTOR);

    expect(api.requests).toEqual([VECTOR.request]);
  });

  test('deve enviar o formulário com Enter no campo de prazo', async ({ page }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.fill(VECTOR);
    await simulador.months.press('Enter');

    await simulador.expectResult(VECTOR);
    expect(api.requests).toHaveLength(1);
  });

  test('deve mostrar "Calculando…" com o botão desabilitado enquanto a API não responde', async ({
    page,
  }) => {
    const api = await mockCdbApi(page, okResponse(VECTOR), { hold: true });
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);

    await expect(page.getByRole('button', { name: 'Calculando…' })).toBeDisabled();
    await expect(simulador.resultPanel).toHaveAttribute('aria-busy', 'true');
    await simulador.expectPlaceholder('Calculando…');

    api.release();

    await simulador.expectResult(VECTOR);
    await expect(page.getByRole('button', { name: 'Calcular investimento' })).toBeEnabled();
    await expect(simulador.resultPanel).not.toHaveAttribute('aria-busy', 'true');
  });

  test('deve manter o resumo da simulação mesmo após editar os campos', async ({ page }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);
    await simulador.expectResult(VECTOR);

    await simulador.months.fill('24');

    await simulador.expectResult(VECTOR);
  });

  test('deve limpar os campos, voltar ao painel vazio e focar o valor', async ({ page }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);
    await simulador.expectResult(VECTOR);

    await simulador.clear.click();

    await expect(simulador.amount).toHaveValue('');
    await expect(simulador.months).toHaveValue('');
    await expect(simulador.amount).toBeFocused();
    await expect(simulador.amount).not.toHaveAttribute('aria-invalid', 'true');
    await simulador.expectPlaceholder('Nenhum cálculo ainda');
  });

  test('deve formatar o valor digitado no padrão pt-BR ao sair do campo', async ({ page }) => {
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.amount.fill('1234,5');
    await simulador.months.focus();

    await expect(simulador.amount).toHaveValue('1.234,50');
  });
});
