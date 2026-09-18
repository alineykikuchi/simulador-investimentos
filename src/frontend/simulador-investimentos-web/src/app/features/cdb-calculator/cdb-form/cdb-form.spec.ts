import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { CdbForm, CDB_FORM_COPY } from './cdb-form';

describe('CdbForm', () => {
  let fixture: ComponentFixture<CdbForm>;
  let component: CdbForm;
  let host: HTMLElement;

  const amountInput = (): HTMLInputElement => host.querySelector('#valor')!;
  const monthsInput = (): HTMLInputElement => host.querySelector('#prazo')!;
  const submitButton = (): HTMLButtonElement => host.querySelector('button[type="submit"]')!;
  const clearButton = (): HTMLButtonElement => host.querySelector('button[type="button"]')!;
  const messageText = (id: string): string => host.querySelector(`#${id}`)!.textContent!.trim();

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submitForm(): void {
    host.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function fillValid(): void {
    typeInto(amountInput(), '10.000,00');
    typeInto(monthsInput(), '12');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CdbForm] }).compileComponents();
    fixture = TestBed.createComponent(CdbForm);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('deve mostrar as ajudas dos dois campos sem marcar erro antes de qualquer envio', () => {
    expect(messageText('valor-mensagem')).toBe(CDB_FORM_COPY.initialAmount.hint);
    expect(messageText('prazo-mensagem')).toBe(CDB_FORM_COPY.months.hint);
    expect(amountInput().getAttribute('aria-invalid')).toBeNull();
    expect(monthsInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('deve mostrar as duas mensagens de erro, marcar aria-invalid e emitir invalidSubmit no envio vazio', () => {
    const onSimulate = vi.spyOn(component.simulate, 'emit');
    const onInvalid = vi.spyOn(component.invalidSubmit, 'emit');

    submitForm();

    expect(messageText('valor-mensagem')).toBe(CDB_FORM_COPY.initialAmount.error);
    expect(messageText('prazo-mensagem')).toBe(CDB_FORM_COPY.months.error);
    expect(amountInput().getAttribute('aria-invalid')).toBe('true');
    expect(monthsInput().getAttribute('aria-invalid')).toBe('true');
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(onSimulate).not.toHaveBeenCalled();
  });

  it('deve focar o primeiro campo inválido no envio', () => {
    submitForm();
    expect(document.activeElement).toBe(amountInput());

    typeInto(amountInput(), '100,00');
    submitForm();
    expect(document.activeElement).toBe(monthsInput());
  });

  it('deve recusar prazo 1 (menor que o mínimo)', () => {
    typeInto(amountInput(), '100,00');
    typeInto(monthsInput(), '1');

    submitForm();

    expect(monthsInput().getAttribute('aria-invalid')).toBe('true');
    expect(messageText('prazo-mensagem')).toBe(CDB_FORM_COPY.months.error);
    expect(amountInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('deve recusar prazo 2,5 (não inteiro)', () => {
    typeInto(amountInput(), '100,00');
    typeInto(monthsInput(), '2.5');

    submitForm();

    expect(monthsInput().getAttribute('aria-invalid')).toBe('true');
    expect(messageText('prazo-mensagem')).toBe(CDB_FORM_COPY.months.error);
  });

  it('deve recusar valor 0', () => {
    typeInto(amountInput(), '0,00');
    typeInto(monthsInput(), '12');

    submitForm();

    expect(amountInput().getAttribute('aria-invalid')).toBe('true');
    expect(messageText('valor-mensagem')).toBe(CDB_FORM_COPY.initialAmount.error);
    expect(monthsInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('deve emitir simulate com os números estreitados no envio válido', () => {
    const onSimulate = vi.spyOn(component.simulate, 'emit');
    const onInvalid = vi.spyOn(component.invalidSubmit, 'emit');
    fillValid();

    submitForm();

    expect(onSimulate).toHaveBeenCalledWith({ initialAmount: 10000, months: 12 });
    expect(onInvalid).not.toHaveBeenCalled();
    expect(amountInput().getAttribute('aria-invalid')).toBeNull();
    expect(monthsInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('deve limpar os campos, emitir cleared e devolver o foco ao valor', () => {
    const onCleared = vi.spyOn(component.cleared, 'emit');
    fillValid();
    submitForm();

    clearButton().click();
    fixture.detectChanges();

    expect(onCleared).toHaveBeenCalledTimes(1);
    expect(amountInput().value).toBe('');
    expect(monthsInput().value).toBe('');
    expect(messageText('valor-mensagem')).toBe(CDB_FORM_COPY.initialAmount.hint);
    expect(messageText('prazo-mensagem')).toBe(CDB_FORM_COPY.months.hint);
    expect(document.activeElement).toBe(amountInput());
  });

  it('deve limpar as mensagens de erro ao limpar depois de um envio inválido', () => {
    submitForm();
    expect(amountInput().getAttribute('aria-invalid')).toBe('true');

    clearButton().click();
    fixture.detectChanges();

    expect(amountInput().getAttribute('aria-invalid')).toBeNull();
    expect(monthsInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('deve desabilitar o botão primário e trocar o texto enquanto carrega', () => {
    expect(submitButton().disabled).toBe(false);
    expect(submitButton().textContent!.trim()).toBe('Calcular investimento');

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent!.trim()).toBe('Calculando…');
  });

  it('não deve desabilitar o botão primário por formulário inválido', () => {
    submitForm();
    expect(submitButton().disabled).toBe(false);
  });

  it('deve apontar aria-describedby de cada input para um id existente', () => {
    for (const input of [amountInput(), monthsInput()]) {
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(host.querySelector(`#${describedBy}`)).not.toBeNull();
    }
  });

  it('deve ligar cada label ao seu input e esconder prefixo e sufixo do leitor de tela', () => {
    expect(host.querySelector('label[for="valor"]')).not.toBeNull();
    expect(host.querySelector('label[for="prazo"]')).not.toBeNull();
    expect(host.querySelector('section')!.getAttribute('aria-labelledby')).toBe('titulo-form');
    expect(host.querySelector('h1#titulo-form')).not.toBeNull();

    const hidden = Array.from(host.querySelectorAll('[aria-hidden="true"]')).map((el) =>
      el.textContent!.trim(),
    );
    expect(hidden).toEqual(expect.arrayContaining(['R$', 'meses']));
  });
});
