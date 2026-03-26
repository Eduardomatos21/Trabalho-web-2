import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services';
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
  private authService = inject(AuthService);

  readonly usuariosDemo = this.authService.getUsuariosDemo();

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

    const email = this.form.value.email as string;
    const senha = this.form.value.senha as string;
    const resultado = this.authService.login(email, senha);

    if (!resultado.ok) {
      this.erroLogin = resultado.message;
      this.loading = false;
      return;
    }

    this.authService.navegarPosLogin(resultado.usuario.perfil);
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
