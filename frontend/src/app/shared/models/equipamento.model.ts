export class Equipamento {
  constructor(
    public id: number = 0,
    public categoria: string = "",
    public marca: string = "",
    public modelo: string = "",
    public descricao: string = "",
    public cpf: string = ""
  ) {}
}