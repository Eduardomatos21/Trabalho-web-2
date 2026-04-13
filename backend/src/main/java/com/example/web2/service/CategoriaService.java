package com.example.web2.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.entity.Categoria;
import com.example.web2.repository.CategoriaRepository;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    public Categoria salvar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }
}