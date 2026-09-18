import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CalculateCdbRequest, CalculateCdbResponse } from '../../core/models/cdb-calculation';
import { CdbSimulation, toErrorMessage } from './cdb-simulation';

const CALCULATIONS_URL = '/api/v1/cdb/calculations';

const REQUEST: CalculateCdbRequest = { initialAmount: 10_000, months: 12 };

const RESPONSE: CalculateCdbResponse = {
  grossAmount: 11_231.89,
  netAmount: 10_985.51,
  incomeTaxRate: 0.2,
  incomeTaxAmount: 246.38,
};

describe('CdbSimulation', () => {
  let simulation: CdbSimulation;
  let httpTesting: HttpTestingController;

  const whenStable = () => TestBed.inject(ApplicationRef).whenStable();

  const simulateAndFlush = async (
    request: CalculateCdbRequest,
    body: CalculateCdbResponse | Record<string, unknown>,
    status = 200,
  ) => {
    simulation.simulate(request);
    TestBed.tick();
    httpTesting.expectOne(CALCULATIONS_URL).flush(body, { status, statusText: String(status) });
    await whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CdbSimulation, provideHttpClient(), provideHttpClientTesting()],
    });
    simulation = TestBed.inject(CdbSimulation);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve começar sem resultado, sem erro e sem carregamento', () => {
    expect(simulation.result()).toBeNull();
    expect(simulation.errorMessage()).toBeNull();
    expect(simulation.loading()).toBe(false);
  });

  it('deve fazer POST em /api/v1/cdb/calculations com o corpo da requisição', () => {
    simulation.simulate(REQUEST);
    TestBed.tick();

    const req = httpTesting.expectOne(CALCULATIONS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(REQUEST);
    req.flush(RESPONSE);
  });

  it('deve preencher o resultado com os rendimentos derivados após resposta 200', async () => {
    await simulateAndFlush(REQUEST, RESPONSE);

    const result = simulation.result();
    expect(result).toMatchObject({
      initialAmount: 10_000,
      months: 12,
      grossAmount: 11_231.89,
      netAmount: 10_985.51,
      incomeTaxRate: 0.2,
      incomeTaxAmount: 246.38,
    });
    // Derivação sem arredondar (regra do projeto): o pipe `currency` absorve o ruído de ponto flutuante.
    expect(result?.grossYield).toBeCloseTo(1_231.89, 2);
    expect(result?.netYield).toBeCloseTo(985.51, 2);
    expect(simulation.errorMessage()).toBeNull();
    expect(simulation.loading()).toBe(false);
  });

  it('deve preencher a mensagem de erro com o detail e zerar o resultado após resposta 400', async () => {
    await simulateAndFlush(REQUEST, RESPONSE);
    expect(simulation.result()).not.toBeNull();

    await simulateAndFlush(
      { initialAmount: 10_000, months: 1 },
      { status: 400, title: 'Bad Request', detail: 'O prazo deve ser maior que 1 mês.' },
      400,
    );

    expect(simulation.errorMessage()).toBe('O prazo deve ser maior que 1 mês.');
    expect(simulation.result()).toBeNull();
    expect(simulation.loading()).toBe(false);
  });

  it('deve ligar o carregamento durante a requisição e desligar ao receber a resposta', async () => {
    simulation.simulate(REQUEST);
    TestBed.tick();

    expect(simulation.loading()).toBe(true);

    httpTesting.expectOne(CALCULATIONS_URL).flush(RESPONSE);
    await whenStable();

    expect(simulation.loading()).toBe(false);
  });

  it('deve limpar resultado e erro ao chamar reset', async () => {
    await simulateAndFlush(REQUEST, RESPONSE);
    expect(simulation.result()).not.toBeNull();

    simulation.reset();
    TestBed.tick();
    await whenStable();

    expect(simulation.result()).toBeNull();
    expect(simulation.errorMessage()).toBeNull();
    expect(simulation.loading()).toBe(false);
    httpTesting.expectNone(CALCULATIONS_URL);
  });

  it('deve substituir o resultado anterior em uma segunda simulação', async () => {
    await simulateAndFlush(REQUEST, RESPONSE);

    await simulateAndFlush(
      { initialAmount: 5_000, months: 6 },
      { grossAmount: 5_300, netAmount: 5_232.5, incomeTaxRate: 0.225, incomeTaxAmount: 67.5 },
    );

    expect(simulation.result()).toEqual({
      initialAmount: 5_000,
      months: 6,
      grossAmount: 5_300,
      netAmount: 5_232.5,
      incomeTaxRate: 0.225,
      incomeTaxAmount: 67.5,
      grossYield: 300,
      netYield: 232.5,
    });
  });

  it('deve cancelar a requisição em andamento quando uma nova simulação é disparada', () => {
    simulation.simulate(REQUEST);
    TestBed.tick();
    const first = httpTesting.expectOne(CALCULATIONS_URL);

    simulation.simulate({ initialAmount: 5_000, months: 6 });
    TestBed.tick();
    const second = httpTesting.expectOne(CALCULATIONS_URL);

    expect(first.cancelled).toBe(true);
    expect(second.request.body).toEqual({ initialAmount: 5_000, months: 6 });
    second.flush(RESPONSE);
  });
});

describe('toErrorMessage', () => {
  const httpError = (status: number, error: unknown) =>
    new HttpErrorResponse({ status, error, url: CALCULATIONS_URL });

  it('deve usar o detail do ProblemDetails quando presente', () => {
    const error = httpError(400, { status: 400, detail: 'O valor deve ser positivo.' });

    expect(toErrorMessage(error)).toBe('O valor deve ser positivo.');
  });

  it('deve usar a primeira mensagem de errors quando não há detail', () => {
    const error = httpError(400, {
      status: 400,
      errors: { months: ['O prazo deve ser maior que 1 mês.'], initialAmount: ['Inválido.'] },
    });

    expect(toErrorMessage(error)).toBe('O prazo deve ser maior que 1 mês.');
  });

  it('deve informar falha de conexão quando o status é 0', () => {
    const error = httpError(0, new ProgressEvent('error'));

    expect(toErrorMessage(error)).toBe('Não foi possível conectar ao servidor. Tente novamente.');
  });

  it('deve usar a mensagem genérica para os demais erros', () => {
    expect(toErrorMessage(httpError(500, 'Internal Server Error'))).toBe(
      'Não foi possível calcular agora. Tente novamente em instantes.',
    );
    expect(toErrorMessage(new Error('boom'))).toBe(
      'Não foi possível calcular agora. Tente novamente em instantes.',
    );
  });
});
