import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, FuncionarioService } from '../../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../../shared';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { Funcionario } from '../../../../shared/models/funcionario.model';

@Component({
  selector: 'app-editar-funcionario',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SidebarComponent, FormFieldComponent],
  templateUrl: './editar-funcionario.html',
  styleUrl: './editar-funcionario.css',
})

export class EditarFuncionario implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private funcionarioService = inject(FuncionarioService);
  
  form: FormGroup;
  funcionarioId: number | null = null;
  carregando = false;
  emailOriginal: string = '';

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.minLength(10), Validators.email]],
      dataNascimento: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]],
      senha: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.funcionarioId = Number(id);
        const funcionario = this.funcionarioService.buscarPorId(this.funcionarioId);
        if (funcionario) {
          this.emailOriginal = funcionario.email;
          this.form.patchValue({
             nome: funcionario.nome,
             email: funcionario.email,
             dataNascimento: funcionario.dataNascimento,
             senha: funcionario.senha
            });
        }
      }
    this.form.get('email')?.valueChanges.subscribe(() => {
    this.validarEmailUnico();
  });

    });
  }

  validarEmailUnico(): void {

  const emailControl = this.form.get('email');
  const email = emailControl?.value?.trim();
  
  if (!email) return;

    if (this.funcionarioId && email === this.emailOriginal) {
    if (emailControl?.hasError('emailDuplicado')) {
      emailControl?.setErrors(null);
    }
    return;
  }

  const emailExiste = this.funcionarioService.buscarPorEmail(email);
  
  if (emailExiste) {
    emailControl?.setErrors({ emailDuplicado: true });
  } else if (emailControl?.hasError('emailDuplicado')) {
    emailControl?.setErrors(null);
  }

  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.carregando = true;
    const nome = this.form.value.nome.trim();
    const email = this.form.value.email.trim();
    const dataNascimento = this.form.value.dataNascimento.trim();
    const senha = this.form.value.senha.trim();

    
    if (this.funcionarioId) {  
      const funcionario = this.funcionarioService.buscarPorId(this.funcionarioId);
      if (funcionario) {
        funcionario.nome = nome;
        funcionario.email = email;
        funcionario.dataNascimento = dataNascimento;
        funcionario.senha = senha;
        this.funcionarioService.atualizar(funcionario);
      }
    } else {
      const novoFuncionario = { nome: nome } as Funcionario;
      this.funcionarioService.inserir(novoFuncionario);
    }

    this.router.navigate(['/funcionario/listar']);
  }

  cancelar(): void {
    this.router.navigate(['/funcionario/listar']);
  }

  logout(): void {
    this.authService.logout();
  }

  get titulo(): string {
    return this.funcionarioId ? 'Editar funcionário' : 'Novo funcionário';
  }

  get nomeControl() {
    return this.form.get('nome');
  }

  erroNome(): string {
    if (!this.nomeControl?.touched && !this.nomeControl?.dirty) {
      return '';
    }
    if (this.nomeControl?.hasError('required')) {
      return 'Nome é obrigatório.';
    }
    if (this.nomeControl?.hasError('minlength')) {
      return 'Nome precisa ter pelo menos 3 caracteres.';
    }
    return '';
  }

  get emailControl() {
    return this.form.get('email');
  }

    erroEmail(): string {
    if (!this.emailControl?.touched && !this.emailControl?.dirty) {
      return '';
    }
    if (this.emailControl?.hasError('required')) {
      return 'Email é obrigatório.';
    }
    if (this.emailControl?.hasError('emailDuplicado')) {
      return 'Email já cadastrado';
    }
    return '';
  }

  get dataNascimentoControl() {
    return this.form.get('dataNascimento');
  }
  
  erroDataNascimento(): string {
    const control = this.form.get('dataNascimento');
    
    if (!control?.touched && !control?.dirty) {
      return '';
    }
    
    if (control?.hasError('required')) {
      return 'Data de nascimento é obrigatória.';
    }
    
    if (control?.hasError('pattern')) {
      return 'Formato inválido. Use DD/MM/AAAA (exemplo: 15/11/1993).';
    }
    
    return '';
  }
 

  get senhaControl() {
    return this.form.get('senha');
  }

  erroSenha(): string {
    if (!this.senhaControl?.touched && !this.senhaControl?.dirty) {
      return '';
    }
    if (this.senhaControl?.hasError('required')) {
      return 'Senha é obrigatória.';
    }
    if (this.senhaControl?.hasError('minlength')) {
      return 'Senha precisa ter 4 caracteres.';
    }
    if (this.senhaControl?.hasError('maxlength')) {
      return 'Senha precisa ter 4 caracteres.';
    }
    return '';
  }

}


