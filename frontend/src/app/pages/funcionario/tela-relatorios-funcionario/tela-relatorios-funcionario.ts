import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService, ReceitaPorCategoria, ReceitaPorDia, RelatorioReceitaService } from '../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../shared';

@Component({
  selector: 'app-tela-relatorios-funcionario',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ButtonComponent],
  templateUrl: './tela-relatorios-funcionario.html',
  styleUrl: './tela-relatorios-funcionario.css',
})
export class TelaRelatoriosFuncionario implements OnInit {
  constructor(
    private authService: AuthService,
    private relatorioReceitaService: RelatorioReceitaService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario'},
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios', active: true },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  receitasPorDia: ReceitaPorDia[] = [];
  receitasPorCategoria: ReceitaPorCategoria[] = [];
  periodoInicio = '';
  periodoFim = '';

  ngOnInit(): void {
    this.carregarRelatorioPorDia();
    this.carregarRelatorioPorCategoria();
  }

  get totalReceitaPeriodo(): number {
    return this.receitasPorDia.reduce((acc, item) => acc + item.total, 0);
  }

  get totalReceitaCategoria(): number {
    return this.receitasPorCategoria.reduce((acc, item) => acc + item.total, 0);
  }

  aplicarFiltroPeriodo(): void {
    this.atualizarPeriodo();
  }

  limparFiltroPeriodo(): void {
    this.periodoInicio = '';
    this.periodoFim = '';
    this.carregarRelatorioPorDia();
  }

  exportarPdfPorDia(): void {
    const { dataInicial, dataFinal } = this.getPeriodoFiltro();
    this.relatorioReceitaService
      .exportarPdfReceitaPorDia(dataInicial || undefined, dataFinal || undefined)
      .subscribe((blob) => {
        this.relatorioReceitaService.baixarPdf(blob, 'relatorio-receita-por-dia.pdf');
        this.changeDetectorRef.detectChanges();
      });
  }

  exportarPdfPorCategoria(): void {
    this.relatorioReceitaService.exportarPdfReceitaPorCategoria().subscribe((blob) => {
      this.relatorioReceitaService.baixarPdf(blob, 'relatorio-receita-por-categoria.pdf');
      this.changeDetectorRef.detectChanges();
    });
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  logout(): void {
    this.authService.logout();
  }

  atualizarPeriodo(): void {
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
    this.carregarRelatorioPorDia();
  }

  private carregarRelatorioPorDia(): void {
    const { dataInicial, dataFinal } = this.getPeriodoFiltro();
    this.relatorioReceitaService
      .getReceitaPorDia(dataInicial || undefined, dataFinal || undefined)
      .subscribe((dados) => {
        this.receitasPorDia = dados;
        this.changeDetectorRef.detectChanges();
      });
  }

  private carregarRelatorioPorCategoria(): void {
    this.relatorioReceitaService.getReceitaPorCategoria().subscribe((dados) => {
      this.receitasPorCategoria = dados;
      this.changeDetectorRef.detectChanges();
    });
  }

  private getPeriodoFiltro(): { dataInicial?: string; dataFinal?: string } {
    if (this.periodoInicio && this.periodoInicio > this.dataHoje) {
      return {};
    }

    if (this.periodoInicio && this.periodoFim && this.periodoFim < this.periodoInicio) {
      return {};
    }

    return {
      dataInicial: this.periodoInicio || undefined,
      dataFinal: this.periodoFim || undefined,
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
