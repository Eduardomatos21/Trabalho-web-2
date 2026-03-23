package com.example.web2.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.web2.entity.Endereco;

public interface EnderecoRepository extends JpaRepository<Endereco, Integer> {
}