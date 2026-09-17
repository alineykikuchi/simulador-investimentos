import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdbApi } from '../../core/services/cdb-api';
import { CalculateCdbResponse } from '../../core/models/cdb-calculation';

/**
 * Tela do item 1 da especificação: informar valor e prazo, solicitar o cálculo
 * e apresentar o resultado bruto e líquido.
 *
 * ESQUELETO: o formulário e a exibição estão declarados; o envio (`submit`) ainda
 * precisa ser implementado junto com o endpoint da Web API.
 */
@Component({
  selector: 'app-cdb-calculator',
  imports: [ReactiveFormsModule],
  templateUrl: './cdb-calculator.html',
  styleUrl: './cdb-calculator.scss',
})
export class CdbCalculator {
  private readonly api = inject(CdbApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly result = signal<CalculateCdbResponse | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    initialAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    months: [null as number | null, [Validators.required, Validators.min(2)]],
  });

  protected submit(): void {
    // TODO: validar o formulário, chamar `this.api.calculate(...)` e preencher
    // `result` / `errorMessage` / `loading`.
    void this.api;
  }
}
