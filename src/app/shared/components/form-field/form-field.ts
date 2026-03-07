import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="w-full">
      @if (label) {
        <label [for]="fieldId" class="block text-sm font-medium text-gray-700 mb-1">
          {{ label }}
          @if (required) {
            <span class="text-red-500 ml-0.5">*</span>
          }
        </label>
      }

      <!-- O <input>, <select> ou <textarea> é inserido aqui -->
      <ng-content />

      @if (error) {
        <p class="text-red-500 text-xs mt-1 flex items-center gap-1">
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"/>
          </svg>
          {{ error }}
        </p>
      } @else if (hint) {
        <p class="text-gray-400 text-xs mt-1">{{ hint }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  @Input() label   = '';
  @Input() fieldId = '';
  @Input() required = false;
  @Input() error   = '';
  @Input() hint    = '';
}
