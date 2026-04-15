package com.example.web2.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.LoginRequest;
import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.service.AutenticacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Validated
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AutenticacaoService autenticacaoService;

    @PostMapping("/login")
    public SessaoResponse login(@Valid @RequestBody LoginRequest request) {
        return autenticacaoService.login(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        String token = extrairToken(authorizationHeader);
        autenticacaoService.logout(token);
    }

    @GetMapping("/me")
    public SessaoResponse sessaoAtual(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        String token = extrairToken(authorizationHeader);
        return autenticacaoService.sessaoAtual(token);
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
