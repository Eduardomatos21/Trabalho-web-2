export class Funcionario {
    id: number;
    nome: string;
    email: string;
    dataNascimento: string;
    senha: string;

    constructor(id = 0, email = '', nome = '', dataNascimento = '', senha = '') {
        this.id = id;
        this.email = email;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.senha = senha;
    }
}