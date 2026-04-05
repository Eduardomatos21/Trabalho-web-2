import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoUiUtil } from '../../../shared/utils';

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
    private clienteStorageService: ClienteStorageService,
  ) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  ordemDataHora: OrdemDataHora = 'asc';

  private readonly solicitacoesBase: SolicitacaoCliente[] = [
    {
      codigo: 'SOL-1042',
      nomeCliente: 'João da Silva',
      emailCliente: 'joao.silva@email.com',
      dataHora: '20/03/2026 14:30',
      descricaoEquipamento: 'Notebook Dell Inspiron 15 com bateria viciada e falha de boot',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1044',
      nomeCliente: 'Maria Oliveira',
      emailCliente: 'maria.oliveira@email.com',
      dataHora: '20/03/2026 14:30',
      descricaoEquipamento: 'Monitor LG UltraWide 29',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1034',
      nomeCliente: 'Carlos Pereira',
      emailCliente: 'carlos.pereira@email.com',
      dataHora: '17/03/2026 09:10',
      descricaoEquipamento: 'Monitor LG UltraWide 29',
      estado: 'APROVADA',
    },
    {
      codigo: 'SOL-1018',
      nomeCliente: 'Fernanda Rocha',
      emailCliente: 'fernanda.rocha@email.com',
      dataHora: '08/03/2026 11:42',
      descricaoEquipamento: 'Teclado Mecânico RGB',
      estado: 'REJEITADA',
    },
    {
      codigo: 'SOL-1051',
      nomeCliente: 'Ricardo Mendes',
      emailCliente: 'ricardo.mendes@email.com',
      dataHora: '21/03/2026 16:05',
      descricaoEquipamento: 'Impressora HP LaserJet Pro MFP com atolamento recorrente',
      estado: 'ARRUMADA',
    },
    {
      codigo: 'SOL-0997',
      nomeCliente: 'Patricia Lima',
      emailCliente: 'patricia.lima@email.com',
      dataHora: '03/03/2026 08:25',
      descricaoEquipamento: 'Mouse sem fio Logitech MX Master',
      estado: 'ABERTA',
    },
  ];

  solicitacoes: SolicitacaoCliente[] = [];

  ngOnInit(): void {
    this.solicitacoes = this.carregarSolicitacoesFuncionario();
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

  navegarParaCategorias(): void {
    this.router.navigate(['/funcionario/categorias']);
  }

  private carregarSolicitacoesFuncionario(): SolicitacaoCliente[] {
    const salvasCliente = this.clienteStorageService
      .carregarSolicitacoes()
      .map((sol) => ({ ...sol, nomeCliente: sol.nomeCliente?.trim() || 'Cliente' }));

    return this.clienteStorageService.mesclarSolicitacoes(this.solicitacoesBase, salvasCliente);
  }
}
