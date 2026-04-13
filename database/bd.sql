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
    id_funcionario int PRIMARY KEY auto_increment,
    cpf varchar (11) UNIQUE,
    nome varchar (50),
    email varchar(50) UNIQUE,
    telefone varchar (11),
	id_endereco int,
    foreign key (id_endereco)
    references Endereco (id_endereco)
);

CREATE TABLE Cliente (
    id_cliente int PRIMARY KEY auto_increment,
    cpf varchar (11) UNIQUE,
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
    id_cliente int,
    foreign key (id_cliente)
    references Cliente (id_cliente)
    );
	
CREATE TABLE Solicitacao(
	id_solicitacao int PRIMARY KEY auto_increment,
    dataHora datetime default current_timestamp,
    descricaoProblema varchar (100),
    estado ENUM ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADO') default 'ABERTA',
    valor_orcamento decimal(10,2),
    id_funcionario int,
    foreign key (id_funcionario)
    references Funcionario (id_funcionario),
    id_cliente int,
    foreign key (id_cliente)
    references Cliente (id_cliente),
    id_equipamento int,
    foreign key (id_equipamento)
    references Equipamento (id_equipamento)
    );
    
    CREATE TABLE Historico(
    id_historico int PRIMARY KEY auto_increment,
    id_solicitacao int,
    foreign key (id_solicitacao)
    references Solicitacao (id_solicitacao),
    id_funcionario int,
    foreign key (id_funcionario)
    references Funcionario (id_funcionario),
    id_cliente int,
    foreign key (id_cliente)
    references Cliente (id_cliente),
    estado_anterior ENUM ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADO') default 'ABERTA',
    estado_atual ENUM ('ABERTA', 'ORÇADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADO') default 'ABERTA',
    dataHora datetime default current_timestamp
	);
    
-- =========================
-- CARGA INICIAL (MASSA FRONTEND)
-- =========================
-- Observação: estado final padronizado como FINALIZADO.

SET NAMES utf8mb4;

DELETE FROM Historico;
DELETE FROM Solicitacao;
DELETE FROM Equipamento;
DELETE FROM Categoria;
DELETE FROM Cliente;
DELETE FROM Funcionario;
DELETE FROM Endereco;

ALTER TABLE Endereco AUTO_INCREMENT = 1;
ALTER TABLE Categoria AUTO_INCREMENT = 1;
ALTER TABLE Equipamento AUTO_INCREMENT = 1;
ALTER TABLE Solicitacao AUTO_INCREMENT = 1;
ALTER TABLE Historico AUTO_INCREMENT = 1;

INSERT INTO Endereco (cep, rua, bairro, numero, cidade, pais) VALUES
(1001000, 'Praça da Sé', 'Sé', 100, 'São Paulo - SP', 'Brasil'),
(20040010, 'Rua da Quitanda', 'Centro', 250, 'Rio de Janeiro - RJ', 'Brasil'),
(30130010, 'Avenida Afonso Pena', 'Centro', 900, 'Belo Horizonte - MG', 'Brasil'),
(80010000, 'Rua XV de Novembro', 'Centro', 450, 'Curitiba - PR', 'Brasil'),
(13010000, 'Rua das Flores', 'Centro', 123, 'Campinas - SP', 'Brasil'),
(90400000, 'Avenida Borges', 'Centro Histórico', 456, 'Porto Alegre - RS', 'Brasil');

INSERT INTO Funcionario (cpf, nome, email, telefone, id_endereco) VALUES
('55555555555', 'Maria', 'maria@demo.com', '11990001111', 5),
('66666666666', 'Mário', 'mario@demo.com', '51990002222', 6);

INSERT INTO Cliente (cpf, nome, email, telefone, id_endereco) VALUES
('11111111111', 'José', 'jose@demo.com', '11988881111', 1),
('22222222222', 'João', 'joao@demo.com', '21977772222', 2),
('33333333333', 'Joana', 'joana@demo.com', '31966663333', 3),
('44444444444', 'Joaquina', 'joaquina@demo.com', '41955554444', 4);

INSERT INTO Categoria (nome) VALUES
('NOTEBOOK'),
('DESKTOP'),
('TECLADO'),
('IMPRESSORA'),
('MOUSE');

INSERT INTO Equipamento (id_categoria, marca, modelo, descricao, id_cliente) VALUES
(1, 'Lenovo', 'IdeaPad 3', 'Notebook Lenovo IdeaPad 3', 2),
(2, 'AMD', 'Ryzen 5', 'Desktop Gamer Ryzen 5', 1),
(4, 'Epson', 'L3250', 'Impressora Epson L3250', 3),
(5, 'Logitech', 'M170', 'Mouse Logitech M170', 4),
(3, 'Redragon', 'Mecânico', 'Teclado mecânico Redragon', 2),
(1, 'Acer', 'Aspire 5', 'Notebook Acer Aspire 5', 1),
(2, 'Dell', 'OptiPlex', 'Desktop corporativo Dell OptiPlex', 3),
(4, 'HP', 'LaserJet M404', 'Impressora HP LaserJet M404', 4),
(1, 'Samsung', 'Book', 'Notebook Samsung Book', 2),
(5, 'HyperX', 'Pulsefire', 'Mouse gamer HyperX Pulsefire', 1),
(3, 'Logitech', 'K380', 'Teclado Logitech K380', 3),
(2, 'HP', 'ProDesk', 'Desktop HP ProDesk', 4),
(4, 'Brother', 'DCP-L2540DW', 'Impressora Brother DCP-L2540DW', 2),
(5, 'Microsoft', 'Wireless', 'Mouse sem fio Microsoft', 1),
(1, 'ASUS', 'VivoBook', 'Notebook ASUS VivoBook', 3),
(3, 'Corsair', 'K55', 'Teclado Corsair K55', 4),
(2, 'Intel', 'i5 10a', 'Desktop Intel i5 10ª geração', 2),
(4, 'Canon', 'G3110', 'Impressora Canon G3110', 1),
(5, 'Razer', 'DeathAdder', 'Mouse Razer DeathAdder', 3),
(1, 'HP', 'Pavilion', 'Notebook HP Pavilion', 4);

-- id_solicitacao 1..20 correspondem aos códigos SOL-2001..SOL-2020
INSERT INTO Solicitacao (dataHora, descricaoProblema, estado, valor_orcamento, id_funcionario, id_cliente, id_equipamento) VALUES
('2026-03-01 08:15:00', '[SOL-2001] Não liga após queda de energia.', 'ABERTA', NULL, 1, 2, 1),
('2026-03-02 09:30:00', '[SOL-2002] Reinicia sozinho durante jogos.', 'ORÇADA', 420.00, 2, 1, 2),
('2026-03-03 10:05:00', '[SOL-2003] Puxando folha em branco.', 'APROVADA', 180.00, 1, 3, 3),
('2026-03-04 11:45:00', '[SOL-2004] Cursor travando e clique duplo.', 'REJEITADA', 95.00, 2, 4, 4),
('2026-03-05 08:55:00', '[SOL-2005] Teclas WASD sem resposta.', 'REDIRECIONADA', 140.00, 1, 2, 5),
('2026-03-06 09:20:00', '[SOL-2006] Aquecimento e desligamento.', 'ARRUMADA', 260.00, 1, 1, 6),
('2026-03-07 10:50:00', '[SOL-2007] Tela azul intermitente.', 'PAGA', 310.00, 2, 3, 7),
('2026-03-08 13:15:00', '[SOL-2008] Atolamento recorrente.', 'FINALIZADO', 350.00, 1, 4, 8),
('2026-03-09 09:05:00', '[SOL-2009] Falha no teclado embutido.', 'ORÇADA', 210.00, 2, 2, 9),
('2026-03-10 08:40:00', '[SOL-2010] Botão esquerdo sem clique.', 'FINALIZADO', 120.00, 2, 1, 10),
('2026-03-11 11:20:00', '[SOL-2011] Conexão bluetooth instável.', 'APROVADA', 150.00, 1, 3, 11),
('2026-03-12 14:05:00', '[SOL-2012] Não reconhece SSD secundário.', 'REJEITADA', 275.00, 1, 4, 12),
('2026-03-13 08:10:00', '[SOL-2013] Falha no scanner automático.', 'FINALIZADO', 390.00, 2, 2, 13),
('2026-03-14 09:35:00', '[SOL-2014] Consumo alto de bateria.', 'ORÇADA', 85.00, 1, 1, 14),
('2026-03-15 10:55:00', '[SOL-2015] Sem imagem na tela, só HDMI.', 'ARRUMADA', 330.00, 2, 3, 15),
('2026-03-16 13:20:00', '[SOL-2016] Retroiluminação falhando.', 'REDIRECIONADA', 205.00, 2, 4, 16),
('2026-03-17 09:00:00', '[SOL-2017] Sem áudio nas saídas traseiras.', 'ABERTA', NULL, 1, 2, 17),
('2026-03-18 12:10:00', '[SOL-2018] Impressão falhando em cores.', 'APROVADA', 245.00, 1, 1, 18),
('2026-03-19 15:25:00', '[SOL-2019] Falha no scroll central.', 'PAGA', 115.00, 1, 3, 19),
('2026-03-20 07:50:00', '[SOL-2020] Webcam não reconhecida.', 'FINALIZADO', 290.00, 2, 4, 20);

INSERT INTO Historico (id_solicitacao, id_funcionario, id_cliente, estado_anterior, estado_atual, dataHora) VALUES
(1, 1, 2, 'ABERTA', 'ABERTA', '2026-03-01 09:40:00'),
(2, 2, 1, 'ABERTA', 'ORÇADA', '2026-03-02 16:05:00'),
(3, 1, 3, 'ABERTA', 'ORÇADA', '2026-03-03 14:20:00'),
(3, 1, 3, 'ORÇADA', 'APROVADA', '2026-03-03 18:00:00'),
(4, 2, 4, 'ABERTA', 'ORÇADA', '2026-03-04 15:05:00'),
(4, 2, 4, 'ORÇADA', 'REJEITADA', '2026-03-04 16:20:00'),
(5, 1, 2, 'ABERTA', 'APROVADA', '2026-03-05 12:00:00'),
(5, 1, 2, 'APROVADA', 'REDIRECIONADA', '2026-03-05 13:10:00'),
(6, 1, 1, 'ABERTA', 'APROVADA', '2026-03-06 14:25:00'),
(6, 1, 1, 'APROVADA', 'ARRUMADA', '2026-03-07 15:40:00'),
(7, 2, 3, 'ABERTA', 'APROVADA', '2026-03-07 15:35:00'),
(7, 2, 3, 'APROVADA', 'ARRUMADA', '2026-03-08 11:25:00'),
(7, 2, 3, 'ARRUMADA', 'PAGA', '2026-03-09 09:00:00'),
(8, 1, 4, 'ABERTA', 'APROVADA', '2026-03-09 10:40:00'),
(8, 1, 4, 'APROVADA', 'ARRUMADA', '2026-03-10 10:20:00'),
(8, 1, 4, 'ARRUMADA', 'PAGA', '2026-03-10 17:35:00'),
(8, 1, 4, 'PAGA', 'FINALIZADO', '2026-03-11 09:45:00'),
(9, 2, 2, 'ABERTA', 'ORÇADA', '2026-03-09 14:10:00'),
(10, 2, 1, 'ABERTA', 'APROVADA', '2026-03-10 12:50:00'),
(10, 2, 1, 'APROVADA', 'ARRUMADA', '2026-03-10 16:00:00'),
(10, 2, 1, 'ARRUMADA', 'PAGA', '2026-03-11 09:20:00'),
(10, 2, 1, 'PAGA', 'FINALIZADO', '2026-03-11 10:35:00'),
(11, 1, 3, 'ABERTA', 'ORÇADA', '2026-03-11 15:10:00'),
(11, 1, 3, 'ORÇADA', 'APROVADA', '2026-03-11 17:40:00'),
(12, 1, 4, 'ABERTA', 'ORÇADA', '2026-03-12 16:45:00'),
(12, 1, 4, 'ORÇADA', 'REJEITADA', '2026-03-12 18:30:00'),
(13, 2, 2, 'ABERTA', 'APROVADA', '2026-03-13 13:25:00'),
(13, 2, 2, 'APROVADA', 'ARRUMADA', '2026-03-14 10:50:00'),
(13, 2, 2, 'ARRUMADA', 'PAGA', '2026-03-14 17:15:00'),
(13, 1, 2, 'PAGA', 'FINALIZADO', '2026-03-15 09:30:00'),
(14, 1, 1, 'ABERTA', 'ORÇADA', '2026-03-14 11:50:00'),
(15, 2, 3, 'ABERTA', 'APROVADA', '2026-03-15 16:10:00'),
(15, 2, 3, 'APROVADA', 'ARRUMADA', '2026-03-16 14:15:00'),
(16, 2, 4, 'ABERTA', 'APROVADA', '2026-03-16 17:00:00'),
(16, 2, 4, 'APROVADA', 'REDIRECIONADA', '2026-03-16 17:45:00'),
(17, 1, 2, 'ABERTA', 'ABERTA', '2026-03-17 09:00:00'),
(18, 1, 1, 'ABERTA', 'ORÇADA', '2026-03-18 15:20:00'),
(18, 1, 1, 'ORÇADA', 'APROVADA', '2026-03-18 18:05:00'),
(19, 1, 3, 'ABERTA', 'APROVADA', '2026-03-19 17:10:00'),
(19, 1, 3, 'APROVADA', 'ARRUMADA', '2026-03-20 10:00:00'),
(19, 1, 3, 'ARRUMADA', 'PAGA', '2026-03-20 16:30:00'),
(20, 2, 4, 'ABERTA', 'APROVADA', '2026-03-20 11:30:00'),
(20, 2, 4, 'APROVADA', 'ARRUMADA', '2026-03-20 13:15:00'),
(20, 2, 4, 'ARRUMADA', 'PAGA', '2026-03-21 09:40:00'),
(20, 2, 4, 'PAGA', 'FINALIZADO', '2026-03-21 10:20:00');