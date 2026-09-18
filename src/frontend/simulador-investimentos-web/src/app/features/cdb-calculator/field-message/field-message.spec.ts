import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldMessage } from './field-message';

@Component({
  imports: [FieldMessage],
  template: `<app-field-message
    messageId="valor-ajuda"
    hint="Mínimo de R$ 1,00"
    [error]="error()"
  />`,
})
class Host {
  readonly error = signal<string | null>(null);
}

describe('FieldMessage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  function render(error: string | null) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.error.set(error);
    fixture.detectChanges();
    const element = (fixture.nativeElement as HTMLElement).querySelector('p');
    if (!element) {
      throw new Error('FieldMessage não renderizou o <p>');
    }
    return { fixture, element };
  }

  it('deve mostrar o texto de ajuda quando não há erro', () => {
    const { element } = render(null);

    expect(element.textContent?.trim()).toBe('Mínimo de R$ 1,00');
    expect(element.classList.contains('message--error')).toBe(false);
    expect(element.querySelector('svg')).toBeNull();
  });

  it('deve mostrar a mensagem de erro (e não a ajuda) quando há erro', () => {
    const { element } = render('Informe um valor');

    expect(element.textContent).toContain('Informe um valor');
    expect(element.textContent).not.toContain('Mínimo de R$ 1,00');
    expect(element.classList.contains('message--error')).toBe(true);
  });

  it('deve manter o mesmo id com ajuda e com erro', () => {
    const { fixture, element } = render(null);
    expect(element.id).toBe('valor-ajuda');

    fixture.componentInstance.error.set('Informe um valor');
    fixture.detectChanges();

    const afterError = (fixture.nativeElement as HTMLElement).querySelector('p');
    expect(afterError).toBe(element);
    expect(afterError?.id).toBe('valor-ajuda');
  });

  it('deve esconder o ícone de erro da árvore de acessibilidade', () => {
    const { element } = render('Informe um valor');

    const icon = element.querySelector('svg');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('focusable')).toBe('false');
  });

  it('não deve usar role="alert"', () => {
    const { element } = render('Informe um valor');

    expect(element.getAttribute('role')).toBeNull();
  });
});
