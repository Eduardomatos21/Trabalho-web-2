import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, FormFieldComponent } from '../shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ButtonComponent, FormFieldComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
  });

  enviado   = false;
  loading   = false;
  erroLogin = '';
  showSenha = false;

  onSubmit(): void {
    this.enviado   = true;
    this.erroLogin = '';
    if (this.form.invalid) return;
    this.loading = true;
    // TODO: chamar AuthService.login(this.form.value)
    this.loading = false;
  }

  erro(campo: string): string {
    if (!this.enviado) return '';
    const ctrl = this.form.get(campo);
    if (!ctrl?.errors) return '';
    const e = ctrl.errors;
    if (e['required'])  return campo === 'email' ? 'E-mail é obrigatório.' : 'Senha é obrigatória.';
    if (e['email'])     return 'E-mail inválido.';
    if (e['minlength']) return `Mínimo de ${e['minlength'].requiredLength} caracteres.`;
    return 'Campo inválido.';
  }

  inputClass(campo: string): string {
    const base = 'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white';
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return `${base} ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;
  }
}
