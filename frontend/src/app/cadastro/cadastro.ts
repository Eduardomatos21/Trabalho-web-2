import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services';
import { ButtonComponent, FormFieldComponent, ModalComponent } from '../shared';
import { FormValidationHelper } from '../shared/utils';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ButtonComponent, FormFieldComponent, ModalComponent],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  form: FormGroup = this.fb.group({
    cpf:         ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    nome:        ['', [Validators.required, Validators.minLength(3)]],
    email:       ['', [Validators.required, Validators.email]],
    telefone:    ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)]],
    cep:         ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
    logradouro:  ['', Validators.required],
    numero:      ['', Validators.required],
    complemento: [''],
    bairro:      ['', Validators.required],
    cidade:      ['', Validators.required],
    estado:      ['', Validators.required],
  });

  cepLoading = false;
  cepErro    = false;
  enviado    = false;
  sucesso    = false;
  loading    = false;
  senhaGerada = '';


  mask(event: Event, tipo: 'cpf' | 'telefone' | 'cep'): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');

    if (tipo === 'cpf') {
      v = v.substring(0, 11)
           .replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (tipo === 'telefone') {
      v = v.substring(0, 11);
      v = v.length > 10
        ? v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        : v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (tipo === 'cep') {
      v = v.substring(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
    }

    input.value = v;
    this.form.get(tipo)?.setValue(v, { emitEvent: false });
  }

  buscarCep(): void {
    const cep = this.form.get('cep')?.value?.replace(/\D/g, '');
    if (cep?.length !== 8) return;

    this.cepLoading = true;
    this.cepErro    = false;

    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (data) => {
        this.cepLoading = false;
        if (data.erro) { this.cepErro = true; return; }
        this.form.patchValue({
          logradouro: data.logradouro,
          bairro:     data.bairro,
          cidade:     data.localidade,
          estado:     data.uf,
        });
      },
      error: () => { this.cepLoading = false; this.cepErro = true; },
    });
  }

  onSubmit(): void {
    this.enviado = true;
    this.limparErrosUnicidade();
    if (this.form.invalid) return;

    const cpf = this.form.value.cpf as string;
    const email = this.form.value.email as string;

    if (this.authService.cpfJaCadastrado(cpf)) {
      this.form.get('cpf')?.setErrors({ ...(this.form.get('cpf')?.errors ?? {}), cpfDuplicado: true });
      return;
    }

    if (this.authService.emailJaCadastrado(email)) {
      this.form.get('email')?.setErrors({ ...(this.form.get('email')?.errors ?? {}), emailDuplicado: true });
      return;
    }

    this.loading = true;

    const resultado = this.authService.cadastrarCliente({
      cpf,
      nome: this.form.value.nome as string,
      email,
      telefone: this.form.value.telefone as string,
      endereco: {
        cep: this.form.value.cep as string,
        logradouro: this.form.value.logradouro as string,
        numero: this.form.value.numero as string,
        complemento: this.form.value.complemento as string,
        bairro: this.form.value.bairro as string,
        cidade: this.form.value.cidade as string,
        estado: this.form.value.estado as string,
      },
    });

    if (!resultado.ok) {
      const control = this.form.get(resultado.campo);
      if (resultado.campo === 'cpf') {
        control?.setErrors({ ...(control?.errors ?? {}), cpfDuplicado: true });
      } else {
        control?.setErrors({ ...(control?.errors ?? {}), emailDuplicado: true });
      }

      this.loading = false;
      return;
    }

    this.senhaGerada = resultado.senhaGerada;
    this.loading = false;
    this.sucesso = true;
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  erro(campo: string): string {
    const control = this.form.get(campo);
    if (this.enviado && control?.hasError('cpfDuplicado')) {
      return 'CPF já cadastrado.';
    }

    if (this.enviado && control?.hasError('emailDuplicado')) {
      return 'E-mail já cadastrado.';
    }

    const nomes: Record<string, string> = {
      nome: 'Nome', cpf: 'CPF', email: 'E-mail', telefone: 'Telefone',
      cep: 'CEP', logradouro: 'Logradouro', numero: 'Número',
      bairro: 'Bairro', cidade: 'Cidade', estado: 'Estado',
    };
    return FormValidationHelper.getErrorMessage(campo, this.form.get(campo), this.enviado, {
      fieldNames: nomes,
      patternMessages: {
        cpf: 'CPF inválido (000.000.000-00).',
        telefone: 'Telefone inválido.',
        cep: 'CEP inválido (00000-000).',
      },
    });
  }

  inputClass(campo: string): string {
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return FormValidationHelper.getInputClass(hasError);
  }

  fecharModalSucesso(): void {
    this.sucesso = false;
  }

  private limparErrosUnicidade(): void {
    this.removerErro('cpf', 'cpfDuplicado');
    this.removerErro('email', 'emailDuplicado');
  }

  private removerErro(campo: string, erro: string): void {
    const control = this.form.get(campo);
    if (!control?.errors?.[erro]) return;

    const { [erro]: _, ...outrosErros } = control.errors;
    control.setErrors(Object.keys(outrosErros).length ? outrosErros : null);
  }

  get f() { return this.form.controls; }
}