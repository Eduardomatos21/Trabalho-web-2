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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.example.web2.service.RelatorioReceitaDiaService;
import com.example.web2.service.RelatorioReceitaCategoriaService;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.repository.SolicitacaoRepository;

@RestController
@RequestMapping("/solicitacoes")
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

    @GetMapping
    public List<Solicitacao> listar() {
        return solicitacaoRepository.findAll();
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
}