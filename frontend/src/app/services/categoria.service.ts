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

    const atuais = JSON.parse(categorias) as Categoria[];
    const map = new Map<string, Categoria>();

    for (const inicial of this.categoriasIniciais) {
      map.set(inicial.nome.trim().toUpperCase(), inicial);
    }

    for (const categoria of atuais) {
      if (!categoria?.nome) continue;
      map.set(categoria.nome.trim().toUpperCase(), categoria);
    }

    const normalizadas = [...map.values()];
    if (normalizadas.length !== atuais.length) {
      localStorage[LS_CHAVE] = JSON.stringify(normalizadas);
    }

    return normalizadas;
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
