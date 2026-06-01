import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, SolicitacaoService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { SolicitacaoHistoricoUtil, SolicitacaoUiUtil } from '../../../shared/utils';

type SolicitacaoComHistorico = SolicitacaoCliente & {
  historico: HistoricoAtualizacao[];
};

@Component({
  selector: 'app-tela-visualizar-funcionario',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-visualizar-funcionario.html',
  styleUrl: './tela-visualizar-funcionario.css',
})
export class TelaVisualizarFuncionario implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private solicitacaoService: SolicitacaoService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario' },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes', active: true },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  solicitacao?: SolicitacaoComHistorico;
  modalFinalizacaoAberto = false;

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.carregarSolicitacao(codigo);
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    return SolicitacaoUiUtil.estadoClasse(estado);
  }

  get valorOrcadoFormatado(): string {
    const valor = this.valorOrcadoParaSolicitacao(this.solicitacao);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  get acaoDisponivelLabel(): string | null {
    if (!this.solicitacao) return null;

    if (this.solicitacao.estado === 'ABERTA') return 'Efetuar Orçamento';
    if (this.solicitacao.estado === 'APROVADA' || this.solicitacao.estado === 'REDIRECIONADA') return 'Efetuar Manutenção';
    if (this.solicitacao.estado === 'PAGA') return 'Finalizar Solicitação';
    return null;
  }

  executarAcaoDisponivel(): void {
    if (!this.solicitacao) return;

    if (this.solicitacao.estado === 'ABERTA') {
      this.router.navigate(['/funcionario/orcamento'], {
        queryParams: { solicitacao: this.solicitacao.codigo },
        state: { solicitacaoSelecionada: this.solicitacao },
      });
      return;
    }

    if (this.solicitacao.estado === 'APROVADA' || this.solicitacao.estado === 'REDIRECIONADA') {
      this.router.navigate(['/funcionario/manutencao'], {
        queryParams: { solicitacao: this.solicitacao.codigo },
        state: { solicitacaoSelecionada: this.solicitacao },
      });
      return;
    }

    if (this.solicitacao.estado === 'PAGA') {
      this.modalFinalizacaoAberto = true;
    }
  }

  fecharModalFinalizacao(): void {
    this.modalFinalizacaoAberto = false;
  }

  confirmarFinalizacao(): void {
    if (!this.solicitacao) return;
    this.solicitacaoService.finalizarSolicitacao(this.solicitacao.codigo).subscribe({
      next: () => {
        this.modalFinalizacaoAberto = false;
        this.carregarSolicitacao(this.solicitacao?.codigo ?? null);
        this.cdr.detectChanges();
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/funcionario/solicitacoes']);
  }

  logout(): void {
    this.authService.logout();
  }

  private get funcionarioLogadoNome(): string {
    const usuario = this.authService.getUsuarioLogado();
    return usuario?.perfil === 'funcionario' ? usuario.nome : '';
  }

  private carregarSolicitacao(codigo: string | null): void {
    if (!codigo) {
      this.solicitacao = {
        codigo: 'N/A',
        dataHora: '-',
        descricaoEquipamento: '-',
        categoriaEquipamento: '-',
        descricaoDefeito: '-',
        estado: 'ABERTA',
        historico: SolicitacaoHistoricoUtil.getHistoricoBase('N/A', '-'),
      };
      return;
    }

    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    if (navState && navState.codigo === codigo) {
      this.solicitacao = {
        ...navState,
        historico: navState.historico?.length
          ? navState.historico
          : SolicitacaoHistoricoUtil.getHistoricoBase(navState.codigo, navState.dataHora),
      };
      this.cdr.detectChanges();
    }

    this.solicitacaoService.buscarSolicitacaoFuncionarioPorCodigo(codigo).subscribe({
      next: (solicitacao) => {
        const historico = solicitacao.historico?.length
          ? solicitacao.historico
          : SolicitacaoHistoricoUtil.getHistoricoBase(solicitacao.codigo, solicitacao.dataHora);

        this.solicitacao = {
          ...solicitacao,
          historico,
        } as SolicitacaoComHistorico;

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
