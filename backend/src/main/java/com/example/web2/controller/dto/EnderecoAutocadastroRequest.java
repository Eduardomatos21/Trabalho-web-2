package com.example.web2.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EnderecoAutocadastroRequest(
        @NotBlank
        @Pattern(regexp = "^\\d{5}-?\\d{3}$")
        String cep,

        @NotBlank
        String numero,

        String complemento
) {
}
