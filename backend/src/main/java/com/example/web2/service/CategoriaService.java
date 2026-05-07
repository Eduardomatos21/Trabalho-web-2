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
        return categoriaRepository.findByAtivoTrueOrderByIdAsc();
    }

    public Categoria salvar(Categoria categoria) {
        validarNome(categoria.getNome());

        Optional<Categoria> existente = categoriaRepository.findByNomeIgnoreCase(normalizarNome(categoria.getNome()));
        if (existente.isPresent()) {
            Categoria encontrada = existente.get();
            if (Boolean.FALSE.equals(encontrada.getAtivo())) {
                encontrada.setAtivo(true);
                encontrada.setNome(normalizarNome(categoria.getNome()));
                return categoriaRepository.save(encontrada);
            }

            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria ja cadastrada.");
        }

        categoria.setNome(normalizarNome(categoria.getNome()));
        if (categoria.getAtivo() == null) {
            categoria.setAtivo(true);
        }
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
        existente.setNome(normalizarNome(categoria.getNome()));
        return categoriaRepository.save(existente);
    }

    public void desativar(Integer id) {
        Categoria categoria = buscarPorId(id);
        categoria.setAtivo(false);
        categoriaRepository.save(categoria);
    }

    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome da categoria e obrigatorio.");
        }
    }

    private void validarDuplicidade(String nome, Integer idIgnorar) {
        Optional<Categoria> existente = categoriaRepository.findByNomeIgnoreCase(normalizarNome(nome));
        if (existente.isPresent() && (idIgnorar == null || !existente.get().getId().equals(idIgnorar))) {
            if (Boolean.FALSE.equals(existente.get().getAtivo())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria ja cadastrada.");
        }
    }

    private String normalizarNome(String nome) {
        return nome.trim().toUpperCase();
    }
}