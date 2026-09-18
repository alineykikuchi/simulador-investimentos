import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideBrazilianLocale } from '../../core/i18n/locale';
import { CalculateCdbResponse } from '../../core/models/cdb-calculation';
import { CdbCalculator } from './cdb-calculator';

const CALCULATIONS_URL = '/api/cdb/calculations';

/** Massa de 10.000 por 12 meses (spec §10). */
const RESPONSE: CalculateCdbResponse = {
  grossAmount: 11_230.82,
  netAmount: 10_984.66,
  incomeTaxRate: 0.2,
  incomeTaxAmount: 246.16,
};

const SINGLE_COLUMN_QUERY = '(max-width: 1023.98px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// O `currency` pt-BR usa espaço não separável (U+00A0); quebras de linha do template viram espaço.
const normalize = (text: string | null | undefined): string =>
  (text ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('CdbCalculator', () => {
  let fixture: ComponentFixture<CdbCalculator>;
  let host: HTMLElement;
  let httpTesting: HttpTestingController;

  const resultSection = (): HTMLElement => host.querySelector('section[aria-live]')!;
  const resultText = (): string => normalize(resultSection().textContent);
  const resultTitle = (): string => normalize(host.querySelector('#titulo-resultado')?.textContent);
  const amountInput = (): HTMLInputElement => host.querySelector('#valor')!;
  const monthsInput = (): HTMLInputElement => host.querySelector('#prazo')!;

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  // `whenStable` só resolve depois da resposta HTTP; `detectChanges` basta para a requisição sair.
  function submitForm(): void {
    host.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function submitValidRequest(): void {
    typeInto(amountInput(), '10.000,00');
    typeInto(monthsInput(), '12');
    submitForm();
  }

  async function flushSuccess(): Promise<void> {
    httpTesting.expectOne(CALCULATIONS_URL).flush(RESPONSE);
    await fixture.whenStable();
  }

  async function flushBadRequest(detail: string): Promise<void> {
    httpTesting
      .expectOne(CALCULATIONS_URL)
      .flush({ detail }, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdbCalculator],
      providers: [provideHttpClient(), provideHttpClientTesting(), ...provideBrazilianLocale()],
    }).compileComponents();

    fixture = TestBed.createComponent(CdbCalculator);
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve criar o componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve manter a região aria-live no DOM antes de qualquer cálculo', () => {
    const section = resultSection();

    expect(section.getAttribute('aria-live')).toBe('polite');
    expect(section.getAttribute('aria-labelledby')).toBe('titulo-resultado');
    expect(section.hasAttribute('aria-busy')).toBe(false);
    expect(section.querySelectorAll('#titulo-resultado')).toHaveLength(1);
    expect(resultTitle()).toBe('Nenhum cálculo ainda');
  });

  it('deve marcar a região como ocupada e mostrar "Calculando…" enquanto a API responde', async () => {
    submitValidRequest();

    expect(resultSection().getAttribute('aria-busy')).toBe('true');
    expect(resultTitle()).toBe('Calculando…');

    await flushSuccess();

    expect(resultSection().hasAttribute('aria-busy')).toBe(false);
  });

  it('deve exibir o resultado bruto e líquido após o cálculo', async () => {
    submitValidRequest();
    await flushSuccess();

    expect(host.querySelector('app-cdb-result')).not.toBeNull();
    expect(host.querySelector('app-cdb-result-placeholder')).toBeNull();
    expect(resultText()).toContain('R$ 11.230,82');
    expect(resultText()).toContain('R$ 10.984,66');
    expect(resultSection().querySelectorAll('#titulo-resultado')).toHaveLength(1);
  });

  it('deve exibir a mensagem de erro devolvida pela API quando ela recusa o cálculo', async () => {
    submitValidRequest();
    await flushBadRequest('O prazo deve ser maior que 1 mês.');

    expect(host.querySelector('app-cdb-result')).toBeNull();
    expect(resultTitle()).toBe('Não foi possível calcular');
    expect(resultText()).toContain('O prazo deve ser maior que 1 mês.');
  });

  it('deve voltar ao estado vazio quando um envio inválido acontece depois de um sucesso', async () => {
    submitValidRequest();
    await flushSuccess();

    typeInto(monthsInput(), '');
    submitForm();
    await fixture.whenStable();

    expect(host.querySelector('app-cdb-result')).toBeNull();
    expect(resultTitle()).toBe('Nenhum cálculo ainda');
  });

  it('deve voltar ao estado vazio ao clicar em "Limpar campos"', async () => {
    submitValidRequest();
    await flushSuccess();

    host.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    await fixture.whenStable();

    expect(host.querySelector('app-cdb-result')).toBeNull();
    expect(resultTitle()).toBe('Nenhum cálculo ainda');
  });

  describe('rolagem até o resultado', () => {
    const scrollIntoView = vi.fn<(options?: ScrollIntoViewOptions) => void>();
    let matches: Record<string, boolean>;

    beforeEach(() => {
      matches = {};
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: (query: string): Pick<MediaQueryList, 'matches'> => ({
          matches: matches[query] ?? false,
        }),
      });
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: scrollIntoView,
      });
    });

    afterEach(() => {
      scrollIntoView.mockReset();
      delete (window as { matchMedia?: unknown }).matchMedia;
      delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    });

    it('deve rolar suavemente até o resultado em coluna única quando o cálculo termina', async () => {
      matches = { [SINGLE_COLUMN_QUERY]: true };

      submitValidRequest();
      expect(scrollIntoView).not.toHaveBeenCalled();

      await flushSuccess();

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('deve rolar sem animação quando o usuário prefere menos movimento', async () => {
      matches = { [SINGLE_COLUMN_QUERY]: true, [REDUCED_MOTION_QUERY]: true };

      submitValidRequest();
      await flushBadRequest('Valor inválido.');

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    });

    it('não deve rolar quando o layout está em duas colunas', async () => {
      matches = { [SINGLE_COLUMN_QUERY]: false };

      submitValidRequest();
      await flushSuccess();

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
