import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap } from 'rxjs';
import { Categoria } from '../shared/models/categoria.model';

const LS_CHAVE = "categorias";

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly apiBaseUrl = 'http://localhost:8081';
  private categoriasCache: Categoria[] = [];
  private requisicaoCategorias$?: Observable<Categoria[]>;

  constructor(private http: HttpClient) {}

  private readonly categoriasIniciais: Categoria[] = [
    new Categoria(1, 'NOTEBOOK'),
    new Categoria(2, 'DESKTOP'),
    new Categoria(3, 'TECLADO'),
    new Categoria(4, 'IMPRESSORA'),
    new Categoria(5, 'MOUSE'),
  ];

  listarTodos(): Categoria[] {
    const categorias = localStorage[LS_CHAVE];
    if (!categorias) {
      localStorage[LS_CHAVE] = JSON.stringify(this.categoriasIniciais);
      return [...this.categoriasIniciais];
    }

    try {
      const atuais = JSON.parse(categorias) as Categoria[];
      if (!Array.isArray(atuais)) {
        localStorage[LS_CHAVE] = JSON.stringify(this.categoriasIniciais);
        return [...this.categoriasIniciais];
      }

      return atuais;
    } catch {
      localStorage[LS_CHAVE] = JSON.stringify(this.categoriasIniciais);
      return [...this.categoriasIniciais];
    }
  }

  listarTodosApi(): Observable<Categoria[]> {
    if (this.categoriasCache.length > 0) {
      return of([...this.categoriasCache]);
    }

    if (this.requisicaoCategorias$) {
      return this.requisicaoCategorias$;
    }

    this.requisicaoCategorias$ = this.http
      .get<Categoria[]>(`${this.apiBaseUrl}/categoria`)
      .pipe(
        catchError(() => of(this.listarTodos())),
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
  inserir(categoria: Categoria): void {
    const categorias = this.listarTodos();
    categoria.nome = this.normalizarNome(categoria.nome);
    categoria.id = this.gerarNovoId(categorias);
    categorias.push(categoria);
    localStorage[LS_CHAVE] = JSON.stringify(categorias);
  }

  nomeJaCadastrado(nome: string, ignorarId?: number): boolean {
    const nomeNormalizado = this.normalizarNome(nome);
    if (!nomeNormalizado) return false;

    return this.listarTodos().some((categoria) => {
      if (ignorarId !== undefined && categoria.id === ignorarId) {
        return false;
      }

      return this.normalizarNome(categoria.nome) === nomeNormalizado;
    });
  }

  buscarPorId(id: number): Categoria | undefined {
    const categorias = this.listarTodos();
    return categorias.find((categoria) => categoria.id === id);
  }

  private gerarNovoId(categorias: Categoria[]): number {
    const maiorId = categorias.reduce((max, categoria) => Math.max(max, categoria.id ?? 0), 0);
    return maiorId + 1;
  }
  atualizar(categoria: Categoria): void {
  const categorias = this.listarTodos();
  categorias.forEach((obj, index, objs) => {
    if (categoria.id === obj.id) {
      objs[index] = categoria;
    }
  });
  localStorage[LS_CHAVE] = JSON.stringify(categorias);
}
  remover(id: number): void {
    let categorias = this.listarTodos();
    categorias = categorias.filter((categoria) => categoria.id !== id);
    localStorage[LS_CHAVE] = JSON.stringify(categorias);
  }

  private normalizarNome(nome: string): string {
    return nome.trim().toUpperCase();
  }
}
