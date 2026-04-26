package com.example.web2.service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.controller.dto.CriarSolicitacaoClienteRequest;
import com.example.web2.controller.dto.SolicitacaoClienteHomeResponse;
import com.example.web2.entity.Categoria;
import com.example.web2.entity.Cliente;
import com.example.web2.entity.Estado;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.CategoriaRepository;
import com.example.web2.repository.ClienteRepository;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.repository.SolicitacaoRepository;

@Service
public class SolicitacaoClienteService {

    private static final DateTimeFormatter DATA_HORA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    @Autowired
    private HistoricoRepository historicoRepository;

    @Autowired
    private AutenticacaoService autenticacaoService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<SolicitacaoClienteHomeResponse> listarMinhasSolicitacoes(String token) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilCliente(sessao);

        return solicitacaoRepository.findByClienteEmailIgnoreCaseOrderByDataHoraDesc(sessao.email())
                .stream()
                .map(this::toHomeResponse)
                .toList();
    }

    @Transactional
    public SolicitacaoClienteHomeResponse resgatarServico(String token, String codigoSolicitacao) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilCliente(sessao);

        Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Solicitacao nao encontrada."));

        validarDonoSolicitacao(solicitacao, sessao.email());
        validarRegraResgate(solicitacao);

        Estado estadoAnterior = solicitacao.getEstado();
        solicitacao.setEstado(Estado.APROVADA);
        Solicitacao atualizada = solicitacaoRepository.save(solicitacao);

        Historico historico = new Historico();
        historico.setSolicitacao(atualizada);
        historico.setFuncionario(null);
        historico.setEstadoAnterior(estadoAnterior);
        historico.setEstadoAtual(Estado.APROVADA);
        historico.setDataHora(LocalDateTime.now());
        historicoRepository.save(historico);

        return toHomeResponse(atualizada);
    }

    @Transactional
    public SolicitacaoClienteHomeResponse aprovarServico(String token, String codigoSolicitacao) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilCliente(sessao);

        Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Solicitacao nao encontrada."));

        validarDonoSolicitacao(solicitacao, sessao.email());
        validarRegraAprovacao(solicitacao);

        Estado estadoAnterior = solicitacao.getEstado();
        solicitacao.setEstado(Estado.APROVADA);
        Solicitacao atualizada = solicitacaoRepository.save(solicitacao);

        Historico historico = new Historico();
        historico.setSolicitacao(atualizada);
        historico.setFuncionario(null);
        historico.setEstadoAnterior(estadoAnterior);
        historico.setEstadoAtual(Estado.APROVADA);
        historico.setDataHora(LocalDateTime.now());
        historicoRepository.save(historico);

        return toHomeResponse(atualizada);
    }

    @Transactional
    public SolicitacaoClienteHomeResponse rejeitarServico(String token, String codigoSolicitacao, String motivoRejeicao) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilCliente(sessao);

        Solicitacao solicitacao = solicitacaoRepository.findByCodigo(codigoSolicitacao)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Solicitacao nao encontrada."));

        validarDonoSolicitacao(solicitacao, sessao.email());
        validarRegraRejeicao(solicitacao);

        Estado estadoAnterior = solicitacao.getEstado();
        solicitacao.setEstado(Estado.REJEITADA);
        solicitacao.setMotivoRejeicao(normalizarMotivoRejeicao(motivoRejeicao));
        Solicitacao atualizada = solicitacaoRepository.save(solicitacao);

        Historico historico = new Historico();
        historico.setSolicitacao(atualizada);
        historico.setFuncionario(null);
        historico.setEstadoAnterior(estadoAnterior);
        historico.setEstadoAtual(Estado.REJEITADA);
        historico.setDataHora(LocalDateTime.now());
        historicoRepository.save(historico);

        return toHomeResponse(atualizada);
    }

    @Transactional
    public SolicitacaoClienteHomeResponse criarSolicitacao(String token, CriarSolicitacaoClienteRequest request) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilCliente(sessao);

        Cliente cliente = clienteRepository.findByEmailIgnoreCase(sessao.email())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cliente da sessao nao encontrado."));

        Categoria categoria = categoriaRepository.findByNomeIgnoreCase(request.categoriaEquipamento().trim())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Categoria invalida."));

        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setCodigo(gerarProximoCodigoSolicitacao());
        solicitacao.setDataHora(LocalDateTime.now());
        solicitacao.setDescricaoEquipamento(request.descricaoEquipamento().trim());
        solicitacao.setDescricaoProblema(request.descricaoDefeito().trim());
        solicitacao.setCategoria(categoria);
        solicitacao.setCliente(cliente);
        solicitacao.setEstado(Estado.ABERTA);
        solicitacao.setValorOrcamento(null);
        solicitacao.setFuncionario(null);

        Solicitacao criada = solicitacaoRepository.save(solicitacao);

        Historico historicoInicial = new Historico();
        historicoInicial.setSolicitacao(criada);
        historicoInicial.setFuncionario(null);
        historicoInicial.setEstadoAnterior(null); //não existia status antes do aberta
        historicoInicial.setEstadoAtual(Estado.ABERTA);
        historicoInicial.setDataHora(LocalDateTime.now());
        historicoRepository.save(historicoInicial);

        return toHomeResponse(criada);
    }

    private void validarPerfilCliente(SessaoResponse sessao) {
        if (!"cliente".equalsIgnoreCase(sessao.perfil())) {
            throw new ResponseStatusException(FORBIDDEN, "Operacao permitida apenas para perfil cliente.");
        }
    }

    private void validarDonoSolicitacao(Solicitacao solicitacao, String emailSessao) {
        String emailDono = solicitacao.getCliente() != null
            ? solicitacao.getCliente().getEmail()
                : null;

        if (emailDono == null || !emailDono.equalsIgnoreCase(emailSessao)) {
            throw new ResponseStatusException(FORBIDDEN, "Solicitacao nao pertence ao cliente logado.");
        }
    }

    private void validarRegraResgate(Solicitacao solicitacao) {
        if (solicitacao.getEstado() != Estado.REJEITADA) {
            throw new ResponseStatusException(CONFLICT, "Somente solicitacoes rejeitadas podem ser resgatadas.");
        }
    }

    private void validarRegraAprovacao(Solicitacao solicitacao) {
        if (solicitacao.getEstado() != Estado.ORCADA) {
            throw new ResponseStatusException(CONFLICT, "Somente solicitacoes orcadas podem ser aprovadas.");
        }
    }

    private void validarRegraRejeicao(Solicitacao solicitacao) {
        if (solicitacao.getEstado() != Estado.ORCADA) {
            throw new ResponseStatusException(CONFLICT, "Somente solicitacoes orcadas podem ser rejeitadas.");
        }
    }

    private String normalizarMotivoRejeicao(String motivoRejeicao) {
        if (motivoRejeicao == null) {
            return null;
        }

        String motivoNormalizado = motivoRejeicao.trim();
        return motivoNormalizado.isEmpty() ? null : motivoNormalizado;
    }

    private SolicitacaoClienteHomeResponse toHomeResponse(Solicitacao solicitacao) {
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

        String dataHoraFormatada = solicitacao.getDataHora() != null
                ? solicitacao.getDataHora().format(DATA_HORA_FORMATTER)
                : "-";

        String descricaoDefeito = solicitacao.getDescricaoProblema() != null
            ? solicitacao.getDescricaoProblema()
            : "-";

        String motivoRejeicao = solicitacao.getMotivoRejeicao();

        return new SolicitacaoClienteHomeResponse(
                solicitacao.getCodigo(),
                dataHoraFormatada,
            nomeCliente,
            emailCliente,
                descricaoEquipamento,
                categoriaEquipamento,
            descricaoDefeito,
            motivoRejeicao,
                solicitacao.getEstado().name(),
                solicitacao.getValorOrcamento()
        );
    }

    private String gerarProximoCodigoSolicitacao() {
        int ultimoId = solicitacaoRepository.findTopByOrderByIdDesc()
                .map(Solicitacao::getId)
                .orElse(0);

        int proximo = ultimoId + 1;
        return String.format("SOL-%04d", proximo);
    }
}
