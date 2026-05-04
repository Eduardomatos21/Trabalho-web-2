import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoUiUtil } from '../../../shared/utils';
import { SolicitacaoService } from '../../../services/solicitacao.service';

type OrdemDataHora = 'asc' | 'desc';

@Component({
  selector: 'app-tela-inicial-funcionario',
  standalone: true,
  imports: [SidebarComponent, ButtonComponent],
  templateUrl: './tela-inicial-funcionario.html',
  styleUrl: './tela-inicial-funcionario.css',
})
export class TelaInicialFuncionario implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    // private clienteStorageService: ClienteStorageService,
    private solicitacaoService: SolicitacaoService,
    private cdr: ChangeDetectorRef,
  ) { }

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  ordemDataHora: OrdemDataHora = 'asc';



  solicitacoes: SolicitacaoCliente[] = [];

  ngOnInit(): void {
    this.carregarDoBackend();
  }

  carregarDoBackend(): void {
    this.solicitacaoService.buscarAbertas().subscribe({
      next: (data) => {
        this.solicitacoes = data.map((item) => ({
          codigo: item.codigo,
          nomeCliente: item.nomeCliente?.trim() || 'Cliente',
          emailCliente: '',
          dataHora: item.dataHora,
          descricaoEquipamento: item.descricaoEquipamento,
          estado: item.estado as any
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar do backend', err);
        this.cdr.detectChanges();
      }
    });
  }

  get solicitacoesAbertasOrdenadas(): SolicitacaoCliente[] {
    return this.solicitacoes
      .filter((sol) => sol.estado === 'ABERTA')
      .sort((a, b) => {
        const diff = DateFormatUtil.parseDataHora(a.dataHora) - DateFormatUtil.parseDataHora(b.dataHora);
        return this.ordemDataHora === 'asc' ? diff : -diff;
      });
  }

  alternarOrdemDataHora(): void {
    this.ordemDataHora = this.ordemDataHora === 'asc' ? 'desc' : 'asc';
  }

  descricaoLimitada(produto: string): string {
    return produto.length <= 30 ? produto : `${produto.slice(0, 30)}...`;
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    return SolicitacaoUiUtil.estadoClasse(estado);
  }

  nomeCliente(solicitacao: SolicitacaoCliente): string {
    return solicitacao.nomeCliente?.trim() || 'Cliente';
  }

  logout(): void {
    this.authService.logout();
  }

  efetuarOrcamento(codigo: string): void {
    const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
    this.router.navigate(['/funcionario/orcamento'], {
      queryParams: { solicitacao: codigo },
      state: { solicitacaoSelecionada: selecionada },
    });
  }

  visualizarSolicitacao(codigo: string): void {
    const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
    this.router.navigate(['/funcionario/visualizar'], {
      queryParams: { solicitacao: codigo },
      state: { solicitacaoSelecionada: selecionada },
    });
  }

  navegarParaCategorias(): void {
    this.router.navigate(['/funcionario/categorias']);
  }




}
