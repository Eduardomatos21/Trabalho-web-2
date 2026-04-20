package com.example.web2.controller.dto;

import com.example.web2.entity.Estado;

public record FuncionarioAlterarStatusRequest(
    Estado novoEstado
) {
}