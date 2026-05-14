package com.example.web2.controller.dto;

public record SolicitacaoHistoricoResponse(
        String dataHora,
        String funcionario,
        String descricao
) {
}
