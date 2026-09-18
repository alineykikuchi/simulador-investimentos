import { CurrencyPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { provideBrazilianLocale } from './locale';

// O `currency` pt-BR usa espaço não separável (U+00A0) entre `R$` e o número.
const normalize = (text: string | null): string => (text ?? '').replace(/\u00a0/g, ' ');

describe('provideBrazilianLocale', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...provideBrazilianLocale(), CurrencyPipe] });
  });

  it('deve formatar moeda em pt-BR com BRL como moeda padrão', () => {
    const pipe = TestBed.inject(CurrencyPipe);

    expect(normalize(pipe.transform(11230.82))).toBe('R$ 11.230,82');
  });

  it('deve formatar valores negativos com o sinal antes do símbolo', () => {
    const pipe = TestBed.inject(CurrencyPipe);

    expect(normalize(pipe.transform(-246.16))).toBe('-R$ 246,16');
  });
});
