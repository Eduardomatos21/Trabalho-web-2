import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Funcionario } from '../shared/models/funcionario.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private readonly apiBaseUrl = 'http://localhost:8081';
  private http = inject(HttpClient);
  
  private funcionarios: Funcionario[] = [];
  private carregado = false;

  constructor() {
    this.carregarDoBackend();
  }

  private getHttpOptions() {
    let headers = new HttpHeaders();
    try {
      const raw = localStorage.getItem('usuarioLogado');
      if (raw) {
        const usuario = JSON.parse(raw);
        if (usuario && usuario.token) {
          headers = headers.set('Authorization', `Bearer ${usuario.token}`);
        }
      }
    } catch {}
    return { headers };
  }

  private carregarDoBackend() {
    this.http.get<Funcionario[]>(`${this.apiBaseUrl}/funcionarios`, this.getHttpOptions()).subscribe({
      next: (res) => {
        this.funcionarios.splice(0, this.funcionarios.length, ...res);
        this.carregado = true;
      },
      error: (err) => console.error('Erro ao carregar do backend', err)
    });
  }

  listarTodosBackend(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(`${this.apiBaseUrl}/funcionarios`, this.getHttpOptions()).pipe(
      tap((res) => {
        this.funcionarios.splice(0, this.funcionarios.length, ...res);
        this.carregado = true;
      }),
    );
  }

  buscarPorIdBackend(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiBaseUrl}/funcionarios/${id}`, this.getHttpOptions());
  }

  listarTodos(): Funcionario[] {
    if (!this.carregado && this.funcionarios.length === 0) {
      this.carregarDoBackend();
    }
    return this.funcionarios;
  }
  
  inserir(funcionario : Funcionario) : void {
    const tempId = new Date().getTime();
    funcionario.id = tempId;
    this.funcionarios.push(funcionario);

    this.http.post<Funcionario>(`${this.apiBaseUrl}/funcionarios`, funcionario, this.getHttpOptions()).subscribe({
      next: (res) => {
        const index = this.funcionarios.findIndex(f => f.id === tempId);
        if (index !== -1) {
          this.funcionarios[index] = res;
        }
      },
      error: () => {
        const index = this.funcionarios.findIndex(f => f.id === tempId);
        if (index !== -1) this.funcionarios.splice(index, 1);
      }
    });
  }

  inserirBackend(funcionario: Funcionario): Observable<Funcionario> {
    return this.http.post<Funcionario>(`${this.apiBaseUrl}/funcionarios`, funcionario, this.getHttpOptions()).pipe(
      tap((res) => {
        const index = this.funcionarios.findIndex((f) => f.id === funcionario.id);
        if (index !== -1) {
          this.funcionarios[index] = res;
        } else {
          this.funcionarios.push(res);
        }
      }),
    );
  }

  buscarPorId(id: number): Funcionario | undefined {
    return this.funcionarios.find(funcionario => funcionario.id === id);
  }

  buscarPorEmail(email: string): Funcionario | undefined {
    return this.funcionarios.find(funcionario => funcionario.email.toLowerCase() === email.toLowerCase());
  }

  atualizar(funcionario : Funcionario): void {
    const index = this.funcionarios.findIndex(f => f.id === funcionario.id);
    const original = index !== -1 ? { ...this.funcionarios[index] } : undefined;
    
    if (index !== -1) {
      this.funcionarios[index] = funcionario;
    }

    this.http.put<Funcionario>(`${this.apiBaseUrl}/funcionarios/${funcionario.id}`, funcionario, this.getHttpOptions()).subscribe({
      next: (res) => {
        if (index !== -1) this.funcionarios[index] = res;
      },
      error: () => {
        if (original && index !== -1) this.funcionarios[index] = original as Funcionario;
      }
    });
  }

  atualizarBackend(funcionario: Funcionario): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiBaseUrl}/funcionarios/${funcionario.id}`, funcionario, this.getHttpOptions()).pipe(
      tap((res) => {
        const index = this.funcionarios.findIndex((f) => f.id === funcionario.id);
        if (index !== -1) this.funcionarios[index] = res;
      }),
    );
  }

  remover(id: number): void {
    const index = this.funcionarios.findIndex(f => f.id === id);
    const original = index !== -1 ? { ...this.funcionarios[index] } : undefined;
    
    if (index !== -1) {
      this.funcionarios.splice(index, 1);
    }

    this.http.delete(`${this.apiBaseUrl}/funcionarios/${id}`, this.getHttpOptions()).subscribe({
      next: () => {},
      error: () => {
        if (original) this.funcionarios.push(original as Funcionario);
      }
    });
  }

  removerBackend(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/funcionarios/${id}`, this.getHttpOptions()).pipe(
      tap(() => {
        const index = this.funcionarios.findIndex((f) => f.id === id);
        if (index !== -1) this.funcionarios.splice(index, 1);
      }),
    );
  }

}
