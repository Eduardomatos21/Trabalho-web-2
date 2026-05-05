package com.example.web2.controller.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FuncionarioRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        String nome,

        @NotBlank
        @Email
        @Size(max = 50)
        String email,

        @NotNull
        LocalDate dataNascimento,

        @Pattern(regexp = "^\\d{4}$")
        String senha
) {
}
