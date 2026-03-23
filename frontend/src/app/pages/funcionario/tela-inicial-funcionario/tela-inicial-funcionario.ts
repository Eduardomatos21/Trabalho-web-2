import { Component } from '@angular/core';
import { Router } from '@angular/router';
import type { SidebarItem } from '../../../shared';
import { SidebarComponent } from '../../../shared';
import { TelaInicialCliente } from '../../cliente/tela-inicial-cliente';

type SolicitacaoFuncionario = {
  dataHora: string;
  cliente: string;
  produto: string;
  codigo: string;
};

@Component({
  selector: 'app-tela-inicial-funcionario',
  standalone: true,
  imports: [SidebarComponent, TelaInicialCliente],
  templateUrl: './tela-inicial-funcionario.html',
  styleUrl: './tela-inicial-funcionario.css',
})
export class TelaInicialFuncionario {
  constructor(private router: Router) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações' },
    { label: 'Relatórios' },
  ];

  readonly solicitacoes: SolicitacaoFuncionario[] = [
    {
      dataHora: '16/03/2026 10:20',
      cliente: 'João da Silva',
      produto: 'Notebook Dell Inspiron 15',
      codigo: 'SOL-1042',
    },
    {
      dataHora: '16/03/2026 11:05',
      cliente: 'Maria Oliveira',
      produto: 'Monitor LG UltraWide 29',
      codigo: 'SOL-1034',
    },
    {
      dataHora: '16/03/2026 11:45',
      cliente: 'Carlos Pereira',
      produto: 'Teclado Mecânico Gamer RGB',
      codigo: 'SOL-1018',
    },
  ];

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  efetuarOrcamento(codigo: string): void {
    // TODO: implementar navegação ou ação para efetuar orçamento
    console.log('Efetuar orçamento para:', codigo);
  }
}
