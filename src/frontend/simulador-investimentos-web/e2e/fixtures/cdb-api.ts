import type { Page, Route } from '@playwright/test';

/**
 * Mock explícito de `POST /api/v1/cdb/calculations` para os specs que não precisam do backend.
 * Cada teste diz qual resposta quer; o fixture só intercepta a rota e registra os corpos enviados,
 * para o spec afirmar o contrato (ou a ausência de requisição).
 */

export const CDB_API_ROUTE = '**/api/v1/cdb/calculations';

/** Espelhos locais do contrato HTTP (não importa de `src/app` para o e2e ficar isolado). */
export interface CalculateCdbRequestMock {
  initialAmount: number;
  months: number;
}

export interface CalculateCdbResponseMock {
  grossAmount: number;
  netAmount: number;
  incomeTaxRate: number;
  incomeTaxAmount: number;
}

export interface CdbVector {
  /** Texto digitado no campo de valor (máscara pt-BR). */
  readonly typedAmount: string;
  readonly request: CalculateCdbRequestMock;
  readonly response: CalculateCdbResponseMock;
}

/** Vetores da spec da API (faixa 7–12 meses → 20 %). São os mesmos números que a API real devolve. */
export const CDB_VECTORS = {
  tenThousandFor12Months: {
    typedAmount: '10.000,00',
    request: { initialAmount: 10_000, months: 12 },
    response: {
      grossAmount: 11_230.82,
      netAmount: 10_984.66,
      incomeTaxRate: 0.2,
      incomeTaxAmount: 246.16,
    },
  },
  fortyFiveThousandFor10Months: {
    typedAmount: '45.000,00',
    request: { initialAmount: 45_000, months: 10 },
    response: {
      grossAmount: 49_570.36,
      netAmount: 48_656.29,
      incomeTaxRate: 0.2,
      incomeTaxAmount: 914.07,
    },
  },
} as const satisfies Record<string, CdbVector>;

export interface MockedResponse {
  readonly status?: number;
  readonly contentType?: string;
  readonly body: unknown;
}

export interface CdbApiMock {
  /** Corpos das requisições recebidas, na ordem. */
  readonly requests: CalculateCdbRequestMock[];
  /** Libera a resposta quando o mock foi criado com `hold: true`. */
  release(): void;
}

/** Resposta 200 com o vetor informado. */
export function okResponse(vector: CdbVector): MockedResponse {
  return { status: 200, contentType: 'application/json', body: vector.response };
}

/** Resposta 400 `application/problem+json` com `detail`, como o `DomainExceptionHandler` da API. */
export function problemResponse(detail: string, status = 400): MockedResponse {
  return {
    status,
    contentType: 'application/problem+json',
    body: {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'Bad Request',
      status,
      detail,
    },
  };
}

/**
 * Intercepta a rota de cálculo e responde sempre com `response`. Com `hold: true` a resposta
 * fica presa até `release()`, para observar o estado "carregando".
 */
export async function mockCdbApi(
  page: Page,
  response: MockedResponse,
  options: { hold?: boolean } = {},
): Promise<CdbApiMock> {
  const requests: CalculateCdbRequestMock[] = [];
  let release: () => void = () => undefined;
  const gate = options.hold
    ? new Promise<void>((resolve) => {
        release = resolve;
      })
    : Promise.resolve();

  await page.route(CDB_API_ROUTE, async (route: Route) => {
    requests.push(route.request().postDataJSON() as CalculateCdbRequestMock);
    await gate;
    await route.fulfill({
      status: response.status ?? 200,
      contentType: response.contentType ?? 'application/json',
      body: JSON.stringify(response.body),
    });
  });

  return { requests, release: () => release() };
}

/** Derruba a conexão: o `HttpClient` recebe status 0, como quando a API está fora do ar. */
export async function mockCdbApiOffline(page: Page): Promise<CdbApiMock> {
  const requests: CalculateCdbRequestMock[] = [];
  await page.route(CDB_API_ROUTE, async (route: Route) => {
    requests.push(route.request().postDataJSON() as CalculateCdbRequestMock);
    await route.abort('connectionrefused');
  });
  return { requests, release: () => undefined };
}
