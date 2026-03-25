import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, FormFieldComponent } from '../shared';
import { FormValidationHelper } from '../shared/utils';

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
    return FormValidationHelper.getErrorMessage(campo, this.form.get(campo), this.enviado, {
      requiredMessages: {
        email: 'E-mail é obrigatório.',
        senha: 'Senha é obrigatória.',
      },
    });
  }

  inputClass(campo: string): string {
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return FormValidationHelper.getInputClass(hasError);
  }
}
