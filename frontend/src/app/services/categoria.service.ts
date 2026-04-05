import { Injectable } from '@angular/core';
import { Categoria } from '../shared/models/categoria.model';

const LS_CHAVE = "categorias";

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
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
