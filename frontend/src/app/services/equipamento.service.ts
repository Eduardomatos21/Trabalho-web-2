import { Injectable } from '@angular/core';
import { Equipamento } from '../shared/models/equipamento.model';

const LS_CHAVE = "equipamentos";

@Injectable({
  providedIn: 'root',
})
export class EquipamentoService {

  listarTodos(): Equipamento[] {
    const equipamentos = localStorage[LS_CHAVE];
    return equipamentos ? JSON.parse(equipamentos) : [];
  }

  inserir(equipamento: Equipamento): void {
    const equipamentos = this.listarTodos();
    equipamento.id = new Date().getTime();
    equipamentos.push(equipamento);
    localStorage[LS_CHAVE] = JSON.stringify(equipamentos);
  }

  buscarPorId(id: number): Equipamento | undefined {
    const equipamentos = this.listarTodos();
    return equipamentos.find(e => e.id === id);
  }

  atualizar(equipamento: Equipamento): void {
    const equipamentos = this.listarTodos();
    equipamentos.forEach((obj, index, objs) => {
      if (equipamento.id === obj.id) {
        objs[index] = equipamento;
      }
    });
    localStorage[LS_CHAVE] = JSON.stringify(equipamentos);
  }

  remover(id: number): void {
    let equipamentos = this.listarTodos();
    equipamentos = equipamentos.filter(e => e.id !== id);
    localStorage[LS_CHAVE] = JSON.stringify(equipamentos);
  }
}