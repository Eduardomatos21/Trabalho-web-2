import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, FormFieldComponent, ModalComponent } from '../shared';

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
    if (this.form.invalid) return;
    this.loading = true;
    // TODO: chamar CadastroService.cadastrar(this.form.value)
    this.loading = false;
    this.sucesso = true;
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  erro(campo: string): string {
    if (!this.enviado) return '';
    const ctrl = this.form.get(campo);
    if (!ctrl?.errors) return '';
    const e = ctrl.errors;
    const nomes: Record<string, string> = {
      nome: 'Nome', cpf: 'CPF', email: 'E-mail', telefone: 'Telefone',
      cep: 'CEP', logradouro: 'Logradouro', numero: 'N\u00famero',
      bairro: 'Bairro', cidade: 'Cidade', estado: 'Estado',
    };
    if (e['required'])  return `${nomes[campo] ?? campo} \u00e9 obrigat\u00f3rio.`;
    if (e['email'])     return 'E-mail inv\u00e1lido.';
    if (e['minlength']) return `M\u00ednimo de ${e['minlength'].requiredLength} caracteres.`;
    if (e['pattern']) {
      const msgs: Record<string, string> = {
        cpf:      'CPF inv\u00e1lido (000.000.000-00).',
        telefone: 'Telefone inv\u00e1lido.',
        cep:      'CEP inv\u00e1lido (00000-000).',
      };
      return msgs[campo] ?? 'Formato inv\u00e1lido.';
    }
    return 'Campo inv\u00e1lido.';
  }

  inputClass(campo: string): string {
    const base = 'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white';
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return `${base} ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;
  }

  get f() { return this.form.controls; }
}