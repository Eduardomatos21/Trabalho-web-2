drop database web10;
create database web10;
use web10;

CREATE USER 'web2_user'@'localhost' IDENTIFIED BY 'web2_pass';
GRANT ALL PRIVILEGES ON web10.* TO 'web2_user'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE endereco (
    id_endereco int PRIMARY KEY auto_increment,
    cep varchar(8),
    rua varchar(50),
    bairro varchar(50),
    numero int,
    complemento varchar(100) NULL,
    cidade varchar(50),
    estado varchar(2),
    pais varchar(50)
);

CREATE TABLE funcionario (
    id_funcionario int PRIMARY KEY auto_increment,
    cpf varchar(11) UNIQUE,
    nome varchar(50),
    email varchar(50) UNIQUE,
    telefone varchar(11),
    senha_hash varchar(120),
    senha_salt varchar(60),
    id_endereco int,
    foreign key (id_endereco)
    references endereco (id_endereco)
);

CREATE TABLE cliente (
    id_cliente int PRIMARY KEY auto_increment,
    cpf varchar(11) UNIQUE,
    nome varchar(50),
    email varchar(50) UNIQUE,
    telefone varchar(11),
    senha_hash varchar(120),
    senha_salt varchar(60),
    id_endereco int,
    foreign key (id_endereco)
    references endereco (id_endereco)
);

CREATE TABLE categoria (
    id_categoria int primary key auto_increment,
    nome varchar(50) UNIQUE
);

CREATE TABLE solicitacao (
    id_solicitacao int PRIMARY KEY auto_increment,
    codigo varchar(20) UNIQUE,
    data_hora datetime default current_timestamp,
    descricao_equipamento varchar(120),
    descricao_problema varchar(100),
    motivo_rejeicao varchar(300),
    estado ENUM ('ABERTA', 'ORCADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADO') default 'ABERTA',
    valor_orcamento decimal(10,2),
    id_categoria int,
    foreign key (id_categoria)
    references categoria (id_categoria),
    id_cliente int,
    foreign key (id_cliente)
    references cliente (id_cliente),
    id_funcionario int,
    foreign key (id_funcionario)
    references funcionario (id_funcionario)
);

CREATE TABLE historico (
    id_historico int PRIMARY KEY auto_increment,
    id_solicitacao int,
    foreign key (id_solicitacao)
    references solicitacao (id_solicitacao),
    id_funcionario int,
    foreign key (id_funcionario)
    references funcionario (id_funcionario),
    estado_anterior ENUM ('ABERTA', 'ORCADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADO') default 'ABERTA',
    estado_atual ENUM ('ABERTA', 'ORCADA', 'APROVADA', 'REJEITADA', 'REDIRECIONADA', 'ARRUMADA', 'PAGA', 'FINALIZADO') default 'ABERTA',
    observacao varchar(400) NULL,
    data_hora datetime default current_timestamp
);

CREATE TABLE sessao_usuario (
    id_sessao int PRIMARY KEY auto_increment,
    token varchar(120) UNIQUE,
    perfil varchar(20),
    id_usuario int,
    nome varchar(50),
    email varchar(50),
    criado_em datetime,
    expira_em datetime,
    ativo boolean default true
);
    
-- =========================
-- CARGA INICIAL (MASSA FRONTEND)
-- =========================

SET NAMES utf8mb4;

DELETE FROM historico;
DELETE FROM solicitacao;
DELETE FROM categoria;
DELETE FROM sessao_usuario;
DELETE FROM cliente;
DELETE FROM funcionario;
DELETE FROM endereco;

ALTER TABLE endereco AUTO_INCREMENT = 1;
ALTER TABLE categoria AUTO_INCREMENT = 1;
ALTER TABLE solicitacao AUTO_INCREMENT = 1;
ALTER TABLE historico AUTO_INCREMENT = 1;
ALTER TABLE sessao_usuario AUTO_INCREMENT = 1;

INSERT INTO endereco (cep, rua, bairro, numero, complemento, cidade, estado, pais) VALUES
('01001000', 'Praça da Sé', 'Sé', 100, NULL, 'São Paulo', 'SP', 'Brasil'),
('20040010', 'Rua da Quitanda', 'Centro', 250, NULL, 'Rio de Janeiro', 'RJ', 'Brasil'),
('30130010', 'Avenida Afonso Pena', 'Centro', 900, NULL, 'Belo Horizonte', 'MG', 'Brasil'),
('80010000', 'Rua XV de Novembro', 'Centro', 450, NULL, 'Curitiba', 'PR', 'Brasil'),
('13010000', 'Rua das Flores', 'Centro', 123, NULL, 'Campinas', 'SP', 'Brasil'),
('90400000', 'Avenida Borges', 'Centro Histórico', 456, 'Sala 12', 'Porto Alegre', 'RS', 'Brasil');

INSERT INTO funcionario (cpf, nome, email, telefone, id_endereco) VALUES
('55555555555', 'Maria', 'maria@demo.com', '11990001111', 5),
('66666666666', 'Mário', 'mario@demo.com', '51990002222', 6);

INSERT INTO cliente (cpf, nome, email, telefone, id_endereco) VALUES
('11111111111', 'José', 'jose@demo.com', '11988881111', 1),
('22222222222', 'João', 'joao@demo.com', '21977772222', 2),
('33333333333', 'Joana', 'joana@demo.com', '31966663333', 3),
('44444444444', 'Joaquina', 'joaquina@demo.com', '41955554444', 4);

INSERT INTO categoria (nome) VALUES
('NOTEBOOK'),
('DESKTOP'),
('TECLADO'),
('IMPRESSORA'),
('MOUSE');

-- As solicitacoes agora possuem coluna propria `codigo` (sem embutir no texto).
INSERT INTO solicitacao (codigo, data_hora, descricao_equipamento, descricao_problema, estado, valor_orcamento, id_categoria, id_cliente, id_funcionario) VALUES
('SOL-0001', '2026-03-01 08:15:00', 'Notebook Lenovo IdeaPad 3', 'Não liga após queda de energia.', 'ABERTA', NULL, 1, 2, 1),
('SOL-0002', '2026-03-02 09:30:00', 'Desktop Gamer Ryzen 5', 'Reinicia sozinho durante jogos.', 'ORCADA', 420.00, 2, 1, 2),
('SOL-0003', '2026-03-03 10:05:00', 'Impressora Epson L3250', 'Puxando folha em branco.', 'APROVADA', 180.00, 4, 3, 1),
('SOL-0004', '2026-03-04 11:45:00', 'Mouse Logitech M170', 'Cursor travando e clique duplo.', 'REJEITADA', 95.00, 5, 4, 2),
('SOL-0005', '2026-03-05 08:55:00', 'Teclado mecânico Redragon', 'Teclas WASD sem resposta.', 'REDIRECIONADA', 140.00, 3, 2, 1),
('SOL-0006', '2026-03-06 09:20:00', 'Notebook Acer Aspire 5', 'Aquecimento e desligamento.', 'ARRUMADA', 260.00, 1, 1, 1),
('SOL-0007', '2026-03-07 10:50:00', 'Desktop corporativo Dell OptiPlex', 'Tela azul intermitente.', 'PAGA', 310.00, 2, 3, 2),
('SOL-0008', '2026-03-08 13:15:00', 'Impressora HP LaserJet M404', 'Atolamento recorrente.', 'FINALIZADO', 350.00, 4, 4, 1),
('SOL-0009', '2026-03-09 09:05:00', 'Notebook Samsung Book', 'Falha no teclado embutido.', 'ORCADA', 210.00, 1, 2, 2),
('SOL-0010', '2026-03-10 08:40:00', 'Mouse gamer HyperX Pulsefire', 'Botão esquerdo sem clique.', 'FINALIZADO', 120.00, 5, 1, 2),
('SOL-0011', '2026-03-11 11:20:00', 'Teclado Logitech K380', 'Conexão bluetooth instável.', 'APROVADA', 150.00, 3, 3, 1),
('SOL-0012', '2026-03-12 14:05:00', 'Desktop HP ProDesk', 'Não reconhece SSD secundário.', 'REJEITADA', 275.00, 2, 4, 1),
('SOL-0013', '2026-03-13 08:10:00', 'Impressora Brother DCP-L2540DW', 'Falha no scanner automático.', 'FINALIZADO', 390.00, 4, 2, 2),
('SOL-0014', '2026-03-14 09:35:00', 'Mouse sem fio Microsoft', 'Consumo alto de bateria.', 'ORCADA', 85.00, 5, 1, 1),
('SOL-0015', '2026-03-15 10:55:00', 'Notebook ASUS VivoBook', 'Sem imagem na tela, só HDMI.', 'ARRUMADA', 330.00, 1, 3, 2),
('SOL-0016', '2026-03-16 13:20:00', 'Teclado Corsair K55', 'Retroiluminação falhando.', 'REDIRECIONADA', 205.00, 3, 4, 2),
('SOL-0017', '2026-03-17 09:00:00', 'Desktop Intel i5 10a geração', 'Sem áudio nas saídas traseiras.', 'ABERTA', NULL, 2, 2, 1),
('SOL-0018', '2026-03-18 12:10:00', 'Impressora Canon G3110', 'Impressão falhando em cores.', 'APROVADA', 245.00, 4, 1, 1),
('SOL-0019', '2026-03-19 15:25:00', 'Mouse Razer DeathAdder', 'Falha no scroll central.', 'PAGA', 115.00, 5, 3, 1),
('SOL-0020', '2026-03-20 07:50:00', 'Notebook HP Pavilion', 'Webcam não reconhecida.', 'FINALIZADO', 290.00, 1, 4, 2);

INSERT INTO historico (id_solicitacao, id_funcionario, estado_anterior, estado_atual, data_hora) VALUES
(1, 1, 'ABERTA', 'ABERTA', '2026-03-01 09:40:00'),
(2, 2, 'ABERTA', 'ORCADA', '2026-03-02 16:05:00'),
(3, 1, 'ABERTA', 'ORCADA', '2026-03-03 14:20:00'),
(3, 1, 'ORCADA', 'APROVADA', '2026-03-03 18:00:00'),
(4, 2, 'ABERTA', 'ORCADA', '2026-03-04 15:05:00'),
(4, 2, 'ORCADA', 'REJEITADA', '2026-03-04 16:20:00'),
(5, 1, 'ABERTA', 'APROVADA', '2026-03-05 12:00:00'),
(5, 1, 'APROVADA', 'REDIRECIONADA', '2026-03-05 13:10:00'),
(6, 1, 'ABERTA', 'APROVADA', '2026-03-06 14:25:00'),
(6, 1, 'APROVADA', 'ARRUMADA', '2026-03-07 15:40:00'),
(7, 2, 'ABERTA', 'APROVADA', '2026-03-07 15:35:00'),
(7, 2, 'APROVADA', 'ARRUMADA', '2026-03-08 11:25:00'),
(7, 2, 'ARRUMADA', 'PAGA', '2026-03-09 09:00:00'),
(8, 1, 'ABERTA', 'APROVADA', '2026-03-09 10:40:00'),
(8, 1, 'APROVADA', 'ARRUMADA', '2026-03-10 10:20:00'),
(8, 1, 'ARRUMADA', 'PAGA', '2026-03-10 17:35:00'),
(8, 1, 'PAGA', 'FINALIZADO', '2026-03-11 09:45:00'),
(9, 2, 'ABERTA', 'ORCADA', '2026-03-09 14:10:00'),
(10, 2, 'ABERTA', 'APROVADA', '2026-03-10 12:50:00'),
(10, 2, 'APROVADA', 'ARRUMADA', '2026-03-10 16:00:00'),
(10, 2, 'ARRUMADA', 'PAGA', '2026-03-11 09:20:00'),
(10, 2, 'PAGA', 'FINALIZADO', '2026-03-11 10:35:00'),
(11, 1, 'ABERTA', 'ORCADA', '2026-03-11 15:10:00'),
(11, 1, 'ORCADA', 'APROVADA', '2026-03-11 17:40:00'),
(12, 1, 'ABERTA', 'ORCADA', '2026-03-12 16:45:00'),
(12, 1, 'ORCADA', 'REJEITADA', '2026-03-12 18:30:00'),
(13, 2, 'ABERTA', 'APROVADA', '2026-03-13 13:25:00'),
(13, 2, 'APROVADA', 'ARRUMADA', '2026-03-14 10:50:00'),
(13, 2, 'ARRUMADA', 'PAGA', '2026-03-14 17:15:00'),
(13, 1, 'PAGA', 'FINALIZADO', '2026-03-15 09:30:00'),
(14, 1, 'ABERTA', 'ORCADA', '2026-03-14 11:50:00'),
(15, 2, 'ABERTA', 'APROVADA', '2026-03-15 16:10:00'),
(15, 2, 'APROVADA', 'ARRUMADA', '2026-03-16 14:15:00'),
(16, 2, 'ABERTA', 'APROVADA', '2026-03-16 17:00:00'),
(16, 2, 'APROVADA', 'REDIRECIONADA', '2026-03-16 17:45:00'),
(17, 1, 'ABERTA', 'ABERTA', '2026-03-17 09:00:00'),
(18, 1, 'ABERTA', 'ORCADA', '2026-03-18 15:20:00'),
(18, 1, 'ORCADA', 'APROVADA', '2026-03-18 18:05:00'),
(19, 1, 'ABERTA', 'APROVADA', '2026-03-19 17:10:00'),
(19, 1, 'APROVADA', 'ARRUMADA', '2026-03-20 10:00:00'),
(19, 1, 'ARRUMADA', 'PAGA', '2026-03-20 16:30:00'),
(20, 2, 'ABERTA', 'APROVADA', '2026-03-20 11:30:00'),
(20, 2, 'APROVADA', 'ARRUMADA', '2026-03-20 13:15:00'),
(20, 2, 'ARRUMADA', 'PAGA', '2026-03-21 09:40:00'),
(20, 2, 'PAGA', 'FINALIZADO', '2026-03-21 10:20:00');