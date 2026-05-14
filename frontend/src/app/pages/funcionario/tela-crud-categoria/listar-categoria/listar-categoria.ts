import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CategoriaService } from '../../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../../shared';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { Categoria } from '../../../../shared/models/categoria.model';

@Component({
  selector: 'app-listar-categoria',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SidebarComponent, ModalComponent],
  templateUrl: './listar-categoria.html',
  styleUrl: './listar-categoria.css',
})
export class ListarCategoria implements OnInit {
  categorias: Categoria[] = [];
  modalAberto = false;
  categoriaParaExcluir: number | null = null;
  carregando = false;

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario'},
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias', active: true },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.categoriaService.listarTodosApi().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: () => {
        this.categorias = [];
      },
    });
  }

  novaCategoria(): void {
    this.router.navigate(['/funcionario/categorias/nova']);
  }

  editarCategoria(id: number): void {
    this.router.navigate(['/funcionario/categorias', id]);
  }

  removerCategoria(id: number): void {
    this.categoriaParaExcluir = id;
    this.modalAberto = true;
  }

  confirmarExclusao(): void {
    if (this.categoriaParaExcluir !== null) {
      this.categoriaService.desativarApi(this.categoriaParaExcluir).subscribe({
        next: () => {
          this.carregarCategorias();
          this.fecharModal();
          this.cdr.detectChanges();
        },
        error: () => {
          this.carregarCategorias();
          this.fecharModal();
          this.cdr.detectChanges();
        },
      });
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.categoriaParaExcluir = null;
  }

  logout(): void {
    this.authService.logout();
  }
}
