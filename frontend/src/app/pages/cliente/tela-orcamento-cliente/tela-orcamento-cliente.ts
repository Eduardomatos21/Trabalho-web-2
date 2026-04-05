import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoHistoricoUtil } from '../../../shared/utils';

@Component({
  selector: 'app-tela-orcamento-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-orcamento-cliente.html',
  styleUrl: './tela-orcamento-cliente.css',
})
export class TelaOrcamentoCliente implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private clienteStorageService: ClienteStorageService,
  ) {}

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações', route: '/cliente' }
  ];

  solicitacao?: SolicitacaoCliente;
  modalAprovacaoAberto = false;
  modalRejeicaoAberto = false;
  modalRejeicaoConfirmadaAberto = false;
  motivoRejeicao = '';

  private readonly valoresMockSolicitacoesIniciais: Record<string, number> = {
    'SOL-1042': 249.9,
    'SOL-1044': 249.9,
    'SOL-1034': 249.9,
  };

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.buscarSolicitacao(codigo);
  }

  get valorOrcadoFormatado(): string {
    const valor = this.valorOrcado;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  aprovarServico(): void {
    if (!this.solicitacao) return;

    const eventoAprovacao = this.criarEventoHistorico('Orçamento aprovado pelo cliente');
    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      valorOrcamento: this.valorOrcado,
      estado: 'APROVADA',
      historico: [...historicoAtual, eventoAprovacao],
    };

    this.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;

    this.modalAprovacaoAberto = true;
  }

  confirmarAprovacao(): void {
    this.modalAprovacaoAberto = false;
    this.router.navigate(['/cliente']);
  }

  rejeitarServico(): void {
    this.modalRejeicaoAberto = true;
  }

  confirmarRejeicao(): void {
    if (!this.solicitacao) return;

    const motivo = this.motivoRejeicao.trim();
    const descricaoEvento = motivo
      ? `Orçamento rejeitado pelo cliente. Motivo: ${motivo}`
      : 'Orçamento rejeitado pelo cliente';
    const eventoRejeicao = this.criarEventoHistorico(descricaoEvento);
    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      valorOrcamento: this.valorOrcado,
      estado: 'REJEITADA',
      motivoRejeicao: motivo || undefined,
      historico: [...historicoAtual, eventoRejeicao],
    };

    this.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;

    this.modalRejeicaoAberto = false;
    this.modalRejeicaoConfirmadaAberto = true;
  }

  fecharModalRejeicao(): void {
    this.modalRejeicaoAberto = false;
    this.motivoRejeicao = '';
  }

  confirmarMensagemRejeicao(): void {
    this.modalRejeicaoConfirmadaAberto = false;
    this.motivoRejeicao = '';
    this.router.navigate(['/cliente']);
  }

  logout(): void {
    this.authService.logout();
  }

  private buscarSolicitacao(codigo: string | null): SolicitacaoCliente {
    const usuarioLogado = this.authService.getUsuarioLogado();
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    const encontrada = this.clienteStorageService.buscarPorCodigoDoCliente(codigo, usuarioLogado?.email);
    if (encontrada) {
      if (navState && navState.codigo === codigo) {
        return { ...navState, ...encontrada };
      }

      return encontrada;
    }

    if (navState && navState.codigo === codigo) return navState;

    return {
      codigo: codigo ?? 'N/A',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ORÇADA',
    };
  }

  private get valorOrcado(): number {
    if (typeof this.solicitacao?.valorOrcamento === 'number' && this.solicitacao.valorOrcamento > 0) {
      return this.solicitacao.valorOrcamento;
    }

    const codigo = this.solicitacao?.codigo;
    if (codigo && this.valoresMockSolicitacoesIniciais[codigo]) {
      return this.valoresMockSolicitacoesIniciais[codigo];
    }

    return 0;
  }

  private salvarSolicitacao(solicitacao: SolicitacaoCliente): void {
    this.clienteStorageService.salvarSolicitacao(solicitacao);
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
