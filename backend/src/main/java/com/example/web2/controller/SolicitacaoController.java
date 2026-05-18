package com.example.web2.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.CriarSolicitacaoClienteRequest;
import com.example.web2.controller.dto.RejeitarSolicitacaoClienteRequest;
import com.example.web2.controller.dto.RelatorioReceitaCategoriaResponse;
import com.example.web2.controller.dto.RelatorioReceitaDiaResponse;
import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.controller.dto.SolicitacaoClienteHomeResponse;
import com.example.web2.entity.Estado;
import com.example.web2.entity.Funcionario;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.repository.SolicitacaoRepository;
import com.example.web2.service.AutenticacaoService;
import com.example.web2.service.RelatorioReceitaCategoriaService;
import com.example.web2.service.RelatorioReceitaDiaService;
import com.example.web2.service.SolicitacaoClienteService;
import com.example.web2.service.SolicitacaoFuncionarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/solicitacoes")
@Validated
@CrossOrigin(origins = "http://localhost:4200")
public class SolicitacaoController {

    @Autowired
    private RelatorioReceitaDiaService relatorioDiaService;

    @GetMapping("/relatorio/receita-dia")
    public ResponseEntity<byte[]> relatorioReceitaDia(
            @RequestParam(required = false) LocalDate dataInicial,
            @RequestParam(required = false) LocalDate dataFinal){
        byte[] pdf = relatorioDiaService.gerarPdf(dataInicial, dataFinal);
        return ResponseEntity.ok()
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=receita_dia.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/relatorio/receita-dia/dados")
    public List<RelatorioReceitaDiaResponse> relatorioReceitaDiaDados(
            @RequestParam(required = false) LocalDate dataInicial,
            @RequestParam(required = false) LocalDate dataFinal) {
        return relatorioDiaService.buscarReceitaPorDia(dataInicial, dataFinal);
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

    @GetMapping("/relatorio/receita-categoria/dados")
    public List<RelatorioReceitaCategoriaResponse> relatorioReceitaCategoriaDados() {
        return relatorioService.buscarReceitaPorCategoria();
    }

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private HistoricoRepository historicoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private AutenticacaoService autenticacaoService;

    @Autowired
    private SolicitacaoClienteService solicitacaoClienteService;

    @Autowired
    private SolicitacaoFuncionarioService solicitacaoFuncionarioService;

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

    @PostMapping("/{codigo}/cliente/aprovar")
    public SolicitacaoClienteHomeResponse aprovarServico(
            @PathVariable String codigo,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoClienteService.aprovarServico(token, codigo);
    }

    @PostMapping("/{codigo}/cliente/rejeitar")
    public SolicitacaoClienteHomeResponse rejeitarServico(
            @PathVariable String codigo,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody(required = false) RejeitarSolicitacaoClienteRequest request
    ) {
        String token = extrairToken(authorizationHeader);
        String motivo = request != null ? request.motivoRejeicao() : null;
        return solicitacaoClienteService.rejeitarServico(token, codigo, motivo);
    }

    @PostMapping("/{codigo}/cliente/pagar")
    public SolicitacaoClienteHomeResponse pagarServico(
            @PathVariable String codigo,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        String token = extrairToken(authorizationHeader);
        return solicitacaoClienteService.pagarServico(token, codigo);
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

    @PutMapping("/{codigo}/funcionario/manutencao")
    public ResponseEntity<Void> efetuarManutencao(
        @PathVariable String codigo,
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
        @RequestBody Map<String, String> payload) {
    
    String token = extrairToken(authorizationHeader);
    String descricaoManutencao = payload.get("descricaoManutencao");
    String orientacoesCliente = payload.get("orientacoesCliente");
    
    solicitacaoFuncionarioService.efetuarManutencao(token, codigo, descricaoManutencao, orientacoesCliente);
    
    return ResponseEntity.ok().build();
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

    @PutMapping("/{codigo}/funcionario/redirecionar")
    public ResponseEntity<Void> redirecionarSolicitacao(
        @PathVariable String codigo,
        @RequestParam Integer novoFuncionarioId,
        @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {

        String token = extrairToken(authorizationHeader);
        solicitacaoFuncionarioService.redirecionarSolicitacao(token, codigo, novoFuncionarioId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{codigo}/funcionario/finalizar")
    public ResponseEntity<Solicitacao> finalizarSolicitacao(
            @PathVariable String codigo,
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        String token = extrairToken(authorizationHeader);
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação não encontrada"));

        if (solicitacao.getEstado() != Estado.PAGA &&
            solicitacao.getEstado() != Estado.ARRUMADA &&
            solicitacao.getEstado() != Estado.APROVADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Solicitação só pode ser finalizada se estiver PAGA, ARRUMADA ou APROVADA");
        }

        Funcionario funcionario = funcionarioRepository.findByEmailIgnoreCase(sessao.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcionário não encontrado"));

        Estado estadoAnterior = solicitacao.getEstado();

        solicitacao.setFuncionario(funcionario);
        solicitacao.setEstado(Estado.FINALIZADO);
        solicitacaoRepository.save(solicitacao);

        Historico historico = new Historico();
        historico.setSolicitacao(solicitacao);
        historico.setFuncionario(funcionario);
        historico.setEstadoAnterior(estadoAnterior);
        historico.setEstadoAtual(Estado.FINALIZADO);
        historico.setDataHora(LocalDateTime.now());
        historico.setObservacao("Solicitação finalizada");
        historicoRepository.save(historico);

        return ResponseEntity.ok(solicitacao);
    }

    private void validarPerfilFuncionario(SessaoResponse sessao) {
        if (!"funcionario".equalsIgnoreCase(sessao.perfil())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Operação permitida apenas para funcionários");
        }
    }
}