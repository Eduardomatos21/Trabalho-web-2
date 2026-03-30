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
  modalResgatarAberto = false;
  valorOrcadoMock = 249.9;

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.buscarSolicitacao(codigo);
  }

  get valorOrcadoFormatado(): string {
    const valor = this.valorOrcadoMock;
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

  resgatarServico(): void {
    if (!this.solicitacao) return;

    const eventoResgatar = this.criarEventoHistorico('Orçamento aprovado pelo cliente');
    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      estado: 'APROVADA',
      historico: [...historicoAtual, eventoResgatar],
    };

    this.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;

    this.modalResgatarAberto = true;
  }

  logout(): void {
    this.authService.logout();
  }

  private buscarSolicitacao(codigo: string | null): SolicitacaoCliente {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    if (navState && navState.codigo === codigo) return navState;

    const encontrada = this.clienteStorageService.buscarPorCodigo(codigo);
    if (encontrada) return encontrada;

    return {
      codigo: codigo ?? 'N/A',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ORÇADA',
    };
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
