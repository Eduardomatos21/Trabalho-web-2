import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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

    const email = this.form.value.email as string;
    const senha = this.form.value.senha as string;

    this.loading = true;
    this.form.disable({ emitEvent: false });

    this.authService
      .login(email, senha)
      .pipe(finalize(() => {
        this.loading = false;
        this.form.enable({ emitEvent: false });
      }))
      .subscribe({
        next: (usuario) => {
          this.authService.navegarPosLogin(usuario.perfil);
        },
        error: (error: HttpErrorResponse) => {
          this.erroLogin = this.authService.extrairMensagemErroLogin(error);
        },
      });
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
