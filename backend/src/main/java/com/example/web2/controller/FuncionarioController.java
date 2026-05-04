package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import com.example.web2.entity.Funcionario;
import com.example.web2.repository.FuncionarioRepository;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @PutMapping("/{id}")
public ResponseEntity<Funcionario> atualizar(@PathVariable Integer id, @RequestBody Funcionario funcionarioAtualizado) {
    return funcionarioRepository.findById(id)
        .map(funcionario -> {
            funcionario.setNome(funcionarioAtualizado.getNome());
            funcionario.setEmail(funcionarioAtualizado.getEmail());
            funcionario.setTelefone(funcionarioAtualizado.getTelefone());
            funcionario.setCpf(funcionarioAtualizado.getCpf());
            if (funcionarioAtualizado.getEndereco() != null) {
                funcionario.setEndereco(funcionarioAtualizado.getEndereco());
            }
            // Só atualiza senha se foi enviada
            if (funcionarioAtualizado.getSenhaHash() != null) {
                funcionario.setSenhaHash(funcionarioAtualizado.getSenhaHash());
                funcionario.setSenhaSalt(funcionarioAtualizado.getSenhaSalt());
            }
            return ResponseEntity.ok(funcionarioRepository.save(funcionario));
        })
        .orElse(ResponseEntity.notFound().build());
}
    @GetMapping("/{id}")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Integer id) {
        return funcionarioRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Funcionario adicionar(@RequestBody Funcionario funcionario) {
        return funcionarioRepository.save(funcionario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> remover(@PathVariable Integer id) {
    if (!funcionarioRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }
    funcionarioRepository.deleteById(id);
    return ResponseEntity.noContent().build();
}

}