import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CdbCalculator } from './cdb-calculator';

describe('CdbCalculator', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdbCalculator],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(CdbCalculator);

    expect(fixture.componentInstance).toBeTruthy();
  });

  // TODO (stretch): cobrir validação do formulário e a chamada à Web API.
});
