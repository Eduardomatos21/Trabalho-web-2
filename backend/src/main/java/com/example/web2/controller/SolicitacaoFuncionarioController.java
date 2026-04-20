package com.example.web2.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.web2.controller.dto.FuncionarioAlterarStatusRequest;
import com.example.web2.service.SolicitacaoFuncionarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/funcionario/solicitacoes")
@CrossOrigin(origins = "http://localhost:4200")
public class SolicitacaoFuncionarioController {

    @Autowired
    private SolicitacaoFuncionarioService solicitacaoFuncionarioService;

    @PatchMapping("/{codigo}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarStatus(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable String codigo,
            @Valid @RequestBody FuncionarioAlterarStatusRequest request
    ) {
        String token = extrairToken(authorizationHeader);
        solicitacaoFuncionarioService.alterarStatus(token, codigo, request.novoEstado());
    }

    private String extrairToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token não informado.");
        }

        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Formato de token inválido.");
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token vazio.");
        }

        return token;
    }
}