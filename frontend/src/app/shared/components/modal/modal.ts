import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <!-- Overlay -->
      <div class="fixed inset-0 z-40 bg-black/50 transition-opacity" (click)="onBackdropClick()"></div>

      <!-- Caixa de diálogo -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div [class]="'relative bg-white rounded-2xl shadow-xl w-full transition-all ' + sizeClass">

          <!-- Cabeçalho -->
          @if (title) {
            <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
                @if (subtitle) {
                  <p class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
                }
              </div>
              <button type="button" (click)="close()"
                      class="text-gray-400 hover:text-gray-600 rounded-lg p-1.5
                             hover:bg-gray-100 transition ml-4 shrink-0">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                </svg>
              </button>
            </div>
          }

          <!-- Corpo -->
          <div class="px-6 py-5">
            <ng-content />
          </div>

          <!-- Rodapé (slot opcional) -->
          <div class="px-6 pb-5">
            <ng-content select="[modal-footer]" />
          </div>

        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: ModalSize = 'md';
  @Input() closeOnBackdrop = true;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen) this.close();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  get sizeClass(): string {
    const map: Record<ModalSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };
    return map[this.size];
  }
}
