import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoUiUtil } from '../../../shared/utils';

type TipoFiltro = 'HOJE' | 'PERIODO' | 'TODAS';
type OrdemDataHora = 'asc' | 'desc';

@Component({
  selector: 'app-tela-solicitacao-funcionario',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, ButtonComponent],
  templateUrl: './tela-solicitacao-funcionario.html',
  styleUrl: './tela-solicitacao-funcionario.css',
})
export class TelaSolicitacaoFuncionario implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private clienteStorageService: ClienteStorageService,
  ) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario' },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes', active: true },
    { label: 'Relatórios' },
  ];

  tipoFiltro: TipoFiltro = 'TODAS';
  ordemDataHora: OrdemDataHora = 'asc';
  periodoInicio = '';
  periodoFim = '';
  solicitacoes: SolicitacaoCliente[] = [];

  private readonly solicitacoesBase: SolicitacaoCliente[] = [
    {
      codigo: 'SOL-1042',
      nomeCliente: 'João da Silva',
      emailCliente: 'joao.silva@email.com',
      dataHora: '20/03/2026 14:30',
      descricaoEquipamento: 'Notebook Dell Inspiron 15 com bateria viciada e falha de boot',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1044',
      nomeCliente: 'Maria Oliveira',
      emailCliente: 'maria.oliveira@email.com',
      dataHora: '20/03/2026 14:30',
      descricaoEquipamento: 'Monitor LG UltraWide 29',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1034',
      nomeCliente: 'Carlos Pereira',
      emailCliente: 'carlos.pereira@email.com',
      dataHora: '17/03/2026 09:10',
      descricaoEquipamento: 'Monitor LG UltraWide 29',
      estado: 'APROVADA',
    },
    {
      codigo: 'SOL-1018',
      nomeCliente: 'Fernanda Rocha',
      emailCliente: 'fernanda.rocha@email.com',
      dataHora: '08/03/2026 11:42',
      descricaoEquipamento: 'Teclado Mecânico RGB',
      estado: 'REJEITADA',
    },
    {
      codigo: 'SOL-1051',
      nomeCliente: 'Ricardo Mendes',
      emailCliente: 'ricardo.mendes@email.com',
      dataHora: '21/03/2026 16:05',
      descricaoEquipamento: 'Impressora HP LaserJet Pro MFP com atolamento recorrente',
      estado: 'ARRUMADA',
    },
    {
      codigo: 'SOL-0997',
      nomeCliente: 'Patricia Lima',
      emailCliente: 'patricia.lima@email.com',
      dataHora: '03/03/2026 08:25',
      descricaoEquipamento: 'Mouse sem fio Logitech MX Master',
      estado: 'ABERTA',
    },
  ];

  ngOnInit(): void {
    this.solicitacoes = this.clienteStorageService.mesclarSolicitacoes(
      this.solicitacoesBase,
      this.clienteStorageService.carregarSolicitacoes(),
    );
  }

  get solicitacoesFiltradasOrdenadas(): SolicitacaoCliente[] {
    return this.solicitacoes
      .filter((solicitacao) => this.podeVisualizarSolicitacao(solicitacao))
      .filter((solicitacao) => this.aplicaFiltroData(solicitacao))
      .sort((a, b) => {
        const diff = DateFormatUtil.parseDataHora(a.dataHora) - DateFormatUtil.parseDataHora(b.dataHora);
        return this.ordemDataHora === 'asc' ? diff : -diff;
      });
  }

  alternarOrdemDataHora(): void {
    this.ordemDataHora = this.ordemDataHora === 'asc' ? 'desc' : 'asc';
  }

  setFiltro(tipo: TipoFiltro): void {
    this.tipoFiltro = tipo;
    if (tipo !== 'PERIODO') {
      this.periodoInicio = '';
      this.periodoFim = '';
    }
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    return SolicitacaoUiUtil.estadoClasse(estado);
  }

  nomeEstadoExibicao(estado: EstadoSolicitacao): string {
    return estado;
  }

  acaoLabel(estado: EstadoSolicitacao): string | null {
    if (estado === 'ABERTA') return 'Efetuar Orçamento';
    if (estado === 'APROVADA' || estado === 'REDIRECIONADA') return 'Efetuar Manutenção';
    if (estado === 'PAGA') return 'Finalizar Solicitação';
    return null;
  }

  executarAcao(solicitacao: SolicitacaoCliente): void {
    if (solicitacao.estado === 'ABERTA') {
      this.router.navigate(['/funcionario/orcamento'], {
        queryParams: { solicitacao: solicitacao.codigo },
        state: { solicitacaoSelecionada: solicitacao },
      });
      return;
    }

    if (solicitacao.estado === 'APROVADA' || solicitacao.estado === 'REDIRECIONADA') {
      console.log('RF014 pendente para solicitação:', solicitacao.codigo);
      return;
    }

    if (solicitacao.estado === 'PAGA') {
      console.log('RF016 pendente para solicitação:', solicitacao.codigo);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  private podeVisualizarSolicitacao(solicitacao: SolicitacaoCliente): boolean {
    if (solicitacao.estado !== 'REDIRECIONADA') return true;

    const destino = solicitacao.funcionarioDestinoRedirecionamento?.trim().toLowerCase();
    if (!destino) return false;

    return destino === this.funcionarioLogadoNome.trim().toLowerCase();
  }

  private aplicaFiltroData(solicitacao: SolicitacaoCliente): boolean {
    const dataAbertura = this.getDataAbertura(solicitacao);

    if (this.tipoFiltro === 'TODAS') return true;

    if (this.tipoFiltro === 'HOJE') {
      const hoje = new Date();
      return (
        dataAbertura.getFullYear() === hoje.getFullYear() &&
        dataAbertura.getMonth() === hoje.getMonth() &&
        dataAbertura.getDate() === hoje.getDate()
      );
    }

    if (!this.periodoInicio || !this.periodoFim) return true;

    const inicio = new Date(`${this.periodoInicio}T00:00:00`);
    const fim = new Date(`${this.periodoFim}T23:59:59`);

    return dataAbertura >= inicio && dataAbertura <= fim;
  }

  private get funcionarioLogadoNome(): string {
    const usuario = this.authService.getUsuarioLogado();
    return usuario?.perfil === 'funcionario' ? usuario.nome : '';
  }

  private getDataAbertura(solicitacao: SolicitacaoCliente): Date {
    const [data] = solicitacao.dataHora.split(' ');
    const [dia, mes, ano] = data.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
  }
}
