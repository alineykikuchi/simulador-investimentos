import { TestBed } from '@angular/core/testing';

import { provideBrazilianLocale } from '../../core/i18n/locale';
import { IncomeTaxBracketPipe } from './income-tax-bracket-pipe';

describe('IncomeTaxBracketPipe', () => {
  let pipe: IncomeTaxBracketPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideBrazilianLocale(), IncomeTaxBracketPipe],
    });
    pipe = TestBed.inject(IncomeTaxBracketPipe);
  });

  it.each([
    [0.225, 'até 6 meses · 22,5%'],
    [0.2, '7 a 12 meses · 20%'],
    [0.175, '13 a 24 meses · 17,5%'],
    [0.15, 'acima de 24 meses · 15%'],
  ])('deve rotular a alíquota %s com a faixa correspondente', (rate, label) => {
    expect(pipe.transform(rate)).toBe(label);
  });

  it('deve exibir só o percentual em pt-BR quando a alíquota não tem faixa conhecida', () => {
    expect(pipe.transform(0.18)).toBe('18%');
    expect(pipe.transform(0.125)).toBe('12,5%');
  });
});
