package com.example.web2.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.web2.entity.Funcionario;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, String>{
}
