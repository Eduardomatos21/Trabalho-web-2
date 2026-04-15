package com.example.web2.controller.dto;

import java.time.LocalDateTime;

public record SessaoResponse(
        String token,
        String nome,
        String email,
        String perfil,
        LocalDateTime expiraEm
) {
}
