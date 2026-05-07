import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
import { Categoria } from '../shared/models/categoria.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly apiBaseUrl = 'http://localhost:8081';
  private categoriasCache: Categoria[] = [];
  private requisicaoCategorias$?: Observable<Categoria[]>;

  constructor(private http: HttpClient) {}

  listarTodosApi(): Observable<Categoria[]> {
    if (this.categoriasCache.length > 0) {
      return of(this.filtrarAtivas(this.categoriasCache));
    }

    if (this.requisicaoCategorias$) {
      return this.requisicaoCategorias$;
    }

    this.requisicaoCategorias$ = this.http
      .get<Categoria[]>(`${this.apiBaseUrl}/categoria`)
      .pipe(
        tap((categorias) => {
          this.categoriasCache = [...categorias];
        }),
        finalize(() => {
          this.requisicaoCategorias$ = undefined;
        }),
        shareReplay(1),
      );

    return this.requisicaoCategorias$;
  }

  buscarPorIdApi(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiBaseUrl}/categoria/${id}`);
  }

  criar(categoria: Categoria): Observable<Categoria> {
    const payload = { nome: this.normalizarNome(categoria.nome) };
    return this.http.post<Categoria>(`${this.apiBaseUrl}/categoria`, payload).pipe(
      tap((novaCategoria) => this.atualizarCache(novaCategoria)),
    );
  }

  atualizarApi(categoria: Categoria): Observable<Categoria> {
    const payload = { nome: this.normalizarNome(categoria.nome) };
    return this.http.put<Categoria>(`${this.apiBaseUrl}/categoria/${categoria.id}`, payload).pipe(
      tap((categoriaAtualizada) => this.atualizarCache(categoriaAtualizada)),
    );
  }

  desativarApi(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/categoria/${id}`).pipe(
      tap(() => {
        this.categoriasCache = this.categoriasCache.map((categoria) =>
          categoria.id === id ? { ...categoria, ativo: false } : categoria,
        );
      }),
    );
  }

  precarregarCategorias(): void {
    this.listarTodosApi().subscribe({
      next: () => {
        // Prefetch silencioso para evitar atraso no primeiro acesso ao select.
      },
      error: () => {
        // Erros serao tratados pela tela que consome as categorias.
      },
    });
  }

  nomeJaCadastrado(nome: string, ignorarId?: number): boolean {
    const nomeNormalizado = this.normalizarNome(nome);
    if (!nomeNormalizado) return false;

    return this.categoriasCache.some((categoria) => {
      if (ignorarId !== undefined && categoria.id === ignorarId) {
        return false;
      }

      if (categoria.ativo === false) {
        return false;
      }

      return this.normalizarNome(categoria.nome) === nomeNormalizado;
    });
  }

  private atualizarCache(categoria: Categoria): void {
    this.categoriasCache = this.categoriasCache.filter((item) => item.id !== categoria.id);
    this.categoriasCache.push(categoria);
    this.categoriasCache.sort((a, b) => a.id - b.id);
  }

  private filtrarAtivas(categorias: Categoria[]): Categoria[] {
    return categorias.filter((categoria) => categoria.ativo !== false);
  }

  private normalizarNome(nome: string): string {
    return nome.trim().toUpperCase();
  }
}
