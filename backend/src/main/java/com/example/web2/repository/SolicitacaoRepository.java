package com.example.web2.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.web2.entity.Solicitacao;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Integer>{
    Optional<Solicitacao> findByCodigo(String codigo);

    Optional<Solicitacao> findTopByOrderByIdDesc();

    List<Solicitacao> findByClienteEmailIgnoreCaseOrderByDataHoraDesc(String email);

    @Query("""
    SELECT DATE(s.dataHora), SUM(s.valorOrcamento)
    FROM Solicitacao s
    GROUP BY DATE(s.dataHora)
    ORDER BY DATE(s.dataHora)
    """)
    List<Object[]> somarReceitaPorDia();

    @Query("""
    SELECT s.categoria.nome, SUM(s.valorOrcamento)
    FROM Solicitacao s
    GROUP BY s.categoria.nome
    """)
    List<Object[]> somarReceitaPorCategoria();
}

