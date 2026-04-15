package com.example.web2.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "funcionario")
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_funcionario")
    private Integer id;

    @Column(name = "cpf", length = 11, unique = true)
    private String cpf;

    @Column(length = 50)
    private String nome;

    @Column(length = 50, unique = true)
    private String email;

    @Column(length = 11)
    private String telefone;

    @JsonIgnore
    @Column(name = "senha_hash", length = 120)
    private String senhaHash;

    @JsonIgnore
    @Column(name = "senha_salt", length = 60)
    private String senhaSalt;

    @ManyToOne
    @JoinColumn(name = "id_endereco")
    private Endereco endereco;

    public Funcionario() {
    }

    public Funcionario(String cpf, String nome, String email, String telefone, Endereco endereco) {
        this.cpf = cpf;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.endereco = endereco;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getSenhaSalt() {
        return senhaSalt;
    }

    public void setSenhaSalt(String senhaSalt) {
        this.senhaSalt = senhaSalt;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }
}