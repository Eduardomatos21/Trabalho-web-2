package com.example.web2.controller.dto;

import java.math.BigDecimal;

public record RelatorioReceitaDiaResponse(
        String dia,
        BigDecimal total
) {
}
