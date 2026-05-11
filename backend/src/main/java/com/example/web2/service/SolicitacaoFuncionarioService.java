package com.example.web2.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.controller.dto.SolicitacaoFuncionarioDetalheResponse;
import com.example.web2.controller.dto.SolicitacaoFuncionarioListResponse;
import com.example.web2.controller.dto.SolicitacaoHistoricoResponse;
import com.example.web2.entity.Estado;
import com.example.web2.entity.Funcionario;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.repository.SolicitacaoRepository;

@Service
public class SolicitacaoFuncionarioService {

    private static final DateTimeFormatter DATA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private HistoricoRepository historicoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private AutenticacaoService autenticacaoService;

    @Transactional
    public void efetuarOrcamento(String token, String codigoSolicitacao, BigDecimal valorOrcamento) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Solicitação não encontrada"));

        if (solicitacao.getEstado() != Estado.ABERTA) {
            throw new ResponseStatusException(CONFLICT, 
                "Solicitação não está em estado ABERTA. Estado atual: " + solicitacao.getEstado());
        }

        Funcionario funcionario = funcionarioRepository.findByEmailIgnoreCase(sessao.email())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Funcionário não encontrado"));

        Estado estadoAnterior = solicitacao.getEstado();

        solicitacao.setValorOrcamento(valorOrcamento);
        solicitacao.setFuncionario(funcionario);  
        solicitacao.setEstado(Estado.ORCADA);
        
        solicitacaoRepository.save(solicitacao);

        Historico historico = new Historico();
        historico.setSolicitacao(solicitacao);
        historico.setFuncionario(funcionario);
        historico.setEstadoAnterior(estadoAnterior);
        historico.setEstadoAtual(Estado.ORCADA);
        historico.setDataHora(LocalDateTime.now());
        historico.setObservacao("Orçamento realizado no valor de R$ " + valorOrcamento);
        
        historicoRepository.save(historico);
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoFuncionarioListResponse> listarSolicitacoesAbertas(String token) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        return solicitacaoRepository.findByEstadoOrderByDataHoraAsc(Estado.ABERTA)
                .stream()
                .map(this::toFuncionarioListResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoFuncionarioListResponse> listarSolicitacoesComFiltro(
            String token,
            String tipoFiltro,
            LocalDateTime dataInicio,
            LocalDateTime dataFim) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        Funcionario funcionario = funcionarioRepository.findByEmailIgnoreCase(sessao.email())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Funcionário não encontrado"));

        List<Solicitacao> solicitacoes = carregarSolicitacoesPorFiltro(tipoFiltro, dataInicio, dataFim);

        return solicitacoes.stream()
                .filter((solicitacao) -> podeExibirRedirecionada(solicitacao, funcionario))
                .map(this::toFuncionarioListResponse)
                .toList();
    }

            @Transactional(readOnly = true)
            public SolicitacaoFuncionarioDetalheResponse buscarDetalhePorCodigo(String token, String codigoSolicitacao) {
            SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
            validarPerfilFuncionario(sessao);

            Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Solicitação não encontrada"));

            Funcionario funcionario = funcionarioRepository.findByEmailIgnoreCase(sessao.email())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Funcionário não encontrado"));

            if (!podeExibirRedirecionada(solicitacao, funcionario)) {
                throw new ResponseStatusException(FORBIDDEN, "Solicitação redirecionada para outro funcionário");
            }

            String dataHoraFormatada = solicitacao.getDataHora() != null
                ? solicitacao.getDataHora().format(DATA_HORA_FORMATTER)
                : "-";

            String dataHoraPagamentoFormatada = solicitacao.getDataHoraPagamento() != null
                ? solicitacao.getDataHoraPagamento().format(DATA_HORA_FORMATTER)
                : null;

            String nomeCliente = solicitacao.getCliente() != null && solicitacao.getCliente().getNome() != null
                ? solicitacao.getCliente().getNome()
                : "Cliente";

            String emailCliente = solicitacao.getCliente() != null && solicitacao.getCliente().getEmail() != null
                ? solicitacao.getCliente().getEmail()
                : "-";

            String descricaoEquipamento = solicitacao.getDescricaoEquipamento() != null
                ? solicitacao.getDescricaoEquipamento()
                : "-";

            String categoriaEquipamento = solicitacao.getCategoria() != null
                ? solicitacao.getCategoria().getNome()
                : "-";

            String descricaoDefeito = solicitacao.getDescricaoProblema() != null
                ? solicitacao.getDescricaoProblema()
                : "-";

            List<SolicitacaoHistoricoResponse> historico = historicoRepository.findBySolicitacaoId(solicitacao.getId())
                .stream()
                .map((item) -> new SolicitacaoHistoricoResponse(
                    item.getDataHora() != null ? item.getDataHora().format(DATA_HORA_FORMATTER) : "-",
                    item.getFuncionario() != null && item.getFuncionario().getNome() != null
                        ? item.getFuncionario().getNome()
                        : "",
                    montarDescricaoHistorico(item)
                ))
                .toList();

            return new SolicitacaoFuncionarioDetalheResponse(
                solicitacao.getCodigo(),
                dataHoraFormatada,
                dataHoraPagamentoFormatada,
                nomeCliente,
                emailCliente,
                descricaoEquipamento,
                categoriaEquipamento,
                descricaoDefeito,
                solicitacao.getMotivoRejeicao(),
                solicitacao.getEstado().name(),
                solicitacao.getValorOrcamento(),
                historico
            );
            }

    @Transactional
    public void efetuarManutencao(String token, String codigoSolicitacao, String descricaoManutencao, String orientacoesCliente) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Solicitação não encontrada"));

        if (solicitacao.getEstado() != Estado.APROVADA && solicitacao.getEstado() != Estado.REDIRECIONADA) {
            throw new ResponseStatusException(CONFLICT, 
                "Solicitação não está em estado APROVADA ou REDIRECIONADA. Estado atual: " + solicitacao.getEstado());
        }

        Funcionario funcionario = funcionarioRepository.findByEmailIgnoreCase(sessao.email())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Funcionário não encontrado"));

        Estado estadoAnterior = solicitacao.getEstado();

        solicitacao.setFuncionario(funcionario); 
        solicitacao.setEstado(Estado.ARRUMADA);
        
        solicitacaoRepository.save(solicitacao);

        Historico historico = new Historico();
        historico.setSolicitacao(solicitacao);
        historico.setFuncionario(funcionario);
        historico.setEstadoAnterior(estadoAnterior);
        historico.setEstadoAtual(Estado.ARRUMADA);
        historico.setDataHora(LocalDateTime.now());
        historico.setObservacao("Manutenção realizada. Descrição: " + descricaoManutencao + 
                               " | Orientações: " + orientacoesCliente);
        
        historicoRepository.save(historico);
    }

    private void validarPerfilFuncionario(SessaoResponse sessao) {
        if (!"funcionario".equalsIgnoreCase(sessao.perfil())) {
            throw new ResponseStatusException(FORBIDDEN, 
                "Operação permitida apenas para funcionários");
        }
    }

    private List<Solicitacao> carregarSolicitacoesPorFiltro(
            String tipoFiltro,
            LocalDateTime dataInicio,
            LocalDateTime dataFim) {
        if ("HOJE".equalsIgnoreCase(tipoFiltro)) {
            LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            LocalDateTime fimHoje = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            return solicitacaoRepository.findByDataHoraBetweenOrderByDataHoraAsc(inicioHoje, fimHoje);
        }

        if ("PERIODO".equalsIgnoreCase(tipoFiltro)) {
            if (dataInicio != null && dataFim != null) {
                return solicitacaoRepository.findByDataHoraBetweenOrderByDataHoraAsc(dataInicio, dataFim);
            }

            if (dataInicio != null) {
                return solicitacaoRepository.findByDataHoraGreaterThanEqualOrderByDataHoraAsc(dataInicio);
            }

            if (dataFim != null) {
                return solicitacaoRepository.findByDataHoraLessThanEqualOrderByDataHoraAsc(dataFim);
            }
        }

        return solicitacaoRepository.findAllByOrderByDataHoraAsc();
    }

    private boolean podeExibirRedirecionada(Solicitacao solicitacao, Funcionario funcionario) {
        if (solicitacao.getEstado() != Estado.REDIRECIONADA) {
            return true;
        }

        if (solicitacao.getFuncionario() == null) {
            return false;
        }

        return solicitacao.getFuncionario().getId().equals(funcionario.getId());
    }

    private SolicitacaoFuncionarioListResponse toFuncionarioListResponse(Solicitacao solicitacao) {
        String dataHoraFormatada = solicitacao.getDataHora() != null
                ? solicitacao.getDataHora().format(DATA_HORA_FORMATTER)
                : "-";

        String nomeCliente = solicitacao.getCliente() != null && solicitacao.getCliente().getNome() != null
                ? solicitacao.getCliente().getNome()
                : "Cliente";

        String emailCliente = solicitacao.getCliente() != null && solicitacao.getCliente().getEmail() != null
                ? solicitacao.getCliente().getEmail()
                : "-";

        String descricaoEquipamento = solicitacao.getDescricaoEquipamento() != null
                ? solicitacao.getDescricaoEquipamento()
                : "-";

        String categoriaEquipamento = solicitacao.getCategoria() != null
                ? solicitacao.getCategoria().getNome()
                : "-";

        return new SolicitacaoFuncionarioListResponse(
                solicitacao.getCodigo(),
                dataHoraFormatada,
                nomeCliente,
                emailCliente,
                descricaoEquipamento,
                categoriaEquipamento,
                solicitacao.getEstado().name()
        );
    }

    private String montarDescricaoHistorico(Historico historico) {
        if (historico.getObservacao() != null && !historico.getObservacao().isBlank()) {
            return historico.getObservacao();
        }

        String anterior = historico.getEstadoAnterior() != null ? historico.getEstadoAnterior().name() : "-";
        String atual = historico.getEstadoAtual() != null ? historico.getEstadoAtual().name() : "-";
        return "Alteração de estado: " + anterior + " -> " + atual;
    }

    private final SolicitacaoRepository repository;

    public SolicitacaoFuncionarioService(SolicitacaoRepository repository) {
        this.repository = repository;
    }

    public List<Solicitacao> buscarAbertas() {
        return repository.findByEstadoOrderByDataHoraAsc(Estado.ABERTA);
    }

    @Transactional
    public void redirecionarSolicitacao(
        String token,
        String codigoSolicitacao,
        Integer novoFuncionarioId
    ) {
    SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
    validarPerfilFuncionario(sessao);
    Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
            .orElseThrow(() -> new ResponseStatusException(
                    NOT_FOUND,
                    "Solicitação não encontrada"
            ));

    if (solicitacao.getEstado() != Estado.APROVADA &&
        solicitacao.getEstado() != Estado.REDIRECIONADA) {
        throw new ResponseStatusException(
                CONFLICT,
                "Solicitação não está em estado APROVADA ou REDIRECIONADA"
        );
    }

    Funcionario funcionarioOrigem = funcionarioRepository
            .findByEmailIgnoreCase(sessao.email())
            .orElseThrow(() -> new ResponseStatusException(
                    NOT_FOUND,
                    "Funcionário não encontrado"
            ));

    Funcionario funcionarioDestino = funcionarioRepository
            .findById(novoFuncionarioId)
            .orElseThrow(() -> new ResponseStatusException(
                    NOT_FOUND,
                    "Funcionário destino não encontrado"
            ));

    if (funcionarioOrigem.getId().equals(funcionarioDestino.getId())) {
        throw new ResponseStatusException(
                CONFLICT,
                "Não é possível redirecionar para si mesmo"
        );
    }
    
    Estado estadoAnterior = solicitacao.getEstado();
    solicitacao.setFuncionario(funcionarioDestino);
    solicitacao.setEstado(Estado.REDIRECIONADA);
    solicitacaoRepository.save(solicitacao);
    Historico historico = new Historico();
    historico.setSolicitacao(solicitacao);
    historico.setFuncionario(funcionarioOrigem);
    historico.setEstadoAnterior(estadoAnterior);
    historico.setEstadoAtual(Estado.REDIRECIONADA);
    historico.setDataHora(LocalDateTime.now());
    historico.setObservacao(
            "Solicitação redirecionada para "
            + funcionarioDestino.getNome()
    );

    historicoRepository.save(historico);
    }
    
}