package com.example.web2.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "Historico")
public class Historico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historico")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_solicitacao")
    private Solicitacao solicitacao;

    @ManyToOne
    @JoinColumn(name = "cpf")
    private Funcionario funcionario;

    @Enumerated(EnumType.STRING)
    private Estado estadoAnterior;

    @Enumerated(EnumType.STRING)
    private Estado estadoAtual;

    @Column(name = "dataHora")
    private LocalDateTime dataHora;

    public Historico() {}
}