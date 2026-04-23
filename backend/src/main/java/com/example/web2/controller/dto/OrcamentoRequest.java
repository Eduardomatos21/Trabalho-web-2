package com.example.web2.controller.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record OrcamentoRequest(
    @NotNull(message = "Valor do orçamento é obrigatório")
    @Positive(message = "Valor deve ser maior que zero")
    BigDecimal valorOrcamento
) {
}