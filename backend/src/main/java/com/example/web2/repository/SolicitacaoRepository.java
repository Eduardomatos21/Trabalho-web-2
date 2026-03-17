package com.example.web2.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.web2.entity.Funcionario;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Integer>{
}

