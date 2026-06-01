package com.example.web2.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.entity.Categoria;
import com.example.web2.repository.CategoriaRepository;

// Serviço responsável pelas regras de negócio relacionadas às categorias.
// Realiza operações de cadastro, consulta, atualização, desativação e validação de categorias.

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> listar() {
        return categoriaRepository.findByAtivoTrueOrderByIdAsc();
    }

    public Categoria salvar(String nome) {
        validarNome(nome);

        Optional<Categoria> existente = categoriaRepository.findByNomeIgnoreCase(normalizarNome(nome));
        if (existente.isPresent()) {
            Categoria encontrada = existente.get();
            if (Boolean.FALSE.equals(encontrada.getAtivo())) {
                encontrada.setAtivo(true);
                encontrada.setNome(normalizarNome(nome));
                return categoriaRepository.save(encontrada);
            }

            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria ja cadastrada.");
        }

        Categoria categoria = new Categoria();
        categoria.setNome(normalizarNome(nome));
        categoria.setAtivo(true);
        return categoriaRepository.save(categoria);
    }

    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada."));
    }

    public Categoria atualizar(Integer id, String nome) {
        Categoria existente = buscarPorId(id);
        validarNome(nome);
        validarDuplicidade(nome, id);
        existente.setNome(normalizarNome(nome));
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