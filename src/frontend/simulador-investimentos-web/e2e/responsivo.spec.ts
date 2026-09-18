import { expect, test } from '@playwright/test';
import { CDB_VECTORS, mockCdbApi, okResponse } from './fixtures/cdb-api';
import { SimuladorPage } from './fixtures/simulador-page';

const VECTOR = CDB_VECTORS.tenThousandFor12Months;

/** Abaixo de 1024 px a página fica em coluna única e o painel de resultado sai da dobra. */
test.describe('Coluna única (celular)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });

  test('deve caber na largura sem scroll horizontal', async ({ page }) => {
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test('deve rolar até o resultado após calcular', async ({ page }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    // Antes de calcular, o painel vazio começa abaixo da dobra: só parte dele aparece.
    await expect(simulador.resultPanel).not.toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await simulador.simulate(VECTOR);

    await simulador.expectResult(VECTOR);
    await expect(
      simulador.resultPanel.getByRole('heading', { level: 2, name: 'Resultado da simulação' }),
    ).toBeInViewport({ ratio: 1 });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});

test.describe('Duas colunas (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 820 } });

  test('deve manter formulário e resultado lado a lado sem rolar', async ({ page }) => {
    await mockCdbApi(page, okResponse(VECTOR));
    const simulador = new SimuladorPage(page);
    await simulador.goto();

    await simulador.simulate(VECTOR);
    await simulador.expectResult(VECTOR);

    const form = await page.locator('app-cdb-form').boundingBox();
    const panel = await simulador.resultPanel.boundingBox();
    expect(form).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(form!.x + form!.width);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});
