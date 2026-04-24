import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
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
  ) {}

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações', route: '/cliente', active: true }
  ];

  solicitacao?: SolicitacaoCliente;
  carregando = false;
  erroCarregamento = '';
  modalAprovacaoAberto = false;
  modalRejeicaoAberto = false;
  modalRejeicaoConfirmadaAberto = false;
  motivoRejeicao = '';

  ngOnInit(): void {
    const solicitacaoNavegada = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    if (solicitacaoNavegada) {
      this.solicitacao = solicitacaoNavegada;
    }

    const codigo = solicitacaoNavegada?.codigo ?? null;
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
    if (!this.solicitacao) return;

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      valorOrcamento: this.valorOrcado,
      estado: 'APROVADA',
    };
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

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      valorOrcamento: this.valorOrcado,
      estado: 'REJEITADA',
      motivoRejeicao: motivo || undefined,
    };
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

    this.carregando = true;
    this.erroCarregamento = '';

    this.solicitacaoService
      .buscarMinhaSolicitacaoPorCodigo(codigo)
      .pipe(timeout(10000))
      .pipe(finalize(() => (this.carregando = false)))
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
