import { Directive, ElementRef, Renderer2, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Formatador pt-BR criado uma única vez: `10000` → `10.000,00`. Não depende de `registerLocaleData`. */
const brlFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Converte o texto digitado em número (view → model). Regra determinística: ponto é sempre
 * separador de milhar (removido), a primeira vírgula é o decimal, casas além da segunda são
 * descartadas. Vazio, inválido ou sem dígitos → `null`.
 */
export function parseBrl(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, '').replace(/\./g, '');
  const commaIndex = cleaned.indexOf(',');
  const integerDigits = commaIndex === -1 ? cleaned : cleaned.slice(0, commaIndex);
  const fractionDigits =
    commaIndex === -1
      ? ''
      : cleaned
          .slice(commaIndex + 1)
          .replace(/,/g, '')
          .slice(0, 2);

  if (integerDigits === '' && fractionDigits === '') {
    return null;
  }

  return Number(`${integerDigits || '0'}.${fractionDigits || '0'}`);
}

/** Formata o número em pt-BR com duas casas (model → view). `null` → `''`. */
export function formatBrl(value: number | null): string {
  return value === null ? '' : brlFormatter.format(value);
}

/**
 * `ControlValueAccessor` para valor monetário em `input type="text"`: a view mostra
 * `10.000,00` e o `FormControl` continua `number | null`. Não valida nada — a validação
 * de formato é do formulário.
 */
@Directive({
  selector: 'input[appBrlAmount]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BrlAmountInput), multi: true },
  ],
  host: {
    '(input)': 'handleInput()',
    '(blur)': 'handleBlur()',
  },
})
export class BrlAmountInput implements ControlValueAccessor {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.setViewValue(formatBrl(value));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.element.nativeElement, 'disabled', isDisabled);
  }

  protected handleInput(): void {
    this.onChange(parseBrl(this.element.nativeElement.value));
  }

  protected handleBlur(): void {
    this.setViewValue(formatBrl(parseBrl(this.element.nativeElement.value)));
    this.onTouched();
  }

  private setViewValue(text: string): void {
    this.renderer.setProperty(this.element.nativeElement, 'value', text);
  }
}
