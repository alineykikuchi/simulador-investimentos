import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { CdbForm } from './cdb-form/cdb-form';
import { CdbResult } from './cdb-result/cdb-result';
import {
  CdbResultPlaceholder,
  CdbResultPlaceholderState,
} from './cdb-result-placeholder/cdb-result-placeholder';
import { CdbSimulation } from './cdb-simulation';

/** Abaixo de `desktop` (1024 px) a página fica em coluna única e o resultado sai da dobra. */
const SINGLE_COLUMN_QUERY = '(max-width: 1023.98px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Container da tela: provê `CdbSimulation`, monta o grid de duas colunas e liga
 * formulário ↔ simulação ↔ painel de resultado. Não tem estado próprio além do derivado.
 */
@Component({
  selector: 'app-cdb-calculator',
  imports: [CdbForm, CdbResult, CdbResultPlaceholder],
  providers: [CdbSimulation],
  templateUrl: './cdb-calculator.html',
  styleUrl: './cdb-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdbCalculator {
  protected readonly simulation = inject(CdbSimulation);
  private readonly resultSection = viewChild<ElementRef<HTMLElement>>('resultSection');

  protected readonly placeholderState = computed<CdbResultPlaceholderState>(() => {
    if (this.simulation.loading()) {
      return 'loading';
    }
    return this.simulation.errorMessage() === null ? 'empty' : 'error';
  });

  constructor() {
    // Único `effect` do container: sincroniza com o DOM fora do template (rolagem). Em coluna
    // única o painel fica abaixo do formulário; ao concluir o cálculo, traz o desfecho para a
    // área visível sem mover o foco — o anúncio fica por conta do `aria-live`.
    effect(() => {
      const hasOutcome =
        this.simulation.result() !== null || this.simulation.errorMessage() !== null;
      const section = this.resultSection()?.nativeElement;
      if (hasOutcome && section && isSingleColumnLayout()) {
        scrollToSection(section);
      }
    });
  }
}

/** `matchMedia` não existe no jsdom; sem ele, considera layout de duas colunas (não rola). */
function matchesMedia(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

function isSingleColumnLayout(): boolean {
  return matchesMedia(SINGLE_COLUMN_QUERY);
}

/** `scrollIntoView` também não existe no jsdom. */
function scrollToSection(section: HTMLElement): void {
  if (typeof section.scrollIntoView !== 'function') {
    return;
  }
  section.scrollIntoView({
    behavior: matchesMedia(REDUCED_MOTION_QUERY) ? 'auto' : 'smooth',
    block: 'start',
  });
}
