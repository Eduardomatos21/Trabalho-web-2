import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, FormFieldComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, FormValidationHelper } from '../../../shared/utils';

@Component({
  selector: 'app-tela-solicitacao-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, FormFieldComponent, ButtonComponent],
  templateUrl: './tela-solicitacao-cliente.html',
  styleUrl: './tela-solicitacao-cliente.css',
})
export class TelaSolicitacaoCliente {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private clienteStorageService = inject(ClienteStorageService);

  enviado = false;
  loading = false;

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente' },
    { label: 'Nova solicitação', route: '/cliente/solicitacao', active: true },
    { label: 'Minhas solicitações' },
    { label: 'Meus dados' },
  ];

  form: FormGroup = this.fb.group({
    descricaoEquipamento: ['', [Validators.required, Validators.maxLength(120)]],
    categoriaEquipamento: ['', Validators.required],
    descricaoDefeito: ['', [Validators.required, Validators.minLength(10)]],
  });

  onSubmit(): void {
    this.enviado = true;
    if (this.form.invalid) return;

    this.loading = true;

    const novaSolicitacao: SolicitacaoCliente = {
      codigo: this.gerarCodigo(),
      dataHora: DateFormatUtil.formatarDataHora(new Date()),
      descricaoEquipamento: this.form.value.descricaoEquipamento,
      categoriaEquipamento: this.form.value.categoriaEquipamento,
      descricaoDefeito: this.form.value.descricaoDefeito,
      estado: 'ABERTA',
    };

    this.clienteStorageService.salvarSolicitacao(novaSolicitacao);

    this.loading = false;
    this.router.navigate(['/cliente']);
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

  private gerarCodigo(): string {
    const sufixo = String(Date.now()).slice(-5);
    return `SOL-${sufixo}`;
  }
}
