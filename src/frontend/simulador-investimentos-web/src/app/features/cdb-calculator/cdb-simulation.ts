import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CalculateCdbRequest, CalculateCdbResponse } from '../../core/models/cdb-calculation';
import { ProblemDetails } from '../../core/models/problem-details';
import { CdbApi } from '../../core/services/cdb-api';
import { CdbSimulationResult } from './cdb-simulation-result';

const CONNECTION_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Tente novamente.';
const GENERIC_ERROR_MESSAGE = 'Não foi possível calcular agora. Tente novamente em instantes.';

/** Desfecho de uma simulação: sucesso com resultado ou falha com mensagem para o usuário. */
type SimulationOutcome =
  | { readonly ok: true; readonly result: CdbSimulationResult }
  | { readonly ok: false; readonly message: string };

/**
 * Estado da simulação de CDB (spec D4). Guarda a última requisição, chama a API e expõe
 * `result`, `errorMessage` e `loading` como signals somente leitura.
 *
 * Provido pelo container da feature (`providers: [CdbSimulation]`), não na raiz.
 */
@Injectable()
export class CdbSimulation {
  private readonly api = inject(CdbApi);
  private readonly request = signal<CalculateCdbRequest | undefined>(undefined);

  /**
   * O erro vira valor (união discriminada) em vez de ir para o canal de erro do resource:
   * ler `value()` de um resource em erro lança, e `HttpErrorResponse` chegaria embrulhado.
   */
  private readonly outcome = rxResource<SimulationOutcome, CalculateCdbRequest | undefined>({
    params: () => this.request(),
    stream: ({ params }) =>
      this.api.calculate(params).pipe(
        map((response) => ({ ok: true as const, result: toResult(params, response) })),
        catchError((error: unknown) => of({ ok: false as const, message: toErrorMessage(error) })),
      ),
  });

  readonly loading: Signal<boolean> = this.outcome.isLoading;

  readonly result: Signal<CdbSimulationResult | null> = computed(() => {
    const outcome = this.outcome.value();
    return outcome?.ok ? outcome.result : null;
  });

  readonly errorMessage: Signal<string | null> = computed(() => {
    const outcome = this.outcome.value();
    return outcome && !outcome.ok ? outcome.message : null;
  });

  simulate(request: CalculateCdbRequest): void {
    this.request.set({ ...request });
  }

  reset(): void {
    this.request.set(undefined);
  }
}

/**
 * Monta o resultado exibido pela tela. `initialAmount`/`months` vêm da requisição para que o
 * resumo continue correto mesmo se o usuário editar os campos depois de calcular.
 */
function toResult(
  request: CalculateCdbRequest,
  response: CalculateCdbResponse,
): CdbSimulationResult {
  return {
    initialAmount: request.initialAmount,
    months: request.months,
    grossAmount: response.grossAmount,
    netAmount: response.netAmount,
    incomeTaxRate: response.incomeTaxRate,
    incomeTaxAmount: response.incomeTaxAmount,
    grossYield: response.grossAmount - request.initialAmount,
    netYield: response.netAmount - request.initialAmount,
  };
}

/**
 * Converte a falha da API na mensagem mostrada ao usuário:
 * `ProblemDetails.detail` → primeira mensagem de `errors` → sem conexão → genérica.
 */
export function toErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return GENERIC_ERROR_MESSAGE;
  }

  const problem = toProblemDetails(error.error);
  if (problem?.detail) {
    return problem.detail;
  }

  const firstValidationMessage = Object.values(problem?.errors ?? {})
    .flat()
    .find((message) => message.length > 0);
  if (firstValidationMessage) {
    return firstValidationMessage;
  }

  return error.status === 0 ? CONNECTION_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE;
}

function toProblemDetails(body: unknown): ProblemDetails | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const { detail, errors } = body as Record<string, unknown>;
  return {
    detail: typeof detail === 'string' ? detail : undefined,
    errors: isValidationErrors(errors) ? errors : undefined,
  };
}

function isValidationErrors(value: unknown): value is Record<string, string[]> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(
      (messages) => Array.isArray(messages) && messages.every((m) => typeof m === 'string'),
    )
  );
}
