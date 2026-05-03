package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.web2.entity.Endereco;
import com.example.web2.repository.EnderecoRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/enderecos")
@Validated
public class EnderecoController {
    
    @Autowired
    private EnderecoRepository enderecoRepository;

    @GetMapping
    public List<Endereco> listar() {
        return enderecoRepository.findAll();
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Endereco adicionar(@Valid @RequestBody Endereco endereco) {
        return enderecoRepository.save(endereco);
    }
    
}
