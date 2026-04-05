import { Injectable } from '@angular/core';
import { Funcionario } from '../shared/models/funcionario.model';

const LS_CHAVE = "funcionarios"

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {

  listarTodos(): Funcionario[] {
    const funcionarios = localStorage[LS_CHAVE];
    return funcionarios ? JSON.parse(funcionarios) : [];
  }
  
  inserir(funcionario : Funcionario) : void {
    const funcionarios = this.listarTodos();
    funcionario.id = new Date().getTime();
    funcionarios.push(funcionario);
    localStorage[LS_CHAVE] = JSON.stringify(funcionarios);
  }

  buscarPorId(id: number): Funcionario | undefined {
    const funcionarios = this.listarTodos();
    return funcionarios.find(funcionario => funcionario.id === id);
  }

  buscarPorEmail(email: string): Funcionario | undefined {
    const funcionarios = this.listarTodos();
    return funcionarios.find(funcionario => funcionario.email.toLowerCase() === email.toLowerCase());
  }

  atualizar(funcionario : Funcionario): void {
    const funcionarios = this.listarTodos();
    funcionarios.forEach( (obj, index, objs) => {
      if (funcionario.id === obj.id) {
        objs[index] = funcionario
      }
    });

  localStorage[LS_CHAVE] = JSON.stringify(funcionarios);
  }

  remover(id: number): void {
    let funcionarios = this.listarTodos();
    funcionarios = funcionarios.filter(funcionario => funcionario.id !== id);
    localStorage[LS_CHAVE] = JSON.stringify(funcionarios);    
  }




}
