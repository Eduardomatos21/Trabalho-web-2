package com.example.web2.controller.dto;

import java.math.BigDecimal;

public record SolicitacaoClienteHomeResponse(
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
        BigDecimal valorOrcamento
) {
}
