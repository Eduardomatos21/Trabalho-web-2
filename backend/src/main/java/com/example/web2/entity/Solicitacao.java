package com.example.web2.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Solicitacao")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitacao")
    private Integer id;

    private LocalDateTime dataHora;
    private String descricaoProblema;
    private String estado;

    @Column(name = "valor_orcamento")
    private Float valorOrcamento;

    @ManyToOne
    @JoinColumn(name = "id_equipamento")
    private Equipamento equipamento;

    public Solicitacao() {}

}
