package com.example.web2.entity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Endereco")
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_endereco")
    private Integer id;

    private Integer cep;
    private String rua;
    private String bairro;
    private Integer numero;
    private String cidade;
    private String pais;


    @OneToMany(mappedBy = "endereco")
    private List<Funcionario> funcionarios;

    @OneToMany(mappedBy = "endereco")
    private List<Cliente> clientes;

    public Integer getId () {
        return id; 
    }

    public Integer getCep () {
        return cep; 
    }

    public String getRua () {
        return rua; 
    }

    public String getBairro () {
        return bairro; 
    }

    public Integer getNumero () {
        return numero; 
    }

    public String getCidade () {
        return cidade; 
    }
    
    public String getPais () {
        return pais; 
    }

    public void setId (Integer id) {
        this.id = id;
    }

    public void setCep (Integer cep) {
        this.cep = cep;
    }

    public void setRua (String rua) {
        this.rua = rua;
    }

    public void setBairro (String bairro) {
        this.bairro = bairro;
    }  
    
    public void setNumero (Integer numero) {
        this.numero = numero;
    }

    public void setCidade (String cidade) {
        this.cidade = cidade;
    }  

    public void setPais (String pais) {
        this.pais = pais;
    }  


    public Endereco() {}

}