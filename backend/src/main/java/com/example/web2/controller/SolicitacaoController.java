package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.CriarSolicitacaoClienteRequest;
import com.example.web2.controller.dto.SolicitacaoClienteHomeResponse;
import com.example.web2.service.RelatorioReceitaDiaService;
import com.example.web2.service.RelatorioReceitaCategoriaService;
import com.example.web2.service.SolicitacaoClienteService;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.repository.SolicitacaoRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/solicitacoes")
@Validated
@CrossOrigin(origins = "http://localhost:4200")
public class SolicitacaoController {

    @Autowired
    private RelatorioReceitaDiaService relatorioDiaService;

        @GetMapping("/relatorio/receita-dia")
    public ResponseEntity<byte[]> relatorioReceitaDia(){
        byte[] pdf = relatorioDiaService.gerarPdf();
        return ResponseEntity.ok()
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=receita_dia.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @Autowired
    private RelatorioReceitaCategoriaService relatorioService;

        @GetMapping("/relatorio/receita-categoria")
    public ResponseEntity<byte[]> relatorioReceitaCategoria(){

        byte[] pdf = relatorioService.gerarPdf();

        return ResponseEntity.ok()
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=receita_categoria.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private HistoricoRepository historicoRepository;

    @Autowired
    private SolicitacaoClienteService solicitacaoClienteService;

    @GetMapping
    public List<Solicitacao> listar() {
        return solicitacaoRepository.findAll();
    }

    @GetMapping("/minhas")
    public List<SolicitacaoClienteHomeResponse> listarMinhasSolicitacoes(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoClienteService.listarMinhasSolicitacoes(token);
    }

    @PostMapping("/{codigo}/cliente/resgatar")
    public SolicitacaoClienteHomeResponse resgatarServico(
            @PathVariable String codigo,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoClienteService.resgatarServico(token, codigo);
    }

    @PostMapping("/cliente")
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoClienteHomeResponse criarSolicitacaoCliente(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody CriarSolicitacaoClienteRequest request
    ) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoClienteService.criarSolicitacao(token, request);
    }

    @GetMapping("/{id}/historicos")
    public List<Historico> buscarHistorico(@PathVariable Integer id) {
        return historicoRepository.findBySolicitacaoId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Solicitacao adicionar(@RequestBody Solicitacao solicitacao) {
        return solicitacaoRepository.save(solicitacao);
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