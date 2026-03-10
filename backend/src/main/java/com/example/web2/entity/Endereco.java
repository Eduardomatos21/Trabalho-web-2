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


    public Endereco() {}

}