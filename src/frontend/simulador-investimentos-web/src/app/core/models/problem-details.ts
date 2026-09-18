/** Corpo de erro da API (RFC 9457 `application/problem+json`), incluindo erros de validação. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
