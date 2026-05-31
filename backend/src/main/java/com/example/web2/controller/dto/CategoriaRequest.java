package com.example.web2.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
    @NotBlank(message = "Nome da categoria e obrigatorio.")
    @Size(max = 50, message = "Nome da categoria deve ter ate 50 caracteres.")
    String nome
) {}
