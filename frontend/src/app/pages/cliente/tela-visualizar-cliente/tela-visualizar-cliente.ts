import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SolicitacaoService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { SolicitacaoHistoricoUtil, SolicitacaoUiUtil } from '../../../shared/utils';

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
    private solicitacaoService: SolicitacaoService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações', route: '/cliente', active: true },
  ];

  solicitacao?: SolicitacaoComHistorico;
  historicoCarregado = false;
  modalResgatarAberto = false;
  modalResgateSucessoAberto = false;
  resgateEmAndamento = false;

  ngOnInit(): void {
    this.solicitacao = this.carregarSolicitacao();
    const codigo = this.solicitacao?.codigo;
    if (codigo && codigo !== 'N/A') {
      this.historicoCarregado = false;
      this.buscarSolicitacaoDetalhe(codigo);
    } else {
      this.historicoCarregado = true;
    }
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
    this.resgateEmAndamento = false;
  }

  closeModalSucesso(): void {
    this.modalResgateSucessoAberto = false;
    this.resgateEmAndamento = false;
    this.router.navigate(['/cliente']);
  }


  get valorOrcadoFormatado(): string {
    const valor = this.valorOrcadoParaSolicitacao(this.solicitacao);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  resgatarServico(): void {
    if (!this.solicitacao || this.resgateEmAndamento) return;

    this.resgateEmAndamento = true;
    this.modalResgatarAberto = false;
    const codigo = this.solicitacao.codigo;
    this.solicitacaoService.resgatarServico(codigo).subscribe(() => {
      this.modalResgateSucessoAberto = true;
      this.resgateEmAndamento = false;
      this.buscarSolicitacaoDetalhe(codigo);
      this.cdr.detectChanges();
    },
    () => {
      this.resgateEmAndamento = false;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private carregarSolicitacao(): SolicitacaoComHistorico {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    const solicitacao: SolicitacaoCliente = navState ?? {
      codigo: 'N/A',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ABERTA',
    };

    return {
      ...solicitacao,
      historico: solicitacao.historico ?? [],
    };
  }

  private buscarSolicitacaoDetalhe(codigo: string): void {
    this.solicitacaoService.buscarMinhaSolicitacaoDetalhe(codigo).subscribe({
      next: (solicitacao) => {
        const historico = solicitacao.historico?.length
          ? solicitacao.historico
          : SolicitacaoHistoricoUtil.getHistoricoBase(solicitacao.codigo, solicitacao.dataHora);

        this.solicitacao = {
          ...solicitacao,
          historico,
        } as SolicitacaoComHistorico;
        this.historicoCarregado = true;
        this.cdr.detectChanges();
      },
    });
  }

  private valorOrcadoParaSolicitacao(solicitacao?: SolicitacaoCliente | null): number {
    if (!solicitacao) return 0;

    if (typeof solicitacao.valorOrcamento === 'number' && solicitacao.valorOrcamento > 0) {
      return solicitacao.valorOrcamento;
    }
    return 0;
  }
}
