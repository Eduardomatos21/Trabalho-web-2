package com.example.web2.controller.dto;

import java.math.BigDecimal;
import java.util.List;

public record SolicitacaoClienteDetalheResponse(
        String codigo,
        String dataHora,
        String dataHoraPagamento,
        String nomeCliente,
        String emailCliente,
        String descricaoEquipamento,
        String categoriaEquipamento,
        String descricaoDefeito,
        String motivoRejeicao,
        String estado,
        BigDecimal valorOrcamento,
        List<SolicitacaoHistoricoResponse> historico
) {
}
