package com.example.web2.controller.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AutocadastroClienteRequest(
        @NotBlank
        @Pattern(regexp = "^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$")
        String cpf,

        @NotBlank
        @Size(min = 3, max = 50)
        String nome,

        @NotBlank
        @Email
        @Size(max = 50)
        String email,

        @NotBlank
        @Pattern(regexp = "^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$")
        String telefone,

        @NotNull
        @Valid
        EnderecoAutocadastroRequest endereco
) {
}
