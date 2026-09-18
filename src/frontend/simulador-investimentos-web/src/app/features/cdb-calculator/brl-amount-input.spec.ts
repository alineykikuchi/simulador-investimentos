import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BrlAmountInput, formatBrl, parseBrl } from './brl-amount-input';

describe('parseBrl', () => {
  it.each([
    ['10.000,00', 10000],
    ['1.234,5', 1234.5],
    ['10.000', 10000],
    ['12,349', 12.34],
    ['R$ 1.500,75', 1500.75],
    [',5', 0.5],
    ['1,2,3', 1.23],
  ])('deve converter %j em %d', (text, expected) => {
    expect(parseBrl(text)).toBe(expected);
  });

  it.each([['abc'], [''], ['.,'], ['R$ ']])('deve devolver null para %j', (text) => {
    expect(parseBrl(text)).toBeNull();
  });
});

describe('formatBrl', () => {
  it('deve formatar 10000 como 10.000,00', () => {
    expect(formatBrl(10000)).toBe('10.000,00');
  });

  it('deve formatar decimais com duas casas', () => {
    expect(formatBrl(1234.5)).toBe('1.234,50');
  });

  it('deve devolver texto vazio para null', () => {
    expect(formatBrl(null)).toBe('');
  });
});

@Component({
  imports: [ReactiveFormsModule, BrlAmountInput],
  template: `<input type="text" appBrlAmount [formControl]="amount" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly amount = new FormControl<number | null>(null);
}

describe('BrlAmountInput', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    input = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  function type(text: string): void {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  it('deve atualizar o control com o número ao digitar', () => {
    type('10.000,00');

    expect(host.amount.value).toBe(10000);
    expect(input.value).toBe('10.000,00');
  });

  it('deve deixar o control null ao digitar texto inválido', () => {
    type('abc');

    expect(host.amount.value).toBeNull();
  });

  it('deve formatar a view e marcar touched no blur', () => {
    type('1234,5');
    expect(host.amount.touched).toBe(false);

    input.dispatchEvent(new Event('blur'));

    expect(input.value).toBe('1.234,50');
    expect(host.amount.value).toBe(1234.5);
    expect(host.amount.touched).toBe(true);
  });

  it('deve formatar a view quando o valor vem do control', () => {
    host.amount.setValue(2500);

    expect(input.value).toBe('2.500,00');
  });

  it('deve limpar a view no reset()', () => {
    type('10.000,00');

    host.amount.reset();

    expect(input.value).toBe('');
    expect(host.amount.value).toBeNull();
  });

  it('deve desabilitar o input no disable()', () => {
    host.amount.disable();

    expect(input.disabled).toBe(true);

    host.amount.enable();

    expect(input.disabled).toBe(false);
  });
});
