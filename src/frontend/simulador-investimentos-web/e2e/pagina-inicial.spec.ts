import { expect, test } from '@playwright/test';

test.describe('Página inicial', () => {
  test('deve carregar o simulador com o formulário de valor e prazo', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Simulador/i);
    await expect(page.getByText('Simulador de CDB', { exact: true })).toBeVisible();

    await expect(page.getByLabel('Valor da aplicação (R$)')).toBeVisible();
    await expect(page.getByLabel('Prazo para resgate (meses)')).toBeVisible();
    await expect(page.getByRole('button', { name: /Calcular/ })).toBeEnabled();
  });
});
