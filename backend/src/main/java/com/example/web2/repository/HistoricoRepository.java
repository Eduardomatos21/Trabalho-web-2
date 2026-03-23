package com.example.web2.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.web2.entity.Historico;

@Repository
public interface HistoricoRepository extends JpaRepository<Historico, Integer> {
    List<Historico> findBySolicitacaoId(Integer idSolicitacao);

}