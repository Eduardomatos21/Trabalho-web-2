package com.example.web2.entity;
import com.example.web2.entity.Estado;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @Column(name = "valor_orcamento")
    private Float valorOrcamento;

    @ManyToOne
    @JoinColumn(name = "id_equipamento")
    private Equipamento equipamento;

    public Solicitacao() {}

}
