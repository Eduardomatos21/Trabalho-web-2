import { Component } from '@angular/core';
import { AuthService } from '../../../services';
import { EstadoSolicitacao } from '../../../shared/models';
import { SidebarComponent, type SidebarItem } from '../../../shared';

type SolicitacaoFuncionario = {
  dataHora: string;
  cliente: string;
  produto: string;
  codigo: string;
  estado: EstadoSolicitacao;
};

@Component({
  selector: 'app-tela-inicial-funcionario',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './tela-inicial-funcionario.html',
  styleUrl: './tela-inicial-funcionario.css',
})
export class TelaInicialFuncionario {
  constructor(private authService: AuthService) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações' },
    { label: 'Relatórios' },
  ];

  readonly solicitacoes: SolicitacaoFuncionario[] = [
    {
      dataHora: '20/03/2026 14:30',
      cliente: 'João da Silva',
      produto: 'Notebook Dell Inspiron 15 com bateria viciada e falha de boot',
      codigo: 'SOL-1042',
      estado: 'ORÇADA',
    },
    {
      dataHora: '20/03/2026 14:30',
      cliente: 'Maria Oliveira',
      produto: 'Monitor LG UltraWide 29',
      codigo: 'SOL-1044',
      estado: 'ORÇADA',
    },
    {
      dataHora: '17/03/2026 09:10',
      cliente: 'Carlos Pereira',
      produto: 'Monitor LG UltraWide 29',
      codigo: 'SOL-1034',
      estado: 'APROVADA',
    },
    {
      dataHora: '08/03/2026 11:42',
      cliente: 'Fernanda Rocha',
      produto: 'Teclado Mecânico RGB',
      codigo: 'SOL-1018',
      estado: 'REJEITADA',
    },
    {
      dataHora: '21/03/2026 16:05',
      cliente: 'Ricardo Mendes',
      produto: 'Impressora HP LaserJet Pro MFP com atolamento recorrente',
      codigo: 'SOL-1051',
      estado: 'ARRUMADA',
    },
    {
      dataHora: '03/03/2026 08:25',
      cliente: 'Patricia Lima',
      produto: 'Mouse sem fio Logitech MX Master',
      codigo: 'SOL-0997',
      estado: 'ABERTA',
    },
  ];

  get solicitacoesAbertas(): SolicitacaoFuncionario[] {
    return this.solicitacoes.filter((sol) => sol.estado === 'ABERTA');
  }

  descricaoLimitada(produto: string): string {
    return produto.length <= 30 ? produto : `${produto.slice(0, 30)}...`;
  }

  logout() {
    this.authService.logout();
  }

  efetuarOrcamento(codigo: string): void {
    // TODO: implementar navegação ou ação para efetuar orçamento
    console.log('Efetuar orçamento para:', codigo);
  }
}
