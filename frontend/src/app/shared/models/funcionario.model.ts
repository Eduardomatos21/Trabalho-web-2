export class Funcionario {
    id?: number;
    cpf: string;
    nome: string;
    email: string;
    telefone: string;
    endereco?: any;

    constructor() {
        this.cpf = '';
        this.nome = '';
        this.email = '';
        this.telefone = '';
    }
}