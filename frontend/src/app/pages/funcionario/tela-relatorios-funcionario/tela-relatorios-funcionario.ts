import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService, ReceitaPorCategoria, ReceitaPorDia, RelatorioReceitaService } from '../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../shared';

@Component({
  selector: 'app-tela-relatorios-funcionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, ButtonComponent],
  templateUrl: './tela-relatorios-funcionario.html',
  styleUrl: './tela-relatorios-funcionario.css',
})
export class TelaRelatoriosFuncionario implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private relatorioReceitaService: RelatorioReceitaService,
  ) {
    this.filtroPeriodoForm = this.fb.group({
      dataInicial: [''],
      dataFinal: [''],
    });
  }

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario'},
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios', active: true },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  readonly filtroPeriodoForm: FormGroup;

  receitasPorDia: ReceitaPorDia[] = [];
  receitasPorCategoria: ReceitaPorCategoria[] = [];

  ngOnInit(): void {
    this.carregarRelatorioPorDia();
    this.receitasPorCategoria = this.relatorioReceitaService.getReceitaPorCategoria();
  }

  get totalReceitaPeriodo(): number {
    return this.receitasPorDia.reduce((acc, item) => acc + item.total, 0);
  }

  get totalReceitaCategoria(): number {
    return this.receitasPorCategoria.reduce((acc, item) => acc + item.total, 0);
  }

  aplicarFiltroPeriodo(): void {
    this.carregarRelatorioPorDia();
  }

  limparFiltroPeriodo(): void {
    this.filtroPeriodoForm.reset({ dataInicial: '', dataFinal: '' });
    this.carregarRelatorioPorDia();
  }

  exportarPdfPorDia(): void {
    const { dataInicial, dataFinal } = this.filtroPeriodoForm.getRawValue();
    this.relatorioReceitaService.exportarPdfReceitaPorDia(this.receitasPorDia, dataInicial || undefined, dataFinal || undefined);
  }

  exportarPdfPorCategoria(): void {
    this.relatorioReceitaService.exportarPdfReceitaPorCategoria(this.receitasPorCategoria);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  logout(): void {
    this.authService.logout();
  }

  private carregarRelatorioPorDia(): void {
    const { dataInicial, dataFinal } = this.filtroPeriodoForm.getRawValue();
    this.receitasPorDia = this.relatorioReceitaService.getReceitaPorDia(dataInicial || undefined, dataFinal || undefined);
  }
}
