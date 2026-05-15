package com.example.web2.controller.dto;

import java.math.BigDecimal;

public record RelatorioReceitaCategoriaResponse(
        String categoria,
        BigDecimal total
) {
}
