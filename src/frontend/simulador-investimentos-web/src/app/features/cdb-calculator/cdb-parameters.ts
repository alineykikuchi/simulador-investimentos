/**
 * Copy de exibição dos parâmetros fixos desta versão (CDI e taxa do banco).
 *
 * A fonte de verdade é `CdbRates` no `appsettings.json` da API. O contrato atual não devolve
 * esses valores, então o front só mostra o texto abaixo — nenhuma taxa é calculada aqui.
 * Se as taxas mudarem na API, este é o único arquivo a atualizar no front.
 */
export const CDB_PARAMETERS_COPY: {
  readonly headerSummary: string;
  readonly effectiveRateLabel: string;
  readonly effectiveRateValue: string;
  readonly footnote: string;
} = {
  headerSummary: 'Parâmetros vigentes · CDI 0,9% a.m. · Banco paga 108% do CDI',
  effectiveRateLabel: 'Taxa efetiva mensal (CDI 0,9% × 108%)',
  effectiveRateValue: '0,972% a.m.',
  footnote:
    'Cálculo mês a mês: VF = VI × [1 + (CDI × TB)], reaplicando o resultado de cada mês no ' +
    'seguinte. O imposto incide apenas sobre o rendimento. Valores de CDI e TB fixados nesta ' +
    'versão.',
};
