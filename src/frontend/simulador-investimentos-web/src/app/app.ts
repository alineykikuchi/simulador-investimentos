import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdbCalculator } from './features/cdb-calculator/cdb-calculator';
import { CDB_PARAMETERS_COPY } from './features/cdb-calculator/cdb-parameters';

/**
 * Shell da página (spec §5.1): `<header>` de marca e `<main>` responsivo que hospeda a
 * calculadora. Não contém estado nem regra — só a moldura.
 */
@Component({
  selector: 'app-root',
  imports: [CdbCalculator],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly headerSummary = CDB_PARAMETERS_COPY.headerSummary;
}
