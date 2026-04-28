package com.example.web2.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        validarNome(categoria.getNome());
        validarDuplicidade(categoria.getNome(), null);
        categoria.setNome(categoria.getNome().trim());
        return categoriaRepository.save(categoria);
    }

    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada."));
    }

    public Categoria atualizar(Integer id, Categoria categoria) {
        Categoria existente = buscarPorId(id);
        validarNome(categoria.getNome());
        validarDuplicidade(categoria.getNome(), id);
        existente.setNome(categoria.getNome().trim());
        return categoriaRepository.save(existente);
    }

    public void deletar(Integer id) {
        Categoria categoria = buscarPorId(id);
        categoriaRepository.delete(categoria);
    }

    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome da categoria e obrigatorio.");
        }
    }

    private void validarDuplicidade(String nome, Integer idIgnorar) {
        Optional<Categoria> existente = categoriaRepository.findByNomeIgnoreCase(nome.trim());
        if (existente.isPresent() && (idIgnorar == null || !existente.get().getId().equals(idIgnorar))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria ja cadastrada.");
        }
    }
}