import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { SolicitacaoHistoricoUtil, SolicitacaoUiUtil } from '../../../shared/utils';

type SolicitacaoComHistorico = SolicitacaoCliente & {
  historico: HistoricoAtualizacao[];
};

@Component({
  selector: 'app-tela-visualizar-cliente',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
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
      this.router.navigate(['/cliente'], {
        queryParams: { acao: this.solicitacao.estado, solicitacao: this.solicitacao.codigo },
      });
      return;
    }

    this.router.navigate(['/cliente']);
  }

  voltar(): void {
    this.router.navigate(['/cliente']);
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
}
