import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoHistoricoUtil, SolicitacaoUiUtil } from '../../../shared/utils';

type SolicitacaoComHistorico = SolicitacaoCliente & {
  historico: HistoricoAtualizacao[];
};

@Component({
  selector: 'app-tela-visualizar-cliente',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-visualizar-cliente.html',
  styleUrl: './tela-visualizar-cliente.css',
})
export class TelaVisualizarCliente implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private clienteStorageService: ClienteStorageService,
  ) {}

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações', route: '/cliente', active: true },
  ];

  solicitacao?: SolicitacaoComHistorico;
  modalResgatarAberto = false;
  modalResgateSucessoAberto = false;

  private readonly valoresMockSolicitacoesIniciais: Record<string, number> = {
    'SOL-1042': 249.9,
    'SOL-1044': 249.9,
    'SOL-1051': 249.9,
    'SOL-1034': 235.9,
  };

  ngOnInit(): void {
    this.solicitacao = this.carregarSolicitacao();
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    return SolicitacaoUiUtil.estadoClasse(estado);
  }

  labelAcao(estado: EstadoSolicitacao): string | null {
    return SolicitacaoUiUtil.labelAcao(estado);
  }

  executarAcao(): void {
    if (!this.solicitacao) return;

    if (this.solicitacao.estado === 'ORÇADA') {
      this.router.navigate(['/cliente/orcamento'], {
        state: { solicitacaoSelecionada: this.solicitacao },
      });
      return;
    }

    if (this.solicitacao.estado === 'ARRUMADA') {
      this.router.navigate(['/cliente/pagamento'], {
        state: { solicitacaoSelecionada: this.solicitacao },
      });
      return;
    }

    if (this.solicitacao.estado === 'REJEITADA') {
      this.modalResgatarAberto = true;
      return;
    }

    this.router.navigate(['/cliente']);
  }

  voltar(): void {
    this.router.navigate(['/cliente']);
  }

  closeModal(): void {
    this.modalResgatarAberto = false;
  }

  closeModalSucesso(): void {
    this.modalResgateSucessoAberto = false;
  }

  get valorOrcadoFormatado(): string {
    const valor = this.valorOrcadoParaSolicitacao(this.solicitacao);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  resgatarServico(): void {
    if (!this.solicitacao) return;

    const eventoResgatar = this.criarEventoHistorico('Orçamento resgatado pelo cliente');
    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoComHistorico = {
      ...this.solicitacao,
      estado: 'APROVADA',
      historico: [...historicoAtual, eventoResgatar],
    };

    this.clienteStorageService.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;
    this.modalResgatarAberto = false;
    this.modalResgateSucessoAberto = true;
  }

  logout(): void {
    this.authService.logout();
  }

  private carregarSolicitacao(): SolicitacaoComHistorico {
    const usuarioLogado = this.authService.getUsuarioLogado();
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    const salva = navState?.codigo
      ? this.clienteStorageService.buscarPorCodigoDoCliente(navState.codigo, usuarioLogado?.email)
      : undefined;
    const base = navState ?? salva;

    const solicitacao: SolicitacaoCliente = base ?? {
      codigo: 'N/A',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ABERTA',
    };

    const historicoPersistido = solicitacao.historico;
    const historico =
      historicoPersistido && historicoPersistido.length > 0
        ? historicoPersistido
        : SolicitacaoHistoricoUtil.getHistoricoBase(solicitacao.codigo, solicitacao.dataHora);

    return {
      ...solicitacao,
      historico,
    };
  }

  private criarEventoHistorico(descricao: string): HistoricoAtualizacao {
    const usuario = this.authService.getUsuarioLogado();

    return {
      dataHora: DateFormatUtil.formatarDataHora(new Date()),
      funcionario: usuario?.perfil === 'funcionario' ? usuario.nome : '',
      descricao,
    };
  }


    private valorOrcadoParaSolicitacao(solicitacao?: SolicitacaoCliente | null): number {
    if (!solicitacao) return 0;

    if (typeof solicitacao.valorOrcamento === 'number' && solicitacao.valorOrcamento > 0) {
      return solicitacao.valorOrcamento;
    }

    const valorMock = this.valoresMockSolicitacoesIniciais[solicitacao.codigo];
    return typeof valorMock === 'number' ? valorMock : 0;
  }
}
