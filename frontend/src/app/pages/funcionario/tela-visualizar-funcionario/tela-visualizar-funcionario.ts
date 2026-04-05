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
    private clienteStorageService: ClienteStorageService,
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

  private readonly valoresMockSolicitacoesIniciais: Record<string, number> = {
    'SOL-1042': 249.9,
    'SOL-1044': 249.9,
    'SOL-1051': 249.9,
    'SOL-1034': 235.9,
  };

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.carregarSolicitacao(codigo);
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

    const dataHoraFinalizacao = DateFormatUtil.formatarDataHora(new Date());
    const funcionario = this.funcionarioLogadoNome || 'Funcionário';

    const eventoFinalizacao: HistoricoAtualizacao = {
      dataHora: dataHoraFinalizacao,
      funcionario,
      descricao: 'Solicitação finalizada',
    };

    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoComHistorico = {
      ...this.solicitacao,
      estado: 'FINALIZADO',
      dataHoraFinalizacao,
      funcionarioFinalizacao: funcionario,
      historico: [...historicoAtual, eventoFinalizacao],
    };

    this.clienteStorageService.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;
    this.modalFinalizacaoAberto = false;
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

  private valorOrcadoParaSolicitacao(solicitacao?: SolicitacaoCliente | null): number {
    if (!solicitacao) return 0;

    if (typeof solicitacao.valorOrcamento === 'number' && solicitacao.valorOrcamento > 0) {
      return solicitacao.valorOrcamento;
    }

    const valorMock = this.valoresMockSolicitacoesIniciais[solicitacao.codigo];
    return typeof valorMock === 'number' ? valorMock : 0;
  }
}
