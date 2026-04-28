package com.example.web2.service;

import static org.springframework.http.HttpStatus.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.entity.Estado;
import com.example.web2.entity.Funcionario;
import com.example.web2.entity.Historico;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.repository.SolicitacaoRepository;

@Service
public class SolicitacaoFuncionarioService {

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
    public List<Solicitacao> listarSolicitacoesAbertas(String token) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        return solicitacaoRepository.findByEstadoOrderByDataHoraAsc(Estado.ABERTA);
    }

    @Transactional(readOnly = true)
    public List<Solicitacao> listarSolicitacoesComFiltro(String token, String tipoFiltro, LocalDateTime dataInicio, LocalDateTime dataFim) {
        SessaoResponse sessao = autenticacaoService.sessaoAtual(token);
        validarPerfilFuncionario(sessao);

        if ("HOJE".equalsIgnoreCase(tipoFiltro)) {
            LocalDateTime inicioHoje = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            LocalDateTime fimHoje = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            return solicitacaoRepository.findByDataHoraBetweenOrderByDataHoraAsc(inicioHoje, fimHoje);
        } 
        else if ("PERIODO".equalsIgnoreCase(tipoFiltro) && dataInicio != null && dataFim != null) {
            return solicitacaoRepository.findByDataHoraBetweenOrderByDataHoraAsc(dataInicio, dataFim);
        } 
        else {
            return solicitacaoRepository.findAllByOrderByDataHoraAsc();
        }
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

    private final SolicitacaoRepository repository;

    public SolicitacaoFuncionarioService(SolicitacaoRepository repository) {
        this.repository = repository;
    }

    public List<Solicitacao> buscarAbertas() {
        return repository.findByEstadoOrderByDataHoraAsc(Estado.ABERTA);
    }








    
}