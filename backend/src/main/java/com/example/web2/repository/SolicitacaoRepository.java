package com.example.web2.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.web2.entity.Estado;
import com.example.web2.entity.Solicitacao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Integer>{
    Optional<Solicitacao> findByCodigo(String codigo);

    Optional<Solicitacao> findTopByOrderByIdDesc();

    List<Solicitacao> findByClienteEmailIgnoreCaseOrderByDataHoraDesc(String email);
    List<Solicitacao> findByEstado(Estado estado);
    List<Solicitacao> findByEstadoOrderByDataHoraAsc(Estado estado);
    List<Solicitacao> findByDataHoraBetweenOrderByDataHoraAsc(LocalDateTime inicio, LocalDateTime fim);
    List<Solicitacao> findByDataHoraGreaterThanEqualOrderByDataHoraAsc(LocalDateTime inicio);
    List<Solicitacao> findByDataHoraLessThanEqualOrderByDataHoraAsc(LocalDateTime fim);
    List<Solicitacao> findAllByOrderByDataHoraAsc();
    


        @Query("""
        SELECT function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora)), SUM(s.valorOrcamento)
        FROM Solicitacao s
        WHERE (s.estado = com.example.web2.entity.Estado.PAGA OR s.estado = com.example.web2.entity.Estado.FINALIZADO)
            AND s.valorOrcamento IS NOT NULL
            AND s.valorOrcamento > 0
        GROUP BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        ORDER BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        """)
        List<Object[]> somarReceitaPorDia();

        @Query("""
        SELECT function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora)), SUM(s.valorOrcamento)
        FROM Solicitacao s
        WHERE (s.estado = com.example.web2.entity.Estado.PAGA OR s.estado = com.example.web2.entity.Estado.FINALIZADO)
            AND s.valorOrcamento IS NOT NULL
            AND s.valorOrcamento > 0
            AND COALESCE(s.dataHoraPagamento, s.dataHora) >= :inicio
        GROUP BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        ORDER BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        """)
        List<Object[]> somarReceitaPorDiaApartir(@Param("inicio") LocalDateTime inicio);

        @Query("""
        SELECT function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora)), SUM(s.valorOrcamento)
        FROM Solicitacao s
        WHERE (s.estado = com.example.web2.entity.Estado.PAGA OR s.estado = com.example.web2.entity.Estado.FINALIZADO)
            AND s.valorOrcamento IS NOT NULL
            AND s.valorOrcamento > 0
            AND COALESCE(s.dataHoraPagamento, s.dataHora) <= :fim
        GROUP BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        ORDER BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        """)
        List<Object[]> somarReceitaPorDiaAte(@Param("fim") LocalDateTime fim);

        @Query("""
        SELECT function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora)), SUM(s.valorOrcamento)
        FROM Solicitacao s
        WHERE (s.estado = com.example.web2.entity.Estado.PAGA OR s.estado = com.example.web2.entity.Estado.FINALIZADO)
            AND s.valorOrcamento IS NOT NULL
            AND s.valorOrcamento > 0
            AND COALESCE(s.dataHoraPagamento, s.dataHora) BETWEEN :inicio AND :fim
        GROUP BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        ORDER BY function('DATE', COALESCE(s.dataHoraPagamento, s.dataHora))
        """)
        List<Object[]> somarReceitaPorDiaPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

        @Query("""
        SELECT s.categoria.nome, SUM(s.valorOrcamento)
        FROM Solicitacao s
        WHERE (s.estado = com.example.web2.entity.Estado.PAGA OR s.estado = com.example.web2.entity.Estado.FINALIZADO)
            AND s.valorOrcamento IS NOT NULL
            AND s.valorOrcamento > 0
        GROUP BY s.categoria.nome
        ORDER BY s.categoria.nome
        """)
        List<Object[]> somarReceitaPorCategoria();
}

