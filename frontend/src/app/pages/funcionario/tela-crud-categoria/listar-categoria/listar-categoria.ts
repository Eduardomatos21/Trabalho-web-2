import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, CategoriaService } from '../../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../../shared';
import { Categoria } from '../../../../shared/models/categoria.model';

@Component({
  selector: 'app-listar-categoria',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SidebarComponent],
  templateUrl: './listar-categoria.html',
  styleUrl: './listar-categoria.css',
})
export class ListarCategoria implements OnInit {
  categorias: Categoria[] = [];

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario' },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias', active: true },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private categoriaService: CategoriaService,
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.categorias = this.categoriaService.listarTodos();
  }

  novaCategoria(): void {
    this.router.navigate(['/funcionario/categorias/nova']);
  }

  editarCategoria(id: number): void {
    this.router.navigate(['/funcionario/categorias', id]);
  }

  removerCategoria(id: number): void {
    const confirmado = confirm('Deseja realmente excluir esta categoria?');
    if (!confirmado) {
      return;
    }

    this.categoriaService.remover(id);
    this.carregarCategorias();
  }

  logout(): void {
    this.authService.logout();
  }
}
