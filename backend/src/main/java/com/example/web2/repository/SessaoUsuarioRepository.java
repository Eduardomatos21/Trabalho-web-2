package com.example.web2.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.web2.entity.SessaoUsuario;

public interface SessaoUsuarioRepository extends JpaRepository<SessaoUsuario, Integer> {
    Optional<SessaoUsuario> findByTokenAndAtivoTrue(String token);
}
