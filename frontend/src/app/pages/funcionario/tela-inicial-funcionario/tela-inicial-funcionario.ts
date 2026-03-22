import { Component } from '@angular/core';
import { Router } from '@angular/router';
import type { SidebarItem } from '../../../shared';
import { SidebarComponent } from '../../../shared';

@Component({
  selector: 'app-tela-inicial-funcionario',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './tela-inicial-funcionario.html',
  styleUrl: './tela-inicial-funcionario.css',
})
export class TelaInicialFuncionario {
  constructor(private router: Router) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Efetuar orçamento' },
    { label: 'Visualização de solicitações' },
    { label: 'Relatórios' },
  ];

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
