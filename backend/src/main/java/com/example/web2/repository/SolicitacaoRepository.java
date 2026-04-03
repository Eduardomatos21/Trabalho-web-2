package com.example.web2.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.web2.entity.Solicitacao;
import java.util.List;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Integer>{
    @Query("""
    SELECT s.equipamento.categoria, SUM(s.valorOrcamento)
    FROM Solicitacao s
    GROUP BY s.equipamento.categoria
    """)
    List<Object[]> somarReceitaPorCategoria();
}

