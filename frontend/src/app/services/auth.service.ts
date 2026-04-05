import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FuncionarioService } from './funcionario';

export type PerfilUsuario = 'cliente' | 'funcionario';

export interface UsuarioMock {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

export interface EnderecoCadastroCliente {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface ClienteCadastro {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: EnderecoCadastroCliente;
  senha: string;
}

export interface NovoClienteCadastro {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: EnderecoCadastroCliente;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioStorageKey = 'usuarioLogado';
  private readonly clientesStorageKey = 'clientesCadastrados';

  private readonly clientesIniciais: ClienteCadastro[] = [
    {
      cpf: '111.111.111-11',
      nome: 'José',
      email: 'jose@demo.com',
      telefone: '(11) 98888-1111',
      endereco: {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        numero: '100',
        complemento: '',
        bairro: 'Sé',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      senha: '1234',
    },
    {
      cpf: '222.222.222-22',
      nome: 'João',
      email: 'joao@demo.com',
      telefone: '(21) 97777-2222',
      endereco: {
        cep: '20040-010',
        logradouro: 'Rua da Quitanda',
        numero: '250',
        complemento: '',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
      },
      senha: '1234',
    },
    {
      cpf: '333.333.333-33',
      nome: 'Joana',
      email: 'joana@demo.com',
      telefone: '(31) 96666-3333',
      endereco: {
        cep: '30130-010',
        logradouro: 'Avenida Afonso Pena',
        numero: '900',
        complemento: 'Sala 305',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        estado: 'MG',
      },
      senha: '1234',
    },
    {
      cpf: '444.444.444-44',
      nome: 'Joaquina',
      email: 'joaquina@demo.com',
      telefone: '(41) 95555-4444',
      endereco: {
        cep: '80010-000',
        logradouro: 'Rua XV de Novembro',
        numero: '450',
        complemento: '',
        bairro: 'Centro',
        cidade: 'Curitiba',
        estado: 'PR',
      },
      senha: '1234',
    },
  ];

  // Usuários fixos para demonstração do protótipo sem backend.
  private readonly usuariosMock: UsuarioMock[] = [
    {
      nome: 'Maria',
      email: 'maria@demo.com',
      senha: '1234',
      perfil: 'funcionario',
    },
    {
      nome: 'Mário',
      email: 'mario@demo.com',
      senha: '1234',
      perfil: 'funcionario',
    },
  ];

  constructor(
    private router: Router,
    private funcionarioService: FuncionarioService,
  ) {}

  login(email: string, senha: string): { ok: true; usuario: UsuarioMock } | { ok: false; message: string } {
    const usuariosSistema = this.getUsuariosDemo();
    const usuario = usuariosSistema.find(
      (item) => item.email.toLowerCase() === email.toLowerCase().trim() && item.senha === senha,
    );

    if (!usuario) {
      return { ok: false, message: 'Credenciais inválidas(demonstração).' };
    }

    localStorage.setItem(this.usuarioStorageKey, JSON.stringify(usuario));
    return { ok: true, usuario };
  }

  navegarPosLogin(perfil: PerfilUsuario): void {
    this.router.navigate([perfil === 'funcionario' ? '/funcionario' : '/cliente']);
  }

  getUsuariosDemo(): UsuarioMock[] {
    const clientes = this.carregarClientesCadastro().map((cliente) => ({
      nome: cliente.nome,
      email: cliente.email,
      senha: cliente.senha,
      perfil: 'cliente' as const,
    }));
    const funcionarios = this.funcionarioService.listarTodos().map((funcionario) => ({
      nome: funcionario.nome,
      email: funcionario.email,
      senha: funcionario.senha,
      perfil: 'funcionario' as const,
    }));

    return [...clientes, ...funcionarios];
  }

  getFuncionariosSistema(): string[] {
    const funcionarios = this.funcionarioService
      .listarTodos()
      .map((funcionario) => funcionario.nome.trim())
      .filter((nome) => nome.length > 0);

    return [...new Set(funcionarios)];
  }

  cadastrarCliente(novoCliente: NovoClienteCadastro):
    | { ok: true; senhaGerada: string }
    | { ok: false; campo: 'cpf' | 'email'; message: string } {
    const cpfNormalizado = this.normalizarCpf(novoCliente.cpf);
    const emailNormalizado = this.normalizarEmail(novoCliente.email);

    if (this.cpfJaCadastrado(cpfNormalizado)) {
      return { ok: false, campo: 'cpf', message: 'CPF já cadastrado.' };
    }

    if (this.emailJaCadastrado(emailNormalizado)) {
      return { ok: false, campo: 'email', message: 'E-mail já cadastrado.' };
    }

    const senhaGerada = this.gerarSenhaNumerica4Digitos();
    const clientes = this.carregarClientesCadastro();

    const clienteSalvo: ClienteCadastro = {
      cpf: novoCliente.cpf.trim(),
      nome: novoCliente.nome.trim(),
      email: emailNormalizado,
      telefone: novoCliente.telefone.trim(),
      endereco: {
        cep: novoCliente.endereco.cep.trim(),
        logradouro: novoCliente.endereco.logradouro.trim(),
        numero: novoCliente.endereco.numero.trim(),
        complemento: (novoCliente.endereco.complemento ?? '').trim(),
        bairro: novoCliente.endereco.bairro.trim(),
        cidade: novoCliente.endereco.cidade.trim(),
        estado: novoCliente.endereco.estado.trim().toUpperCase(),
      },
      senha: senhaGerada,
    };

    clientes.push(clienteSalvo);
    localStorage.setItem(this.clientesStorageKey, JSON.stringify(clientes));

    return { ok: true, senhaGerada };
  }

  cpfJaCadastrado(cpf: string): boolean {
    const cpfNormalizado = this.normalizarCpf(cpf);
    return this.carregarClientesCadastro().some((cliente) => this.normalizarCpf(cliente.cpf) === cpfNormalizado);
  }

  emailJaCadastrado(email: string): boolean {
    const emailNormalizado = this.normalizarEmail(email);
    return this.getUsuariosDemo().some((usuario) => this.normalizarEmail(usuario.email) === emailNormalizado);
  }

  getUsuarioLogado(): UsuarioMock | undefined {
    const raw = localStorage.getItem(this.usuarioStorageKey);
    if (!raw) return undefined;

    try {
      const usuario = JSON.parse(raw) as Partial<UsuarioMock>;
      if (
        typeof usuario.nome === 'string' &&
        typeof usuario.email === 'string' &&
        typeof usuario.perfil === 'string'
      ) {
        return usuario as UsuarioMock;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  logout(): void {
    localStorage.removeItem(this.usuarioStorageKey);
    this.router.navigate(['/login']);
  }

  private carregarClientesCadastro(): ClienteCadastro[] {
    const raw = localStorage.getItem(this.clientesStorageKey);
    if (!raw) {
      localStorage.setItem(this.clientesStorageKey, JSON.stringify(this.clientesIniciais));
      return [...this.clientesIniciais];
    }

    try {
      const data = JSON.parse(raw) as ClienteCadastro[];
      if (!Array.isArray(data)) {
        localStorage.setItem(this.clientesStorageKey, JSON.stringify(this.clientesIniciais));
        return [...this.clientesIniciais];
      }

      return data;
    } catch {
      localStorage.setItem(this.clientesStorageKey, JSON.stringify(this.clientesIniciais));
      return [...this.clientesIniciais];
    }
  }

  private gerarSenhaNumerica4Digitos(): string {
    return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizarCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }
}
