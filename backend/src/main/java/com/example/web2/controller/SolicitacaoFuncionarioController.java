package com.example.web2.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.ManutencaoRequest;
import com.example.web2.controller.dto.OrcamentoRequest;
import com.example.web2.entity.Solicitacao;
import com.example.web2.service.SolicitacaoFuncionarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/funcionario/solicitacoes")
@CrossOrigin(origins = "http://localhost:4200")
public class SolicitacaoFuncionarioController {

    @Autowired
    private SolicitacaoFuncionarioService solicitacaoFuncionarioService;

    @PatchMapping("/{codigo}/orcamento")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void efetuarOrcamento(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String codigo,
            @Valid @RequestBody OrcamentoRequest request) {
        String token = extrairToken(authorizationHeader);
        solicitacaoFuncionarioService.efetuarOrcamento(token, codigo, request.valorOrcamento());
    }

    @GetMapping("/abertas")
    public List<Solicitacao> listarSolicitacoesAbertas(
            @RequestHeader("Authorization") String authorizationHeader) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoFuncionarioService.listarSolicitacoesAbertas(token);
    }

    @GetMapping
    public List<Solicitacao> listarSolicitacoesComFiltro(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoFuncionarioService.listarSolicitacoesComFiltro(token, tipo, dataInicio, dataFim);
    }

    @PatchMapping("/{codigo}/manutencao")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void efetuarManutencao(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String codigo,
            @Valid @RequestBody ManutencaoRequest request) {
        String token = extrairToken(authorizationHeader);
        solicitacaoFuncionarioService.efetuarManutencao(token, codigo, 
            request.descricaoManutencao(), request.orientacoesCliente());
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

    private final SolicitacaoFuncionarioService service;

    public SolicitacaoFuncionarioController(SolicitacaoFuncionarioService service) {
        this.service = service;
    }

    @GetMapping("/abertas")
    public List<Solicitacao> listarAbertas() {
        return service.buscarAbertas();
    }









    
}