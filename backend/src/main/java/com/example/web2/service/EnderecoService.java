package com.example.web2.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.entity.Endereco;
import com.example.web2.repository.EnderecoRepository;

@Service
public class EnderecoService {

    @Autowired
    private EnderecoRepository enderecoRepository;

    public List<Endereco> listar() {
        return enderecoRepository.findAll();
    }

    public Endereco buscarPorId(Integer id) {
        return enderecoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));
    }

    public Endereco salvar(Endereco endereco) {
        if (endereco.getRua() == null || endereco.getRua().isEmpty()) {
            throw new RuntimeException("Rua não pode ser vazia");
        }

        if (endereco.getCidade() == null || endereco.getCidade().isEmpty()) {
            throw new RuntimeException("Cidade não pode ser vazia");
        }
        return enderecoRepository.save(endereco);
    }

    public Endereco atualizar(Integer id, Endereco endereco) {
        Endereco existente = buscarPorId(id);
        existente.setCep(endereco.getCep());
        existente.setRua(endereco.getRua());
        existente.setBairro(endereco.getBairro());
        existente.setNumero(endereco.getNumero());
        existente.setCidade(endereco.getCidade());
        existente.setPais(endereco.getPais());
        return enderecoRepository.save(existente);
    }

    public void deletar(Integer id) {
        Endereco endereco = buscarPorId(id);
        enderecoRepository.delete(endereco);
    }
}