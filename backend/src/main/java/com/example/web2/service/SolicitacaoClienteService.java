package com.example.web2.service;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.controller.dto.SolicitacaoClienteHomeResponse;
import com.example.web2.entity.Estado;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
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

    private SolicitacaoClienteHomeResponse toHomeResponse(Solicitacao solicitacao) {
        String descricaoEquipamento = solicitacao.getDescricaoEquipamento() != null
            ? solicitacao.getDescricaoEquipamento()
            : "-";

        String categoriaEquipamento = solicitacao.getCategoria() != null
            ? solicitacao.getCategoria().getNome()
                : "-";

        String dataHoraFormatada = solicitacao.getDataHora() != null
                ? solicitacao.getDataHora().format(DATA_HORA_FORMATTER)
                : "-";

        return new SolicitacaoClienteHomeResponse(
                solicitacao.getCodigo(),
                dataHoraFormatada,
                descricaoEquipamento,
                categoriaEquipamento,
                solicitacao.getEstado().name(),
                solicitacao.getValorOrcamento()
        );
    }
}
