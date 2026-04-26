package com.example.web2.controller.dto;

import jakarta.validation.constraints.Size;

public record RejeitarSolicitacaoClienteRequest(
        @Size(max = 300, message = "Motivo da rejeicao deve ter no maximo 300 caracteres")
        String motivoRejeicao
) {
}
