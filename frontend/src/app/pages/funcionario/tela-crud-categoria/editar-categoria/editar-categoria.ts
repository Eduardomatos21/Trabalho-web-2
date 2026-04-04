import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CategoriaService } from '../../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../../shared';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { Categoria } from '../../../../shared/models/categoria.model';

@Component({
  selector: 'app-editar-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SidebarComponent, FormFieldComponent],
  templateUrl: './editar-categoria.html',
  styleUrl: './editar-categoria.css',
})
export class EditarCategoria implements OnInit {
  form: FormGroup;
  categoriaId: number | null = null;
  carregando = false;

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario' },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias', active: true },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private categoriaService: CategoriaService,
  ) {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.categoriaId = Number(id);
        const categoria = this.categoriaService.buscarPorId(this.categoriaId);
        if (categoria) {
          this.form.patchValue({ nome: categoria.nome });
        }
      }
    });
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.carregando = true;
    const categoria = new Categoria(this.categoriaId ?? 0, this.form.value.nome.trim());

    if (this.categoriaId) {
      this.categoriaService.atualizar(categoria);
    } else {
      this.categoriaService.inserir(categoria);
    }

    this.router.navigate(['/funcionario/categorias']);
  }

  cancelar(): void {
    this.router.navigate(['/funcionario/categorias']);
  }

  logout(): void {
    this.authService.logout();
  }

  get titulo(): string {
    return this.categoriaId ? 'Editar categoria' : 'Nova categoria';
  }

  get nomeControl() {
    return this.form.get('nome');
  }

  erroNome(): string {
    if (!this.nomeControl?.touched && !this.nomeControl?.dirty) {
      return '';
    }
    if (this.nomeControl?.hasError('required')) {
      return 'Nome é obrigatório.';
    }
    if (this.nomeControl?.hasError('minlength')) {
      return 'Nome precisa ter pelo menos 3 caracteres.';
    }
    return '';
  }
}

