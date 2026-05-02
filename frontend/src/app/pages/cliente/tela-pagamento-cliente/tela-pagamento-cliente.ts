import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SolicitacaoService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { SolicitacaoCliente } from '../../../shared/models';

@Component({
  selector: 'app-tela-pagamento-cliente',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-pagamento-cliente.html',
  styleUrl: './tela-pagamento-cliente.css',
})
export class TelaPagamentoCliente implements OnInit {
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

  solicitacao?: SolicitacaoCliente;
  modalPagamentoAberto = false;

  ngOnInit(): void {
    this.carregarSolicitacao();
  }

  get valorServicoFormatado(): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.valorServico);
  }

  confirmarPagamento(): void {
    if (!this.solicitacao) return;

    this.solicitacaoService.pagarServico(this.solicitacao.codigo).subscribe((atualizada) => {
      this.solicitacao = atualizada;
      this.modalPagamentoAberto = true;
      this.cdr.detectChanges();
    });
  }

  concluirPagamento(): void {
    if (!this.solicitacao) {
      this.router.navigate(['/cliente']);
      return;
    }

    this.modalPagamentoAberto = false;
    this.router.navigate(['/cliente']);
  }

  voltar(): void {
    this.router.navigate(['/cliente']);
  }

  logout(): void {
    this.authService.logout();
  }

  private carregarSolicitacao(): void {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;

    this.solicitacao = navState ?? {
      codigo: 'N/A',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ARRUMADA',
    };

    if (!navState?.codigo) return;

    this.solicitacaoService.buscarMinhaSolicitacaoPorCodigo(navState.codigo).subscribe((atualizada) => {
      if (atualizada) {
        this.solicitacao = atualizada;
        this.cdr.detectChanges();
      }
    });
  }

  private get valorServico(): number {
    if (typeof this.solicitacao?.valorOrcamento === 'number' && this.solicitacao.valorOrcamento > 0) {
      return this.solicitacao.valorOrcamento;
    }
    return 0;
  }
}
