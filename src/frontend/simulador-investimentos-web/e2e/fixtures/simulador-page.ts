import { expect, type Locator, type Page } from '@playwright/test';
import type { CdbVector } from './cdb-api';

/** Page object da tela: seletores acessíveis e ações repetidas pelos specs. */
export class SimuladorPage {
  readonly amount: Locator;
  readonly months: Locator;
  readonly calculate: Locator;
  readonly clear: Locator;
  /** A `section` do painel de resultado (`aria-labelledby` → `h2#titulo-resultado`). */
  readonly resultPanel: Locator;

  constructor(private readonly page: Page) {
    this.amount = page.getByLabel('Valor da aplicação (R$)');
    this.months = page.getByLabel('Prazo para resgate (meses)');
    this.calculate = page.getByRole('button', { name: /Calcular investimento|Calculando…/ });
    this.clear = page.getByRole('button', { name: 'Limpar campos' });
    this.resultPanel = page.locator('section.result');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(
      this.page.getByRole('heading', { level: 1, name: 'Quanto o seu dinheiro rende?' }),
    ).toBeVisible();
  }

  async fill(vector: CdbVector): Promise<void> {
    await this.amount.fill(vector.typedAmount);
    await this.months.fill(String(vector.request.months));
  }

  async submit(): Promise<void> {
    await this.calculate.click();
  }

  async simulate(vector: CdbVector): Promise<void> {
    await this.fill(vector);
    await this.submit();
  }

  /** Confere o painel de resultado inteiro para o vetor: resumo, cartões e detalhamento. */
  async expectResult(vector: CdbVector): Promise<void> {
    const { request, response } = vector;
    const panel = this.resultPanel;

    await expect(
      panel.getByRole('heading', { level: 2, name: 'Resultado da simulação' }),
    ).toBeVisible();
    await expect(
      panel.getByText(brl(request.initialAmount, { suffix: `por ${request.months} meses` })),
    ).toBeVisible();

    await expect(panel.getByText('Resultado bruto')).toBeVisible();
    await expect(panel.getByText(brl(response.grossAmount))).toBeVisible();
    await expect(panel.getByText('Resultado líquido')).toBeVisible();
    await expect(panel.getByText(brl(response.netAmount))).toBeVisible();

    const grossYield = response.grossAmount - request.initialAmount;
    const netYield = response.netAmount - request.initialAmount;
    await expect(panel.getByText(brl(grossYield, { prefix: '+' }))).toBeVisible();
    await expect(panel.getByText(brl(response.incomeTaxAmount, { prefix: '−' }))).toBeVisible();
    await expect(panel.getByText(brl(netYield, { prefix: '+' }))).toBeVisible();
  }

  async expectPlaceholder(title: string, text?: string | RegExp): Promise<void> {
    await expect(this.resultPanel.getByRole('heading', { level: 2, name: title })).toBeVisible();
    if (text !== undefined) {
      await expect(this.resultPanel.getByText(text)).toBeVisible();
    }
  }
}

/**
 * Regex para um valor em reais como o `CurrencyPipe` pt-BR renderiza (`R$` + espaço não separável).
 * `prefix` cobre os sinais do detalhamento (`+`/`−`), `suffix` o resumo (`por 12 meses`).
 */
export function brl(value: number, options: { prefix?: string; suffix?: string } = {}): RegExp {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(value * 100) / 100);
  const escaped = formatted.replace(/\./g, '\\.');
  const head = options.prefix ? `${escapeRegExp(options.prefix)}\\s` : '';
  const tail = options.suffix ? `\\s${escapeRegExp(options.suffix)}` : '';
  return new RegExp(`^${head}R\\$\\s${escaped}${tail}$`);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
