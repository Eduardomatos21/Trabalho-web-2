create database web10;
use web10;

CREATE TABLE Endereco (
	id_endereco int PRIMARY KEY auto_increment,
    cep int,
    rua varchar (50),
    bairro varchar (50),
    numero int,
    cidade varchar (50),
    pais varchar  (50)
);

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

    CREATE TABLE Categoria(
    id_categoria int primary key auto_increment,
    nome varchar(50) UNIQUE
    );
    
CREATE TABLE Equipamento(
	id_equipamento int PRIMARY KEY auto_increment,
    id_categoria int,
    foreign key (id_categoria)
    references Categoria (id_categoria),
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
    cpf varchar(11),
    foreign key (cpf)
    references Funcionario (cpf),
    id_equipamento int,
    foreign key (id_equipamento)
    references Equipamento (id_equipamento)
    );
    
    CREATE TABLE Historico(
    id_historico int PRIMARY KEY auto_increment,
    id_solicitacao int,
    foreign key (id_solicitacao)
    references Solicitacao (id_solicitacao),
    cpf varchar(11),
    foreign key (cpf)
    references Funcionario (cpf),
    estado_anterior ENUM ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA') default 'ABERTA',
    estado_atual ENUM ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADA') default 'ABERTA',
    dataHora datetime default current_timestamp
	);
    
    
    
    
    