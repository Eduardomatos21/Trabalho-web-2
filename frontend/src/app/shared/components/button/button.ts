import { Component, EventEmitter, Input, Output } from '@angular/core';

export type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
export type BtnSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  host: { style: 'display: contents' },
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="clicked.emit()"
      [class]="classes">
      @if (loading) {
        <svg class="animate-spin h-4 w-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: BtnVariant = 'primary';
  @Input() size: BtnSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<void>();

  get classes(): string {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<BtnVariant, string> = {
      primary:   'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-indigo-500',
      secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-indigo-400',
      danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500',
      ghost:     'bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-400',
      success:   'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-green-500',
      warning:   'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus:ring-amber-400',
    };

    const sizes: Record<BtnSize, string> = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2.5',
      lg: 'text-base px-6 py-3',
    };

    const width = this.fullWidth ? 'w-full' : '';
    return [base, variants[this.variant], sizes[this.size], width].join(' ').trim();
  }
}
