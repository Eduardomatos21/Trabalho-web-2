package com.example.web2.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.entity.Historico;
import com.example.web2.repository.HistoricoRepository;

@Service
public class HistoricoService {

    @Autowired
    private HistoricoRepository historicoRepository;

    public List<Historico> listar() {
        return historicoRepository.findAll();
    }

    public Historico buscarPorId(Integer id) {
        return historicoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Histórico não encontrado"));
    }

    public List<Historico> buscarPorSolicitacao(Integer idSolicitacao) {
        return historicoRepository.findBySolicitacaoId(idSolicitacao);
    }

    public Historico salvar(Historico historico) {
        return historicoRepository.save(historico);
    }
}