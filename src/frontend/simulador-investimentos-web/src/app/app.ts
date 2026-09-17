import { Component, signal } from '@angular/core';
import { CdbCalculator } from './features/cdb-calculator/cdb-calculator';

@Component({
  selector: 'app-root',
  imports: [CdbCalculator],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Simulador de Investimentos — CDB');
}
