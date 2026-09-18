import { formatPercent } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/**
 * Rótulos das faixas da tabela regressiva (spec §5.8), indexados por `Math.round(rate * 1000)`
 * para evitar comparação de ponto flutuante. É só apresentação: a alíquota vem da API (D5).
 */
const BRACKET_LABELS: ReadonlyMap<number, string> = new Map([
  [225, 'até 6 meses · 22,5%'],
  [200, '7 a 12 meses · 20%'],
  [175, '13 a 24 meses · 17,5%'],
  [150, 'acima de 24 meses · 15%'],
]);

/** Converte a alíquota devolvida pela API no rótulo da faixa; alíquota desconhecida vira percentual. */
@Pipe({ name: 'incomeTaxBracket' })
export class IncomeTaxBracketPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(rate: number): string {
    return BRACKET_LABELS.get(Math.round(rate * 1000)) ?? formatPercent(rate, this.locale, '1.0-1');
  }
}
