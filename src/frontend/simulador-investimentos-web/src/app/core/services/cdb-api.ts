import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CalculateCdbRequest, CalculateCdbResponse } from '../models/cdb-calculation';

/**
 * Único ponto de acesso à Web API. Em desenvolvimento, `/api` é redirecionado
 * para a WebApi pelo proxy do Angular CLI (proxy.conf.json).
 */
@Injectable({ providedIn: 'root' })
export class CdbApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/cdb';

  calculate(request: CalculateCdbRequest): Observable<CalculateCdbResponse> {
    return this.http.post<CalculateCdbResponse>(`${this.baseUrl}/calculations`, request);
  }
}
