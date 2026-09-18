import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalculateCdbRequest } from '../../../core/models/cdb-calculation';
import { BrlAmountInput } from '../brl-amount-input';
import { FieldMessage } from '../field-message/field-message';

/** Textos de ajuda e de erro por campo (spec §5.4). */
export const CDB_FORM_COPY = {
  initialAmount: {
    hint: 'Somente valores positivos.',
    error: 'Informe um valor maior que zero.',
  },
  months: {
    hint: 'Mínimo de 2 meses.',
    error: 'Informe um prazo inteiro de pelo menos 2 meses.',
  },
} as const;

type CdbFormField = keyof typeof CDB_FORM_COPY;

/**
 * Cartão do formulário: valida o formato dos campos e emite a requisição pronta.
 * Não conhece service nem HTTP — quem escuta `simulate` decide o que fazer.
 */
@Component({
  selector: 'app-cdb-form',
  imports: [ReactiveFormsModule, BrlAmountInput, FieldMessage],
  templateUrl: './cdb-form.html',
  styleUrl: './cdb-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdbForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly amountInput = viewChild.required<ElementRef<HTMLInputElement>>('amountInput');
  private readonly monthsInput = viewChild.required<ElementRef<HTMLInputElement>>('monthsInput');

  readonly loading = input(false);
  readonly simulate = output<CalculateCdbRequest>();
  readonly invalidSubmit = output<void>();
  readonly cleared = output<void>();

  protected readonly copy = CDB_FORM_COPY;

  protected readonly form = this.formBuilder.nonNullable.group({
    initialAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    months: [
      null as number | null,
      [Validators.required, Validators.min(2), Validators.pattern(/^\d+$/)],
    ],
  });

  /** Mensagem de erro do campo, ou `null` enquanto o erro não deve aparecer. */
  protected errorFor(field: CdbFormField): string | null {
    const control = this.form.controls[field];
    return control.invalid && control.touched ? CDB_FORM_COPY[field].error : null;
  }

  protected submit(): void {
    const request = this.toRequest();
    if (request === null) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      this.invalidSubmit.emit();
      return;
    }
    this.simulate.emit(request);
  }

  protected clear(): void {
    this.form.reset();
    this.cleared.emit();
    this.amountInput().nativeElement.focus();
  }

  private toRequest(): CalculateCdbRequest | null {
    if (this.form.invalid) {
      return null;
    }
    const { initialAmount, months } = this.form.getRawValue();
    return initialAmount !== null && months !== null ? { initialAmount, months } : null;
  }

  private focusFirstInvalid(): void {
    const inputs: readonly [CdbFormField, ElementRef<HTMLInputElement>][] = [
      ['initialAmount', this.amountInput()],
      ['months', this.monthsInput()],
    ];
    const first = inputs.find(([field]) => this.form.controls[field].invalid);
    first?.[1].nativeElement.focus();
  }
}
