import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, Provider } from '@angular/core';

registerLocaleData(localePt, 'pt-BR');

/**
 * Locale pt-BR com moeda padrão BRL para os pipes `currency`, `number`, `percent` e `date`.
 * Usar em `app.config.ts` e em todo spec que renderiza moeda — sem isto o `currency`
 * renderiza `R$11,230.82`.
 */
export function provideBrazilianLocale(): Provider[] {
  return [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ];
}
