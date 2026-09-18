import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Mensagem de campo (spec §5.6): um único `<p>` com `id` estável cujo conteúdo alterna entre
 * o texto de ajuda e a mensagem de erro. Como o `id` nunca some, o `aria-describedby` do input
 * sempre aponta para um elemento existente. Sem `role="alert"` (spec §8): o foco vai para o
 * campo inválido e o leitor de tela lê a descrição — evita anúncio duplicado.
 */
@Component({
  selector: 'app-field-message',
  templateUrl: './field-message.html',
  styleUrl: './field-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldMessage {
  readonly messageId = input.required<string>();
  readonly hint = input.required<string>();
  readonly error = input<string | null>(null);
}
