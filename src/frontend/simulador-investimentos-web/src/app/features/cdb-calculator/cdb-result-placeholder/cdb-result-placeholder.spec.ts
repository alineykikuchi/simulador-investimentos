import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CdbResultPlaceholder, CdbResultPlaceholderState } from './cdb-result-placeholder';

@Component({
  imports: [CdbResultPlaceholder],
  template: `<app-cdb-result-placeholder [state]="state()" [message]="message()" />`,
})
class Host {
  readonly state = signal<CdbResultPlaceholderState>('empty');
  readonly message = signal<string | null>(null);
}

describe('CdbResultPlaceholder', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  function render(state: CdbResultPlaceholderState, message: string | null = null) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.state.set(state);
    fixture.componentInstance.message.set(message);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return {
      title: element.querySelector('h2#titulo-resultado'),
      text: element.querySelector('p')?.textContent?.trim() ?? null,
      hasErrorClass: element.querySelector('.placeholder--error') !== null,
    };
  }

  it('deve mostrar o título e o texto do estado vazio, sem "ao lado"', () => {
    const { title, text } = render('empty');

    expect(title?.textContent?.trim()).toBe('Nenhum cálculo ainda');
    expect(text).toBe(
      'Preencha o valor e o prazo e clique em "Calcular investimento" para ver o resultado.',
    );
  });

  it('deve mostrar só o título "Calculando…" no estado carregando', () => {
    const { title, text } = render('loading');

    expect(title?.textContent?.trim()).toBe('Calculando…');
    expect(text).toBeNull();
  });

  it('deve mostrar a mensagem recebida no estado de erro', () => {
    const { title, text, hasErrorClass } = render('error', 'O prazo deve ser maior que 1 mês.');

    expect(title?.textContent?.trim()).toBe('Não foi possível calcular');
    expect(text).toBe('O prazo deve ser maior que 1 mês.');
    expect(hasErrorClass).toBe(true);
  });

  it('deve mostrar um texto genérico no erro sem mensagem', () => {
    const { text } = render('error');

    expect(text).toBe('Tente novamente em instantes.');
  });

  it('deve manter o h2#titulo-resultado nos três estados', () => {
    for (const state of ['empty', 'loading', 'error'] as const) {
      expect(render(state).title, `estado ${state}`).not.toBeNull();
    }
  });

  it('deve usar o ícone de alerta só no estado de erro', () => {
    expect(render('empty').hasErrorClass).toBe(false);
    expect(render('loading').hasErrorClass).toBe(false);
  });
});
