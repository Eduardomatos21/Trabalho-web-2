import { Injectable } from '@angular/core';
import { SolicitacaoCliente } from '../shared/models/solicitacao.model';

const LS_CHAVE = "solicitacoes";

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {

  listarTodos(): SolicitacaoCliente[] {
    const solicitacoes = localStorage[LS_CHAVE];
    return solicitacoes ? JSON.parse(solicitacoes) : [];
  }

  inserir(solicitacao: SolicitacaoCliente): void {
    const solicitacoes = this.listarTodos();
    solicitacao.codigo = solicitacao.codigo ?? `SOL-${Date.now()}`;
    solicitacoes.push(solicitacao);
    localStorage[LS_CHAVE] = JSON.stringify(solicitacoes);
  }

  buscarPorCodigo(codigo: string): SolicitacaoCliente | undefined {
    const solicitacoes = this.listarTodos();
    return solicitacoes.find(s => s.codigo === codigo);
  }

  atualizar(solicitacao: SolicitacaoCliente): void {
    const solicitacoes = this.listarTodos();
    solicitacoes.forEach((obj, index, objs) => {
      if (solicitacao.codigo === obj.codigo) {
        objs[index] = solicitacao;
      }
    });
    localStorage[LS_CHAVE] = JSON.stringify(solicitacoes);
  }

  remover(codigo: string): void {
    let solicitacoes = this.listarTodos();
    solicitacoes = solicitacoes.filter(s => s.codigo !== codigo);
    localStorage[LS_CHAVE] = JSON.stringify(solicitacoes);
  }
}