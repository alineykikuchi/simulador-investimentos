import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CDB_PARAMETERS_COPY } from '../cdb-parameters';
import { CdbSimulationResult } from '../cdb-simulation-result';
import { IncomeTaxBracketPipe } from '../income-tax-bracket-pipe';

/**
 * Painel de resultado no estado de sucesso (spec §5.7 e §6.3). Só apresentação: recebe o
 * resultado já calculado pela API por `input` e não conhece service nem HTTP.
 */
@Component({
  selector: 'app-cdb-result',
  imports: [CurrencyPipe, IncomeTaxBracketPipe],
  templateUrl: './cdb-result.html',
  styleUrl: './cdb-result.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdbResult {
  readonly result = input.required<CdbSimulationResult>();

  protected readonly copy = CDB_PARAMETERS_COPY;
}
