package com.example.web2.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "equipamento")
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipamento")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Column(length = 50)
    private String marca;

    @Column(length = 50)
    private String modelo;

    @Column(length = 50)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @OneToMany(mappedBy = "equipamento")
    private List<Solicitacao> solicitacoes;
    
    public Integer getId() {
        return id;
    }

    public Categoria getCategoria () {
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

    public void setCategoria (Categoria categoria) {
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
    }
}
