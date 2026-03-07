create database web1;
use web1;

CREATE TABLE Funcionario (
    cpf varchar (11) PRIMARY KEY,
    nome varchar (50),
    email varchar(50) UNIQUE,
    telefone varchar (11),
	id_endereco int,
    foreign key (id_endereco)
    references Endereco (id_endereco)
);

CREATE TABLE Cliente (
    cpf varchar (11) PRIMARY KEY,
    nome varchar (50),
    email varchar (50) UNIQUE,
    telefone varchar (11),
    id_endereco int,
    foreign key (id_endereco)
    references Endereco (id_endereco)
);

CREATE TABLE Endereco (
	id_endereco int PRIMARY KEY auto_increment,
    cep int,
    rua varchar (50),
    bairro varchar (50),
    numero int,
    cidade varchar (50),
    pais varchar  (50)
);

CREATE TABLE Equipamento(
	id_equipamento int PRIMARY KEY,
    categoria varchar (50),
    marca varchar (50),
    modelo varchar (50),
    descricao varchar (50),
    cpf varchar (11),
    foreign key (cpf)
    references Cliente (cpf)
    );
	
CREATE TABLE Solicitacao(
	id_solicitacao int PRIMARY KEY auto_increment,
    dataHora datetime default current_timestamp,
    descricaoProblema varchar (100),
    estado ENUM ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA') default 'ABERTA',
    valor_orcamento decimal(10,2),
    id_equipamento int,
    foreign key (id_equipamento)
    references Equipamento (id_equipamento)
    );
    