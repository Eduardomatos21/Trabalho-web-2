package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.SolicitacaoRepository;

@RestController
@RequestMapping("/solicitacoes")
public class SolicitacaoController {

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @GetMapping
    public List<Solicitacao> listar() {
        return solicitacaoRepository.findAll();
    }
    
    @GetMapping("/solicitacao/{id}")
    public List<Historico> buscarPorSolicitacao(@PathVariable Integer id) {
        return solicitacaoRepository.findBySolicitacaoId(id);
}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Solicitacao adicionar(@RequestBody Solicitacao solicitacao) {
        return solicitacaoRepository.save(solicitacao);
    }
}