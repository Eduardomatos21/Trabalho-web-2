package com.example.web2.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.entity.Categoria;
import com.example.web2.repository.CategoriaRepository;

/**
 * Serviço responsável por gerenciar operações relacionadas a categorias de equipamentos.
 * Fornece métodos para CRUD completo, validações e consultas específicas.
 */
@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    /**
     * Lista todas as categorias cadastradas no sistema.
     * @return Lista de todas as categorias
     */
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    /**
     * Salva uma nova categoria no sistema.
     * Realiza validações de nome e duplicidade antes de salvar.
     * @param categoria A categoria a ser salva
     * @return A categoria salva com ID gerado
     * @throws ResponseStatusException se o nome for inválido ou já existir
     */
    public Categoria salvar(Categoria categoria) {
        validarNome(categoria.getNome());
        validarDuplicidade(categoria.getNome(), null);
        categoria.setNome(categoria.getNome().trim());
        return categoriaRepository.save(categoria);
    }

    /**
     * Busca uma categoria pelo seu ID.
     * @param id O ID da categoria
     * @return A categoria encontrada
     * @throws ResponseStatusException se a categoria não for encontrada
     */
    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));
    }

    /**
     * Atualiza uma categoria existente.
     * @param id O ID da categoria a ser atualizada
     * @param categoria Os novos dados da categoria
     * @return A categoria atualizada
     * @throws ResponseStatusException se a categoria não existir ou dados forem inválidos
     */
    public Categoria atualizar(Integer id, Categoria categoria) {
        Categoria existente = buscarPorId(id);
        validarNome(categoria.getNome());
        validarDuplicidade(categoria.getNome(), id);
        existente.setNome(categoria.getNome().trim());
        return categoriaRepository.save(existente);
    }

    /**
     * Remove uma categoria do sistema.
     * @param id O ID da categoria a ser removida
     * @throws ResponseStatusException se a categoria não existir
     */
    public void deletar(Integer id) {
        Categoria categoria = buscarPorId(id);
        categoriaRepository.delete(categoria);
    }

    /**
     * Busca uma categoria pelo nome (case insensitive).
     * @param nome O nome da categoria
     * @return A categoria encontrada ou null se não existir
     */
    public Categoria buscarPorNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return null;
        }
        return categoriaRepository.findByNomeIgnoreCase(nome.trim()).orElse(null);
    }

    /**
     * Verifica se uma categoria existe pelo nome.
     * @param nome O nome da categoria
     * @return true se existe, false caso contrário
     */
    public boolean existePorNome(String nome) {
        return buscarPorNome(nome) != null;
    }

    /**
     * Conta o total de categorias cadastradas.
     * @return O número total de categorias
     */
    public long contar() {
        return categoriaRepository.count();
    }

    /**
     * Valida se o nome da categoria é válido.
     * @param nome O nome a ser validado
     * @throws ResponseStatusException se o nome for nulo, vazio ou muito longo
     */
    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome da categoria e obrigatório.");
        }
        if (nome.trim().length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome da categoria deve ter no máximo 50 caracteres.");
        }
    }

    /**
     * Valida se já existe uma categoria com o mesmo nome.
     * @param nome O nome a ser verificado
     * @param idIgnorar ID a ser ignorado na verificação (para updates)
     * @throws ResponseStatusException se já existir uma categoria com o mesmo nome
     */
    private void validarDuplicidade(String nome, Integer idIgnorar) {
        Optional<Categoria> existente = categoriaRepository.findByNomeIgnoreCase(nome.trim());
        if (existente.isPresent() && (idIgnorar == null || !existente.get().getId().equals(idIgnorar))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria já cadastrada.");
        }
    }
}