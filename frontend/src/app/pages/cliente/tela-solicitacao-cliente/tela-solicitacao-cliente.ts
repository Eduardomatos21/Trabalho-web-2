import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, FormFieldComponent, SidebarComponent } from '../../../shared';
import type { SidebarItem } from '../../../shared';

const SOLICITACOES_STORAGE_KEY = 'solicitacoesCliente';

type EstadoSolicitacao = 'ABERTA';

type SolicitacaoCliente = {
  codigo: string;
  dataHora: string;
  descricaoEquipamento: string;
  categoriaEquipamento: string;
  descricaoDefeito: string;
  estado: EstadoSolicitacao;
};

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
      dataHora: this.formatarDataHora(new Date()),
      descricaoEquipamento: this.form.value.descricaoEquipamento,
      categoriaEquipamento: this.form.value.categoriaEquipamento,
      descricaoDefeito: this.form.value.descricaoDefeito,
      estado: 'ABERTA',
    };

    const atuais = this.carregarSolicitacoes();
    atuais.push(novaSolicitacao);
    localStorage.setItem(SOLICITACOES_STORAGE_KEY, JSON.stringify(atuais));

    this.loading = false;
    this.router.navigate(['/cliente']);
  }

  erro(campo: string): string {
    if (!this.enviado) return '';
    const ctrl = this.form.get(campo);
    if (!ctrl?.errors) return '';

    const e = ctrl.errors;
    if (e['required']) return 'Campo obrigatório.';
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    if (e['minlength']) return `Mínimo de ${e['minlength'].requiredLength} caracteres.`;
    return 'Campo inválido.';
  }

  inputClass(campo: string): string {
    const base = 'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white';
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return `${base} ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private carregarSolicitacoes(): SolicitacaoCliente[] {
    const raw = localStorage.getItem(SOLICITACOES_STORAGE_KEY);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private formatarDataHora(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }

  private gerarCodigo(): string {
    const sufixo = String(Date.now()).slice(-5);
    return `SOL-${sufixo}`;
  }
}
