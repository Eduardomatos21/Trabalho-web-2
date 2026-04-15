package com.example.web2.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank
        @Email
        @Size(max = 50)
        String email,

        @NotBlank
        @Pattern(regexp = "^\\d{4}$")
        String senha
) {
}
