package com.example.web2.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.web2.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
	boolean existsByCpf(String cpf);

	boolean existsByEmailIgnoreCase(String email);

	Optional<Cliente> findByEmailIgnoreCase(String email);
}

