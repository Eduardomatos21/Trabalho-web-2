import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { SidebarItem } from '../../../shared';
import { ButtonComponent, ModalComponent, SidebarComponent } from '../../../shared';

const SOLICITACOES_STORAGE_KEY = 'solicitacoesCliente';

type SolicitacaoCliente = {
  codigo: string;
  dataHora: string;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  motivoRejeicao?: string;
  estado: 'ORÇADA' | 'APROVADA' | 'REJEITADA' | 'ARRUMADA' | 'ABERTA';
};

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
  ) {}

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações', active: true },
    { label: 'Meus dados' },
  ];

  solicitacao?: SolicitacaoCliente;
  modalAprovacaoAberto = false;
  modalRejeicaoAberto = false;
  modalRejeicaoConfirmadaAberto = false;
  motivoRejeicao = '';
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

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      estado: 'APROVADA',
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

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      estado: 'REJEITADA',
      motivoRejeicao: this.motivoRejeicao.trim() || undefined,
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

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private buscarSolicitacao(codigo: string | null): SolicitacaoCliente {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    if (navState && navState.codigo === codigo) return navState;

    const salvas = this.carregarSolicitacoesSalvas();
    const encontrada = salvas.find((s) => s.codigo === codigo);
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

  private carregarSolicitacoesSalvas(): SolicitacaoCliente[] {
    const raw = localStorage.getItem(SOLICITACOES_STORAGE_KEY);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.filter((item): item is SolicitacaoCliente =>
        item &&
        typeof item.codigo === 'string' &&
        typeof item.dataHora === 'string' &&
        typeof item.descricaoEquipamento === 'string' &&
        typeof item.estado === 'string',
      );
    } catch {
      return [];
    }
  }

  private salvarSolicitacao(solicitacao: SolicitacaoCliente): void {
    const atuais = this.carregarSolicitacoesSalvas();
    const index = atuais.findIndex((item) => item.codigo === solicitacao.codigo);

    if (index >= 0) {
      atuais[index] = solicitacao;
    } else {
      atuais.push(solicitacao);
    }

    localStorage.setItem(SOLICITACOES_STORAGE_KEY, JSON.stringify(atuais));
  }

}
