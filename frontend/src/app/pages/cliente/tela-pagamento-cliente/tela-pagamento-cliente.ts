import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoHistoricoUtil } from '../../../shared/utils';

@Component({
  selector: 'app-tela-pagamento-cliente',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-pagamento-cliente.html',
  styleUrl: './tela-pagamento-cliente.css',
})
export class TelaPagamentoCliente implements OnInit {
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

  solicitacao?: SolicitacaoCliente;
  modalPagamentoAberto = false;
  valorServicoMock = 249.9;

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.buscarSolicitacao(codigo);
  }

  get valorServicoFormatado(): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.valorServicoMock);
  }

  confirmarPagamento(): void {
    if (!this.solicitacao) return;

    const dataPagamento = DateFormatUtil.formatarDataHora(new Date());
    const eventoPagamento: HistoricoAtualizacao = {
      dataHora: dataPagamento,
      funcionario: '',
      descricao: 'Pagamento confirmado pelo cliente',
    };

    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      estado: 'FINALIZADO',
      dataHoraPagamento: dataPagamento,
      historico: [...historicoAtual, eventoPagamento],
    };

    this.clienteStorageService.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;
    this.modalPagamentoAberto = true;
  }

  concluirPagamento(): void {
    if (!this.solicitacao) {
      this.router.navigate(['/cliente']);
      return;
    }

    this.modalPagamentoAberto = false;
    this.router.navigate(['/cliente/visualizar'], {
      queryParams: { solicitacao: this.solicitacao.codigo },
      state: { solicitacaoSelecionada: this.solicitacao },
    });
  }

  voltar(): void {
    this.router.navigate(['/cliente']);
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
      estado: 'ARRUMADA',
    };
  }
}
