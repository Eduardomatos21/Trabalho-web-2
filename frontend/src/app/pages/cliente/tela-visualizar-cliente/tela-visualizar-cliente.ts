import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
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
  valorOrcadoMock = 249.9;

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.carregarSolicitacao(codigo);
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
        queryParams: { solicitacao: this.solicitacao.codigo },
        state: { solicitacaoSelecionada: this.solicitacao },
      });
      return;
    }

    if (this.solicitacao.estado === 'ARRUMADA') {
      this.router.navigate(['/cliente/pagamento'], {
        queryParams: { solicitacao: this.solicitacao.codigo },
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
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.valorOrcadoMock);
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

  private carregarSolicitacao(codigo: string | null): SolicitacaoComHistorico {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    const salva = this.clienteStorageService.buscarPorCodigo(codigo);
    const base = (navState && navState.codigo === codigo ? navState : undefined) ?? salva;

    const solicitacao: SolicitacaoCliente = base ?? {
      codigo: codigo ?? 'N/A',
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
}
