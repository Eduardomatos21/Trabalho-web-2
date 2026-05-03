package com.example.web2.controller.dto;

public record SolicitacaoFuncionarioListResponse(
        String codigo,
        String dataHora,
        String nomeCliente,
        String emailCliente,
        String descricaoEquipamento,
        String categoriaEquipamento,
        String estado
) {
}
