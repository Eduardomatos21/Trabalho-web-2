import { Injectable } from '@angular/core';
import { Funcionario } from '../shared/models/funcionario.model';

const LS_CHAVE = "funcionarios"

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private readonly funcionariosIniciais: Funcionario[] = [
    new Funcionario(1, 'maria@demo.com', 'Maria', '1991-03-15', '1234'),
    new Funcionario(2, 'mario@demo.com', 'Mário', '1990-11-08', '1234'),
  ];

  listarTodos(): Funcionario[] {
    const funcionarios = localStorage[LS_CHAVE];
    if (!funcionarios) {
      localStorage[LS_CHAVE] = JSON.stringify(this.funcionariosIniciais);
      return [...this.funcionariosIniciais];
    }

    try {
      const atuais = JSON.parse(funcionarios) as Funcionario[];
      if (!Array.isArray(atuais)) {
        localStorage[LS_CHAVE] = JSON.stringify(this.funcionariosIniciais);
        return [...this.funcionariosIniciais];
      }

      return atuais;
    } catch {
      localStorage[LS_CHAVE] = JSON.stringify(this.funcionariosIniciais);
      return [...this.funcionariosIniciais];
    }
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
