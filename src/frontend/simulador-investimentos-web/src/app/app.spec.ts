import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { CDB_PARAMETERS_COPY } from './features/cdb-calculator/cdb-parameters';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('deve criar a aplicação', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve exibir a marca no cabeçalho', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const header = (fixture.nativeElement as HTMLElement).querySelector('header');

    expect(header?.textContent).toContain('Simulador de CDB');
  });

  it('deve exibir os parâmetros fixos no cabeçalho', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const header = (fixture.nativeElement as HTMLElement).querySelector('header');

    expect(header?.textContent).toContain(CDB_PARAMETERS_COPY.headerSummary);
  });
});
