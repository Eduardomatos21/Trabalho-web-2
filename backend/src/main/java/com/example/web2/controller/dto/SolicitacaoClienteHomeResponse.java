package com.example.web2.controller.dto;

import java.math.BigDecimal;

public record SolicitacaoClienteHomeResponse(
        String codigo,
        String dataHora,
        String descricaoEquipamento,
        String categoriaEquipamento,
        String estado,
        BigDecimal valorOrcamento
) {
}
