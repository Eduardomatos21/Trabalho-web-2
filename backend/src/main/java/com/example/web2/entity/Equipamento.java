package com.example.web2.entity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Equipamento")
public class Equipamento {

    @Id
    @Column(name = "id_equipamento")
    private Integer id;

    @Column(length = 50)
    private String categoria;

    @Column(length = 50)
    private String marca;

    @Column(length = 50)
    private String modelo;

    @Column(length = 50)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "cpf")
    private Cliente cliente;

    @OneToMany(mappedBy = "equipamento")
    private List<Solicitacao> solicitacoes;
    
    public Integer getId() {
        return id;
    }

    public String getCategoria () {
        return categoria;
    }

    public String getMarca () {
        return marca;
    }

    public String getModelo () {
        return modelo;
    }

    public String getDescricao () {
        return descricao;
    }

    public Cliente getCliente () {
        return cliente;
    }

    public List<Solicitacao> getSolicitacoes () {
        return solicitacoes;
    }

    public void setId (Integer id) {
        this.id = id;
    }

    public void setCategoria (String categoria) {
        this.categoria = categoria;
    }

    public void setMarca (String marca) {
        this.marca = marca;
    }

    public void setModelo (String modelo) {
        this.modelo = modelo;
    }

    public void setDescricao (String descricao) {
        this.descricao = descricao;
    }

    public void setCliente (Cliente cliente) {
        this.cliente = cliente;
    }
    
    public void setSolicitacoes (List<Solicitacao> solicitacoes) {
        this.solicitacoes = solicitacoes;
    }}
