package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.entity.Categoria;
import com.example.web2.controller.dto.CategoriaRequest;
import com.example.web2.service.AutenticacaoService;
import com.example.web2.service.CategoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/categoria")
@Validated
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private AutenticacaoService autenticacaoService;

    @GetMapping
    public List<Categoria> listar(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        validarToken(authorizationHeader);
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public Categoria buscar(
            @PathVariable Integer id,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        validarToken(authorizationHeader);
        return categoriaService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria adicionar(
            @Valid @RequestBody CategoriaRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        validarToken(authorizationHeader);
        return categoriaService.salvar(request.nome());
    }

    @PutMapping("/{id}")
    public Categoria atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody CategoriaRequest request,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        validarToken(authorizationHeader);
        return categoriaService.atualizar(id, request.nome());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(
            @PathVariable Integer id,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        validarToken(authorizationHeader);
        categoriaService.desativar(id);
    }

    private void validarToken(String authorizationHeader) {
        String token = extrairToken(authorizationHeader);
        autenticacaoService.sessaoAtual(token);
    }

    private String extrairToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token nao informado.");
        }

        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Formato de token invalido.");
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token vazio.");
        }

        return token;
    }
}