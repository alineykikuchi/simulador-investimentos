import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideBrazilianLocale } from '../../../core/i18n/locale';
import { CdbSimulationResult } from '../cdb-simulation-result';
import { CdbResult } from './cdb-result';

const RESULT: CdbSimulationResult = {
  initialAmount: 10000,
  months: 12,
  grossAmount: 11230.82,
  netAmount: 10984.66,
  incomeTaxRate: 0.2,
  incomeTaxAmount: 246.16,
  grossYield: 1230.82,
  netYield: 984.66,
};

// O `currency` pt-BR usa espaço não separável (U+00A0); quebras de linha do template viram espaço.
const normalize = (text: string | null | undefined): string =>
  (text ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

describe('CdbResult', () => {
  let fixture: ComponentFixture<CdbResult>;
  let element: HTMLElement;

  const textOf = (selector: string): string =>
    normalize(element.querySelector(selector)?.textContent);

  const textsOf = (selector: string): string[] =>
    Array.from(element.querySelectorAll(selector), (node) => normalize(node.textContent));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdbResult],
      providers: [...provideBrazilianLocale()],
    }).compileComponents();

    fixture = TestBed.createComponent(CdbResult);
    fixture.componentRef.setInput('result', RESULT);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('deve exibir o resultado bruto e líquido após o cálculo', () => {
    expect(textsOf('.card__value')).toEqual(['R$ 11.230,82', 'R$ 10.984,66']);
  });

  it('deve exibir o resumo com o valor investido e o prazo', () => {
    expect(textOf('.summary')).toBe('R$ 10.000,00 por 12 meses');
  });

  it('deve exibir os rendimentos com sinal + e o imposto com sinal −', () => {
    expect(textsOf('.gain')).toEqual(['+ R$ 1.230,82', '+ R$ 984,66']);
    expect(textOf('.tax')).toBe('− R$ 246,16');
  });

  it('deve exibir o chip da faixa de imposto a partir da alíquota devolvida pela API', () => {
    expect(textOf('.chip')).toBe('7 a 12 meses · 20%');
  });

  it('deve exibir a taxa efetiva e a nota de rodapé vindas da copy centralizada', () => {
    expect(textsOf('.row dt')).toContain('Taxa efetiva mensal (CDI 0,9% × 108%)');
    expect(textsOf('.row dd')).toContain('0,972% a.m.');
    expect(textOf('.footnote')).toContain('Cálculo mês a mês');
  });

  it('deve ter o título do painel com id titulo-resultado', () => {
    const title = element.querySelector('h2#titulo-resultado');

    expect(title?.textContent?.trim()).toBe('Resultado da simulação');
  });
});
