package com.example.web2.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ManutencaoRequest(
    @NotBlank(message = "Descrição da manutenção é obrigatória")
    @Size(min = 10, max = 500, message = "Descrição deve ter entre 10 e 500 caracteres")
    String descricaoManutencao,

    @NotBlank(message = "Orientações para o cliente são obrigatórias")
    @Size(min = 10, max = 500, message = "Orientações devem ter entre 10 e 500 caracteres")
    String orientacoesCliente
) {}