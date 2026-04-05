import { Injectable } from '@angular/core';
import { Categoria } from '../shared/models/categoria.model';

const LS_CHAVE = "categorias";

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly categoriasIniciais: Categoria[] = [
    new Categoria(1, 'NOTEBOOK'),
    new Categoria(2, 'MONITOR'),
    new Categoria(3, 'TECLADO'),
    new Categoria(4, 'IMPRESSORA'),
    new Categoria(5, 'MOUSE'),
  ];

  listarTodos(): Categoria[] {
    const categorias = localStorage[LS_CHAVE];
    if (categorias) return JSON.parse(categorias);

    localStorage[LS_CHAVE] = JSON.stringify(this.categoriasIniciais);
    return [...this.categoriasIniciais];
  }
  inserir(categoria: Categoria): void {
    const categorias = this.listarTodos();
    categoria.id = this.gerarNovoId(categorias);
    categorias.push(categoria);
    localStorage[LS_CHAVE] = JSON.stringify(categorias);
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
}
