import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SolicitacaoService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { SolicitacaoCliente } from '../../../shared/models';

@Component({
  selector: 'app-tela-orcamento-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-orcamento-cliente.html',
  styleUrl: './tela-orcamento-cliente.css',
})
export class TelaOrcamentoCliente implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private solicitacaoService: SolicitacaoService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações', route: '/cliente', active: true }
  ];

  solicitacao?: SolicitacaoCliente;
  erroCarregamento = '';
  modalAprovacaoAberto = false;
  modalRejeicaoAberto = false;
  modalRejeicaoConfirmadaAberto = false;
  motivoRejeicao = '';
  private codigoSolicitacao: string | null = null;
  private aprovacaoEmAndamento = false;
  private rejeicaoEmAndamento = false;

  ngOnInit(): void {
    const solicitacaoNavegada = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    if (solicitacaoNavegada) {
      this.solicitacao = solicitacaoNavegada;
    }

    const codigo = solicitacaoNavegada?.codigo ?? null;
    this.codigoSolicitacao = codigo;
    this.carregarSolicitacao(codigo);
  }

  get valorOrcadoFormatado(): string {
    const valor = this.valorOrcado;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  get solicitacaoView(): SolicitacaoCliente {
    return this.solicitacao ?? {
      codigo: '-',
      dataHora: '-',
      nomeCliente: '-',
      emailCliente: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ABERTA',
      valorOrcamento: 0,
    };
  }

  aprovarServico(): void {
    if (this.aprovacaoEmAndamento) return;

    const codigo = this.solicitacao?.codigo ?? this.codigoSolicitacao;
    if (!codigo) {
      this.erroCarregamento = 'Solicitacao invalida para aprovacao.';
      return;
    }

    this.erroCarregamento = '';
    this.aprovacaoEmAndamento = true;
    this.solicitacaoService.aprovarServico(codigo).subscribe({
      next: (atualizada) => {
        this.solicitacao = {
          ...this.solicitacao,
          ...atualizada,
        };
        this.codigoSolicitacao = atualizada.codigo;
        this.modalAprovacaoAberto = true;
        this.aprovacaoEmAndamento = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erroCarregamento = 'Nao foi possivel aprovar o orcamento agora.';
        this.aprovacaoEmAndamento = false;
      },
    });
  }

  confirmarAprovacao(): void {
    this.modalAprovacaoAberto = false;
    this.router.navigate(['/cliente']);
  }

  rejeitarServico(): void {
    this.modalRejeicaoAberto = true;
  }

  confirmarRejeicao(): void {
    if (this.rejeicaoEmAndamento) return;

    const codigo = this.solicitacao?.codigo ?? this.codigoSolicitacao;
    if (!codigo) {
      this.erroCarregamento = 'Solicitacao invalida para rejeicao.';
      return;
    }

    this.erroCarregamento = '';
    this.rejeicaoEmAndamento = true;
    const motivo = this.motivoRejeicao.trim();

    this.solicitacaoService.rejeitarServico(codigo, motivo).subscribe({
      next: (atualizada) => {
        this.solicitacao = {
          ...this.solicitacao,
          ...atualizada,
        };
        this.codigoSolicitacao = atualizada.codigo;
        this.modalRejeicaoAberto = false;
        this.modalRejeicaoConfirmadaAberto = true;
        this.rejeicaoEmAndamento = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erroCarregamento = 'Nao foi possivel rejeitar o orcamento agora.';
        this.rejeicaoEmAndamento = false;
      },
    });
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

  private get valorOrcado(): number {
    if (typeof this.solicitacao?.valorOrcamento === 'number' && this.solicitacao.valorOrcamento > 0) {
      return this.solicitacao.valorOrcamento;
    }

    return 0;
  }

  private carregarSolicitacao(codigo: string | null): void {
    if (!codigo) {
      this.erroCarregamento = 'Código da solicitação não informado.';
      return;
    }

    this.erroCarregamento = '';

    this.solicitacaoService
      .buscarMinhaSolicitacaoPorCodigo(codigo)
      .subscribe({
        next: (solicitacao) => {
          if (!solicitacao) {
            this.erroCarregamento = 'Solicitação não encontrada para o cliente logado.';
            return;
          }

          this.solicitacao = {
            ...this.solicitacao,
            ...solicitacao,
          };
        },
        error: () => {
          this.erroCarregamento = 'Não foi possível carregar os dados do orçamento agora.';
        },
      });
  }

}
