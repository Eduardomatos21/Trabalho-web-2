import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService, CategoriaService, SolicitacaoService } from '../../../services';
import { ButtonComponent, FormFieldComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { Categoria } from '../../../shared/models/categoria.model';
import { FormValidationHelper } from '../../../shared/utils';

@Component({
  selector: 'app-tela-solicitacao-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, FormFieldComponent, ButtonComponent],
  templateUrl: './tela-solicitacao-cliente.html',
  styleUrl: './tela-solicitacao-cliente.css',
})
export class TelaSolicitacaoCliente implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private categoriaService = inject(CategoriaService);
  private solicitacaoService = inject(SolicitacaoService);

  enviado = false;
  loading = false;
  categorias: Categoria[] = [];
  erroServidor = '';

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao', active: true },
    { label: 'Minhas solicitações', route: '/cliente' }
  ];

  form: FormGroup = this.fb.group({
    descricaoEquipamento: ['', [Validators.required, Validators.maxLength(120)]],
    categoriaEquipamento: ['', Validators.required],
    descricaoDefeito: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.categoriaService.listarTodosApi().subscribe((categorias) => {
      this.categorias = categorias;
    });
  }

  onSubmit(): void {
    this.enviado = true;
    this.erroServidor = '';
    if (this.form.invalid) return;

    this.loading = true;
    this.form.disable({ emitEvent: false });

    this.solicitacaoService
      .criarSolicitacao({
        descricaoEquipamento: String(this.form.getRawValue().descricaoEquipamento ?? '').trim(),
        categoriaEquipamento: String(this.form.getRawValue().categoriaEquipamento ?? '').trim(),
        descricaoDefeito: String(this.form.getRawValue().descricaoDefeito ?? '').trim(),
      })
      .pipe(finalize(() => {
        this.loading = false;
        this.form.enable({ emitEvent: false });
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/cliente']);
        },
        error: (error: HttpErrorResponse) => {
          this.erroServidor = this.extrairMensagemErro(error);
        },
      });
  }

  erro(campo: string): string {
    return FormValidationHelper.getErrorMessage(campo, this.form.get(campo), this.enviado);
  }

  inputClass(campo: string): string {
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return FormValidationHelper.getInputClass(hasError);
  }

  logout(): void {
    this.authService.logout();
  }

  private extrairMensagemErro(error: HttpErrorResponse): string {
    if (error.status === 400) {
      return 'Dados invalidos. Revise os campos e tente novamente.';
    }

    if (error.status === 401) {
      return 'Sessao expirada. Faca login novamente.';
    }

    if (error.status === 403) {
      return 'Operacao nao permitida para o perfil atual.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error.trim();
    }

    if (error.error?.message) {
      return String(error.error.message);
    }

    return 'Nao foi possivel registrar a solicitacao agora.';
  }
}
