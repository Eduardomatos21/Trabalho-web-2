package com.example.web2.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.web2.entity.Funcionario;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer>{
	boolean existsByEmailIgnoreCase(String email);

	Optional<Funcionario> findByEmailIgnoreCase(String email);

	List<Funcionario> findAllByAtivoTrueOrderByIdAsc();

	Optional<Funcionario> findByIdAndAtivoTrue(Integer id);

	long countByAtivoTrue();
}
