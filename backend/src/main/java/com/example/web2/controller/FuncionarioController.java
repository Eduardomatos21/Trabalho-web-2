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
import org.springframework.web.server.ResponseStatusException;
import com.example.web2.entity.Funcionario;
import com.example.web2.controller.dto.FuncionarioRequest;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.service.SenhaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private SenhaService senhaService;

    @PutMapping("/{id}")
    public ResponseEntity<Funcionario> atualizar(@PathVariable Integer id, @Valid @RequestBody FuncionarioRequest request) {
        return funcionarioRepository.findById(id)
            .map(funcionario -> {
                funcionario.setNome(request.nome().trim());
                funcionario.setEmail(request.email().trim().toLowerCase());
                funcionario.setDataNascimento(request.dataNascimento());
                if (request.senha() != null && !request.senha().isBlank()) {
                    aplicarSenha(funcionario, request.senha());
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
    public Funcionario adicionar(@Valid @RequestBody FuncionarioRequest request) {
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha obrigatoria.");
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(request.nome().trim());
        funcionario.setEmail(request.email().trim().toLowerCase());
        funcionario.setDataNascimento(request.dataNascimento());
        aplicarSenha(funcionario, request.senha());

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

    private void aplicarSenha(Funcionario funcionario, String senhaPura) {
        SenhaService.HashComSalt hashComSalt = senhaService.gerarHashComSalt(senhaPura.trim());
        funcionario.setSenhaHash(hashComSalt.hash());
        funcionario.setSenhaSalt(hashComSalt.salt());
    }

}