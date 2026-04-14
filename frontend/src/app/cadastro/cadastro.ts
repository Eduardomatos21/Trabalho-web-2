import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonComponent, FormFieldComponent, ModalComponent } from '../shared';
import { FormValidationHelper } from '../shared/utils';

interface AutocadastroClientePayload {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: {
    cep: string;
    numero: string;
    complemento?: string;
  };
}

interface AutocadastroClienteResponse {
  idCliente: number;
  email: string;
  mensagem: string;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ButtonComponent, FormFieldComponent, ModalComponent],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private readonly apiBaseUrl = 'http://localhost:8081';

  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

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
  mensagemSucesso = 'Cadastro concluido. A senha temporaria foi enviada por e-mail.';
  erroServidor = '';
  private campoConflitoPendente: 'cpf' | 'email' | null = null;

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.erroServidor = '';
    });

    this.form.get('cpf')?.valueChanges.subscribe(() => {
      this.removerErro('cpf', 'cpfDuplicado');
      this.campoConflitoPendente = this.campoConflitoPendente === 'cpf' ? null : this.campoConflitoPendente;
      this.erroServidor = '';
    });

    this.form.get('email')?.valueChanges.subscribe(() => {
      this.removerErro('email', 'emailDuplicado');
      this.campoConflitoPendente = this.campoConflitoPendente === 'email' ? null : this.campoConflitoPendente;
      this.erroServidor = '';
    });
  }


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
    if (this.loading) return;

    this.enviado = true;
    this.limparErrosUnicidade();
    this.erroServidor = '';
    this.campoConflitoPendente = null;
    if (this.form.invalid) return;

    this.loading = true;
    this.form.disable({ emitEvent: false });

    const raw = this.form.getRawValue();

    const payload: AutocadastroClientePayload = {
      cpf: raw.cpf as string,
      nome: raw.nome as string,
      email: raw.email as string,
      telefone: raw.telefone as string,
      endereco: {
        cep: raw.cep as string,
        numero: raw.numero as string,
        complemento: raw.complemento as string,
      },
    };

    this.http
      .post<AutocadastroClienteResponse>(`${this.apiBaseUrl}/clientes/autocadastro`, payload, { observe: 'response' })
      .pipe(finalize(() => {
        this.loading = false;
        this.form.enable({ emitEvent: false });
        this.aplicarErroConflitoPendente();
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = response.body?.mensagem ?? this.mensagemSucesso;
          this.sucesso = true;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.tratarErroCadastro(error);
          this.cdr.detectChanges();
        },
      });
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

  private tratarErroCadastro(error: HttpErrorResponse): void {
    const mensagemRaw = this.extrairMensagemErro(error);
    const mensagem = this.normalizarMensagemErro(mensagemRaw, error.status);

    if (error.status === HttpStatusCode.Conflict) {
      const campoConflito = this.identificarCampoConflito(mensagemRaw);

      if (campoConflito === 'cpf') {
        this.campoConflitoPendente = 'cpf';
        this.erroServidor = 'CPF ja cadastrado.';
        return;
      }

      if (campoConflito === 'email') {
        this.campoConflitoPendente = 'email';
        this.erroServidor = 'E-mail ja cadastrado.';
        return;
      }

      this.erroServidor = 'CPF ou e-mail ja cadastrado.';
      return;
    }

    this.erroServidor = mensagem ?? 'Nao foi possivel concluir o cadastro agora.';
  }

  private extrairMensagemErro(error: HttpErrorResponse): string | undefined {
    if (!error.error) {
      return undefined;
    }

    if (typeof error.error === 'string') {
      try {
        const parsed = JSON.parse(error.error) as { message?: string; error?: string };
        return parsed.message ?? parsed.error;
      } catch {
        return error.error;
      }
    }

    return (error.error.message as string | undefined) ?? (error.error.error as string | undefined);
  }

  private normalizarMensagemErro(mensagem: string | undefined, status: number): string | undefined {
    if (!mensagem) {
      return undefined;
    }

    const limpa = mensagem.trim();
    const lower = limpa.toLowerCase();

    if (lower === 'conflict') {
      return status === HttpStatusCode.Conflict ? 'CPF ou e-mail ja cadastrado.' : undefined;
    }

    if (lower === 'bad request') {
      return 'Dados invalidos. Verifique os campos e tente novamente.';
    }

    if (lower === 'unsupported media type') {
      return 'Falha no formato da requisicao. Atualize a pagina e tente novamente.';
    }

    return limpa;
  }

  private identificarCampoConflito(mensagem: string | undefined): 'cpf' | 'email' | null {
    if (!mensagem) {
      return null;
    }

    const lower = mensagem.toLowerCase();
    const temCpf = lower.includes('cpf');
    const temEmail = lower.includes('e-mail') || lower.includes('email');

    if (temCpf && !temEmail) {
      return 'cpf';
    }

    if (temEmail && !temCpf) {
      return 'email';
    }

    return null;
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

  private aplicarErroConflitoPendente(): void {
    if (!this.campoConflitoPendente) {
      return;
    }

    if (this.campoConflitoPendente === 'cpf') {
      const control = this.form.get('cpf');
      control?.setErrors({ ...(control.errors ?? {}), cpfDuplicado: true });
    } else {
      const control = this.form.get('email');
      control?.setErrors({ ...(control.errors ?? {}), emailDuplicado: true });
    }

    this.campoConflitoPendente = null;
  }

  get f() { return this.form.controls; }
}