package com.example.web2.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "endereco")
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_endereco")
    private Integer id;

    @Column(length = 8)
    @NotBlank
    @Pattern(regexp = "\\d{8}")
    private String cep;

    @NotBlank
    @Size(max = 150)
    private String rua;

    @NotBlank
    @Size(max = 120)
    private String bairro;

    @NotNull
    @Min(1)
    private Integer numero;

    @Column(length = 100)
    @Size(max = 100)
    private String complemento;

    @NotBlank
    @Size(max = 120)
    private String cidade;

    @Column(length = 2)
    @NotBlank
    @Size(min = 2, max = 2)
    private String estado;

    @NotBlank
    @Size(max = 80)
    private String pais;


    @OneToMany(mappedBy = "endereco")
    private List<Cliente> clientes;

    public Integer getId () {
        return id; 
    }

    public String getCep () {
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

    public String getComplemento () {
        return complemento;
    }

    public String getCidade () {
        return cidade; 
    }

    public String getEstado () {
        return estado;
    }
    
    public String getPais () {
        return pais; 
    }

    public void setId (Integer id) {
        this.id = id;
    }

    public void setCep (String cep) {
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

    public void setComplemento (String complemento) {
        this.complemento = complemento;
    }

    public void setCidade (String cidade) {
        this.cidade = cidade;
    }  

    public void setEstado (String estado) {
        this.estado = estado;
    }

    public void setPais (String pais) {
        this.pais = pais;
    }  
    
    public Endereco() {}

}