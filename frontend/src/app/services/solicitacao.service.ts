import { Injectable } from '@angular/core';
import { Solicitacao } from '../shared/models/solicitacao.model';

const LS_CHAVE = "solicitacoes";

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {

  listarTodos(): Solicitacao[] {
    const solicitacoes = localStorage[LS_CHAVE];
    return solicitacoes ? JSON.parse(solicitacoes) : [];
  }

  inserir(solicitacao: Solicitacao): void {
    const solicitacoes = this.listarTodos();
    solicitacao.id = new Date().getTime();
    solicitacoes.push(solicitacao);
    localStorage[LS_CHAVE] = JSON.stringify(solicitacoes);
  }

  buscarPorId(id: number): Solicitacao | undefined {
    const solicitacoes = this.listarTodos();
    return solicitacoes.find(s => s.id === id);
  }

  atualizar(solicitacao: Solicitacao): void {
    const solicitacoes = this.listarTodos();
    solicitacoes.forEach((obj, index, objs) => {
      if (solicitacao.id === obj.id) {
        objs[index] = solicitacao;
      }
    });
    localStorage[LS_CHAVE] = JSON.stringify(solicitacoes);
  }

  remover(id: number): void {
    let solicitacoes = this.listarTodos();
    solicitacoes = solicitacoes.filter(s => s.id !== id);
    localStorage[LS_CHAVE] = JSON.stringify(solicitacoes);
  }
}