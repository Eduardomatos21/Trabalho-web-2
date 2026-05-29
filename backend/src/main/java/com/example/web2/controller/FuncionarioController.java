package com.example.web2.controller;

import com.example.web2.service.AutenticacaoService;

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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import com.example.web2.entity.Funcionario;
import com.example.web2.controller.dto.FuncionarioRequest;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.service.SenhaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/funcionarios")
@CrossOrigin(origins = "http://localhost:4200")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private SenhaService senhaService;

    @GetMapping
    public List<Funcionario> listar() {
        return funcionarioRepository.findAllByAtivoTrueOrderByIdAsc();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Funcionario> atualizar(@PathVariable Integer id, @Valid @RequestBody FuncionarioRequest request) {
        return funcionarioRepository.findByIdAndAtivoTrue(id)
            .map(funcionario -> {
                funcionarioRepository.findByEmailIgnoreCase(request.email().trim())
                    .filter(existente -> !existente.getId().equals(funcionario.getId()))
                    .ifPresent((existente) -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
                    });
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
        return funcionarioRepository.findByIdAndAtivoTrue(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Funcionario adicionar(@Valid @RequestBody FuncionarioRequest request) {
        if (request.senha() == null || request.senha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha obrigatoria.");
        }

        if (funcionarioRepository.findByEmailIgnoreCase(request.email().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(request.nome().trim());
        funcionario.setEmail(request.email().trim().toLowerCase());
        funcionario.setDataNascimento(request.dataNascimento());
        funcionario.setAtivo(true);
        aplicarSenha(funcionario, request.senha());

        return funcionarioRepository.save(funcionario);
    }

    @Autowired
    private AutenticacaoService autenticacaoService;

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> remover(@PathVariable Integer id, @RequestHeader(value="Authorization", required=false) String authHeader) {
        if (authHeader == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token não informado.");
        }

        var sessao = autenticacaoService.obterSessaoPorHeader(authHeader);
        if (sessao == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida ou expirada.");
        }

        return funcionarioRepository.findByIdAndAtivoTrue(id)
            .map(funcionario -> {
                if (funcionario.getEmail().equalsIgnoreCase(sessao.email())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é possível excluir o próprio usuário logado.");
                }

                if (funcionarioRepository.countByAtivoTrue() <= 1) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível excluir o último funcionário do sistema.");
                }

                funcionario.setAtivo(false);
                funcionarioRepository.save(funcionario);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private void aplicarSenha(Funcionario funcionario, String senhaPura) {
        SenhaService.HashComSalt hashComSalt = senhaService.gerarHashComSalt(senhaPura.trim());
        funcionario.setSenhaHash(hashComSalt.hash());
        funcionario.setSenhaSalt(hashComSalt.salt());
    }

}