import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type PerfilUsuario = 'cliente' | 'funcionario';

export interface UsuarioMock {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioStorageKey = 'usuarioLogado';

  // Usuários fixos para demonstração do protótipo sem backend.
  private readonly usuariosMock: UsuarioMock[] = [
    {
      nome: 'Cliente Demo',
      email: 'cliente@demo.com',
      senha: '1234',
      perfil: 'cliente',
    },
    {
      nome: 'Funcionario Demo',
      email: 'funcionario@demo.com',
      senha: '1234',
      perfil: 'funcionario',
    },
    {
      nome: 'Maria',
      email: 'maria@demo.com',
      senha: '1234',
      perfil: 'funcionario',
    },
    {
      nome: 'Mario',
      email: 'mario@demo.com',
      senha: '1234',
      perfil: 'funcionario',
    },
  ];

  constructor(private router: Router) {}

  login(email: string, senha: string): { ok: true; usuario: UsuarioMock } | { ok: false; message: string } {
    const usuario = this.usuariosMock.find(
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
    return this.usuariosMock;
  }

  getFuncionariosSistema(): string[] {
    const funcionarios = this.usuariosMock
      .filter((usuario) => usuario.perfil === 'funcionario')
      .map((usuario) => usuario.nome.trim())
      .filter((nome) => nome.length > 0);

    return [...new Set(funcionarios)];
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
}
