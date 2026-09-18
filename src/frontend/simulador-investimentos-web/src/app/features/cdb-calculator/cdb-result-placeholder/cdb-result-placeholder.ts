import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CdbResultPlaceholderState = 'empty' | 'loading' | 'error';

interface PlaceholderCopy {
  readonly title: string;
  readonly text: string;
}

/** Textos da spec §6.4. O estado vazio não diz "ao lado": em coluna única o formulário fica acima. */
const COPY: Record<CdbResultPlaceholderState, PlaceholderCopy> = {
  empty: {
    title: 'Nenhum cálculo ainda',
    text: 'Preencha o valor e o prazo e clique em "Calcular investimento" para ver o resultado.',
  },
  loading: { title: 'Calculando…', text: '' },
  error: { title: 'Não foi possível calcular', text: 'Tente novamente em instantes.' },
};

/**
 * Painel de resultado sem resultado (spec §5.9 e §6.4): a mesma moldura tracejada para os
 * estados vazio, carregando e erro; só mudam ícone, título e texto. `aria-live`/`aria-busy`
 * ficam na `section` do container, que aponta para `h2#titulo-resultado`.
 */
@Component({
  selector: 'app-cdb-result-placeholder',
  templateUrl: './cdb-result-placeholder.html',
  styleUrl: './cdb-result-placeholder.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdbResultPlaceholder {
  readonly state = input.required<CdbResultPlaceholderState>();
  readonly message = input<string | null>(null);

  protected readonly title = computed(() => COPY[this.state()].title);

  /** No erro, a mensagem recebida (`ProblemDetails.detail`) tem precedência sobre o texto genérico. */
  protected readonly text = computed(() => {
    const state = this.state();
    return state === 'error' ? (this.message() ?? COPY.error.text) : COPY[state].text;
  });

  protected readonly isError = computed(() => this.state() === 'error');
}
