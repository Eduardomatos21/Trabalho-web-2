import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type SidebarItem = {
  label: string;
  route?: string;
  active?: boolean;
};

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  host: { style: 'display: contents' },
  imports: [RouterLink],
  template: `
    <aside class="hidden lg:flex w-72 bg-linear-to-b from-teal-700 to-cyan-700 text-white flex-col self-stretch">
      <div class="p-6 border-b border-teal-600/70">
        <h1 class="text-2xl font-black">{{ systemTitle }}</h1>
        <p class="text-xs text-cyan-100 mt-1">{{ panelLabel }}</p>
      </div>

      <nav class="flex-1 p-4 space-y-2 text-sm">
        @for (item of menuItems; track item.label) {
          @if (item.route) {
            <a [routerLink]="item.route" [class]="itemClasses(item)">{{ item.label }}</a>
          } @else {
            <span [class]="itemClasses(item)">{{ item.label }}</span>
          }
        }
      </nav>

      <footer class="mt-auto px-4 pt-2 pb-1 text-center border-t border-teal-600/70 text-xs text-cyan-100">
        <small>© 2026 - Sistema de Manutenção</small>
      </footer>

      <div class="p-4 border-t border-teal-600/70">
        <button
          type="button"
          (click)="logoutClicked.emit()"
          class="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500 transition rounded-xl px-4 py-3 text-sm font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
          </svg>
          {{ logoutLabel }}
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input({ required: true }) panelLabel = '';
  @Input() menuItems: SidebarItem[] = [];
  @Input() systemTitle = 'Sistema';
  @Input() logoutLabel = 'Sair';
  @Output() logoutClicked = new EventEmitter<void>();

  itemClasses(item: SidebarItem): string {
    const base = 'block px-4 py-3 rounded-xl';
    return item.active
      ? `${base} bg-white/15 font-semibold`
      : `${base} hover:bg-white/10 transition`;
  }
}
