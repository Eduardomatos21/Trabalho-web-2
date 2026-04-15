import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { FuncionarioService } from './funcionario';

export type PerfilUsuario = 'cliente' | 'funcionario';

export interface UsuarioAutenticado {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  token: string;
  expiraEm: string;
}

interface SessaoApiResponse {
  token: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  expiraEm: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:8081';
  private readonly usuarioStorageKey = 'usuarioLogado';

  constructor(
    private router: Router,
    private http: HttpClient,
    private funcionarioService: FuncionarioService,
  ) {}

  login(email: string, senha: string): Observable<UsuarioAutenticado> {
    return this.http
      .post<SessaoApiResponse>(`${this.apiBaseUrl}/auth/login`, {
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
      })
      .pipe(
        map((response) => {
          const usuario: UsuarioAutenticado = {
            nome: response.nome,
            email: response.email,
            perfil: response.perfil,
            token: response.token,
            expiraEm: response.expiraEm,
          };

          localStorage.setItem(this.usuarioStorageKey, JSON.stringify(usuario));
          return usuario;
        }),
      );
  }

  navegarPosLogin(perfil: PerfilUsuario): void {
    this.router.navigate([perfil === 'funcionario' ? '/funcionario' : '/cliente']);
  }

  getFuncionariosSistema(): string[] {
    const funcionarios = this.funcionarioService
      .listarTodos()
      .map((funcionario) => funcionario.nome.trim())
      .filter((nome) => nome.length > 0);

    return [...new Set(funcionarios)];
  }

  emailJaCadastrado(email: string): boolean {
    const emailNormalizado = this.normalizarEmail(email);
    return this.funcionarioService
      .listarTodos()
      .some((funcionario) => this.normalizarEmail(funcionario.email) === emailNormalizado);
  }

  getUsuarioLogado(): UsuarioAutenticado | undefined {
    const raw = localStorage.getItem(this.usuarioStorageKey);
    if (!raw) return undefined;

    try {
      const usuario = JSON.parse(raw) as Partial<UsuarioAutenticado>;
      if (
        typeof usuario.nome === 'string' &&
        typeof usuario.email === 'string' &&
        typeof usuario.perfil === 'string' &&
        typeof usuario.token === 'string' &&
        typeof usuario.expiraEm === 'string'
      ) {
        if (this.sessaoExpirada(usuario.expiraEm)) {
          localStorage.removeItem(this.usuarioStorageKey);
          return undefined;
        }

        return usuario as UsuarioAutenticado;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  logout(): void {
    const token = this.getToken();
    if (!token) {
      this.encerrarSessaoLocal();
      return;
    }

    this.http.post<void>(`${this.apiBaseUrl}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .pipe(catchError(() => of(void 0)))
      .subscribe(() => {
        this.encerrarSessaoLocal();
      });
  }

  getToken(): string | null {
    const usuario = this.getUsuarioLogado();
    return usuario?.token ?? null;
  }

  extrairMensagemErroLogin(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    const mensagem = this.extrairMensagemErro(error);
    if (mensagem) {
      return mensagem;
    }

    return 'Não foi possível realizar login agora. Tente novamente.';
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private sessaoExpirada(expiraEm: string): boolean {
    const expiraEmDate = new Date(expiraEm);
    if (Number.isNaN(expiraEmDate.getTime())) {
      return true;
    }

    return expiraEmDate.getTime() <= Date.now();
  }

  private encerrarSessaoLocal(): void {
    localStorage.removeItem(this.usuarioStorageKey);
    this.router.navigate(['/login']);
  }

  private extrairMensagemErro(error: HttpErrorResponse): string | undefined {
    if (!error.error) {
      return undefined;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    const message = (error.error.message as string | undefined) ?? (error.error.error as string | undefined);
    return message?.trim() || undefined;
  }
}
