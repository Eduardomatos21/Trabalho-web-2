package com.example.web2.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarSolicitacaoClienteRequest(
        @NotBlank
        @Size(max = 120)
        String descricaoEquipamento,

        @NotBlank
        @Size(max = 50)
        String categoriaEquipamento,

        @NotBlank
        @Size(min = 10, max = 100)
        String descricaoDefeito
) {
}
