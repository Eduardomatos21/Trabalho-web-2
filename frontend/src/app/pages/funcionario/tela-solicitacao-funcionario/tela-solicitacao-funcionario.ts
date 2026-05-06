import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SolicitacaoService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoHistoricoUtil, SolicitacaoUiUtil } from '../../../shared/utils';

type TipoFiltro = 'HOJE' | 'PERIODO' | 'TODAS';
type OrdemDataHora = 'asc' | 'desc';

@Component({
  selector: 'app-tela-solicitacao-funcionario',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-solicitacao-funcionario.html',
  styleUrl: './tela-solicitacao-funcionario.css',
})
export class TelaSolicitacaoFuncionario implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private solicitacaoService: SolicitacaoService,
    private cdr: ChangeDetectorRef,
  ) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario'},
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes', active: true },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  tipoFiltro: TipoFiltro = 'TODAS';
  ordemDataHora: OrdemDataHora = 'asc';
  periodoInicio = '';
  periodoFim = '';
  solicitacoes: SolicitacaoCliente[] = [];
  modalFinalizacaoAberto = false;
  solicitacaoParaFinalizar: SolicitacaoCliente | null = null;

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  get solicitacoesFiltradasOrdenadas(): SolicitacaoCliente[] {
    return [...this.solicitacoes]
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

    this.carregarSolicitacoes();
  }

  atualizarPeriodo(): void {
    if (this.tipoFiltro !== 'PERIODO') return;
    const hoje = this.dataHoje;
    if (this.periodoInicio && this.periodoInicio > hoje) {
      this.periodoInicio = hoje;
    }
    if (this.periodoInicio && this.periodoFim && this.periodoInicio > this.periodoFim) {
      this.periodoInicio = this.periodoFim;
    }
    if (this.periodoInicio && this.periodoFim && this.periodoFim < this.periodoInicio) {
      this.periodoFim = this.periodoInicio;
    }
    this.carregarSolicitacoes();
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    return SolicitacaoUiUtil.estadoClasse(estado);
  }

  nomeEstadoExibicao(estado: EstadoSolicitacao): string {
    return estado;
  }

  descricaoLimitada(descricaoEquipamento: string): string {
    return descricaoEquipamento.length <= 30 ? descricaoEquipamento : `${descricaoEquipamento.slice(0, 30)}...`;
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
      this.router.navigate(['/funcionario/manutencao'], {
        queryParams: { solicitacao: solicitacao.codigo },
        state: { solicitacaoSelecionada: solicitacao },
      });
      return;
    }

    if (solicitacao.estado === 'PAGA') {
      this.solicitacaoParaFinalizar = solicitacao;
      this.modalFinalizacaoAberto = true;
    }
  }

  visualizarSolicitacao(solicitacao: SolicitacaoCliente): void {
    this.router.navigate(['/funcionario/visualizar'], {
      queryParams: { solicitacao: solicitacao.codigo },
      state: { solicitacaoSelecionada: solicitacao },
    });
  }

  fecharModalFinalizacao(): void {
    this.modalFinalizacaoAberto = false;
    this.solicitacaoParaFinalizar = null;
  }

  confirmarFinalizacao(): void {
    if (!this.solicitacaoParaFinalizar) return;

      this.solicitacaoService.finalizarSolicitacao(this.solicitacaoParaFinalizar.codigo)
      .subscribe({
        next: () => {
          this.carregarSolicitacoes();
          this.fecharModalFinalizacao();
        },
        error: () => {

    const dataHoraFinalizacao = DateFormatUtil.formatarDataHora(new Date());
    const funcionario = this.funcionarioLogadoNome || 'Funcionário';

    const eventoFinalizacao: HistoricoAtualizacao = {
      dataHora: dataHoraFinalizacao,
      funcionario,
      descricao: 'Solicitação finalizada',
    };

    const historicoAtual = 
      this.solicitacaoParaFinalizar.historico && this.solicitacaoParaFinalizar.historico.length > 0
        ? this.solicitacaoParaFinalizar.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(
            this.solicitacaoParaFinalizar.codigo,
            this.solicitacaoParaFinalizar.dataHora,
          );

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacaoParaFinalizar,
      estado: 'FINALIZADO',
      dataHoraFinalizacao,
      funcionarioFinalizacao: funcionario,
      historico: [...historicoAtual, eventoFinalizacao],
    };

    const index = this.solicitacoes.findIndex((item) => item.codigo === atualizada.codigo);
    if (index !== -1) {
      this.solicitacoes[index] = atualizada;
    }

    this.fecharModalFinalizacao();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private get funcionarioLogadoNome(): string {
    const usuario = this.authService.getUsuarioLogado();
    return usuario?.perfil === 'funcionario' ? usuario.nome : '';
  }

  private carregarSolicitacoes(): void {
    const { dataInicio, dataFim } = this.getPeriodoFiltro();

    this.solicitacaoService
      .listarSolicitacoesFuncionario(this.tipoFiltro, dataInicio, dataFim)
      .subscribe({
        next: (solicitacoes) => {
          this.solicitacoes = [...solicitacoes];
          this.cdr.detectChanges();
        },
        error: () => {
          this.solicitacoes = [];
          this.cdr.detectChanges();
        },
      });
  }

  private getPeriodoFiltro(): { dataInicio?: string; dataFim?: string } {
    if (this.tipoFiltro !== 'PERIODO') {
      return {};
    }

    if (this.periodoInicio && this.periodoInicio > this.dataHoje) {
      return {};
    }

    if (this.periodoInicio && this.periodoFim && this.periodoFim < this.periodoInicio) {
      return {};
    }

    return {
      dataInicio: this.periodoInicio ? `${this.periodoInicio}T00:00:00` : undefined,
      dataFim: this.periodoFim ? `${this.periodoFim}T23:59:59` : undefined,
    };
  }

  get dataHoje(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get dataInicioMax(): string {
    if (!this.periodoFim) {
      return this.dataHoje;
    }

    return this.periodoFim < this.dataHoje ? this.periodoFim : this.dataHoje;
  }
}
