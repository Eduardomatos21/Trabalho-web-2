package com.example.web2.service;

import static org.springframework.http.HttpStatus.*;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.LoginRequest;
import com.example.web2.controller.dto.SessaoResponse;
import com.example.web2.entity.Cliente;
import com.example.web2.entity.Funcionario;
import com.example.web2.entity.SessaoUsuario;
import com.example.web2.repository.ClienteRepository;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.repository.SessaoUsuarioRepository;

@Service
public class AutenticacaoService {

    private static final String SENHA_PADRAO_LEGADA = "1234";
    private static final int DURACAO_SESSAO_HORAS = 12;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private SessaoUsuarioRepository sessaoUsuarioRepository;

    @Autowired
    private SenhaService senhaService;

    @Transactional
    public SessaoResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        String senha = request.senha().trim();

        Cliente cliente = clienteRepository.findByEmailIgnoreCase(email).orElse(null);
        if (cliente != null) {
            validarSenhaCliente(cliente, senha);
            SessaoUsuario sessao = criarSessao("cliente", cliente.getId(), cliente.getNome(), cliente.getEmail());
            return paraSessaoResponse(sessao);
        }

        Funcionario funcionario = funcionarioRepository.findByEmailIgnoreCase(email).orElse(null);
        if (funcionario != null) {
            validarFuncionarioAtivo(funcionario);
            validarSenhaFuncionario(funcionario, senha);
            SessaoUsuario sessao = criarSessao("funcionario", funcionario.getId(), funcionario.getNome(), funcionario.getEmail());
            return paraSessaoResponse(sessao);
        }

        throw credenciaisInvalidas();
    }

    @Transactional
    public void logout(String token) {
        SessaoUsuario sessao = obterSessaoValida(token);
        sessao.setAtivo(false);
        sessaoUsuarioRepository.save(sessao);
    }

    @Transactional
    public SessaoResponse sessaoAtual(String token) {
        SessaoUsuario sessao = obterSessaoValida(token);
        return paraSessaoResponse(sessao);
    }

    public boolean isTokenValido(String token) {
        return obterSessaoPorToken(token) != null;
    }

    public SessaoResponse obterSessaoPorHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return obterSessaoPorToken(token);
    }

    private SessaoResponse obterSessaoPorToken(String token) {
        return sessaoUsuarioRepository.findByTokenAndAtivoTrue(token)
                .filter(s -> s.getExpiraEm() != null && s.getExpiraEm().isAfter(LocalDateTime.now()))
                .map(this::paraSessaoResponse)
                .orElse(null);
    }

    private void validarSenhaCliente(Cliente cliente, String senhaInformada) {
        if (senhaValida(cliente.getSenhaHash(), cliente.getSenhaSalt(), senhaInformada)) {
            return;
        }

        if (senhaLegadaAceita(cliente.getSenhaHash(), cliente.getSenhaSalt(), senhaInformada)) {
            atualizarSenhaParaHashCliente(cliente, senhaInformada);
            return;
        }

        throw credenciaisInvalidas();
    }

    private void validarSenhaFuncionario(Funcionario funcionario, String senhaInformada) {
        if (senhaValida(funcionario.getSenhaHash(), funcionario.getSenhaSalt(), senhaInformada)) {
            return;
        }

        if (senhaLegadaAceita(funcionario.getSenhaHash(), funcionario.getSenhaSalt(), senhaInformada)) {
            atualizarSenhaParaHashFuncionario(funcionario, senhaInformada);
            return;
        }

        throw credenciaisInvalidas();
    }

    private void validarFuncionarioAtivo(Funcionario funcionario) {
        if (funcionario.getAtivo() != null && !funcionario.getAtivo()) {
            throw new ResponseStatusException(FORBIDDEN, "Usuario inativo.");
        }
    }

    private boolean senhaValida(String senhaHash, String senhaSalt, String senhaInformada) {
        return senhaService.validarSenha(senhaInformada, senhaHash, senhaSalt);
    }

    private boolean senhaLegadaAceita(String senhaHash, String senhaSalt, String senhaInformada) {
        boolean hashAusente = senhaHash == null || senhaHash.isBlank() || senhaSalt == null || senhaSalt.isBlank();
        return hashAusente && SENHA_PADRAO_LEGADA.equals(senhaInformada);
    }

    private void atualizarSenhaParaHashCliente(Cliente cliente, String senhaInformada) {
        SenhaService.HashComSalt hashComSalt = senhaService.gerarHashComSalt(senhaInformada);
        cliente.setSenhaHash(hashComSalt.hash());
        cliente.setSenhaSalt(hashComSalt.salt());
        clienteRepository.save(cliente);
    }

    private void atualizarSenhaParaHashFuncionario(Funcionario funcionario, String senhaInformada) {
        SenhaService.HashComSalt hashComSalt = senhaService.gerarHashComSalt(senhaInformada);
        funcionario.setSenhaHash(hashComSalt.hash());
        funcionario.setSenhaSalt(hashComSalt.salt());
        funcionarioRepository.save(funcionario);
    }

    private SessaoUsuario criarSessao(String perfil, Integer idUsuario, String nome, String email) {
        LocalDateTime agora = LocalDateTime.now();

        SessaoUsuario sessao = new SessaoUsuario();
        sessao.setToken(gerarToken());
        sessao.setPerfil(perfil);
        sessao.setIdUsuario(idUsuario);
        sessao.setNome(nome);
        sessao.setEmail(email);
        sessao.setCriadoEm(agora);
        sessao.setExpiraEm(agora.plusHours(DURACAO_SESSAO_HORAS));
        sessao.setAtivo(true);

        return sessaoUsuarioRepository.save(sessao);
    }

    private SessaoUsuario obterSessaoValida(String token) {
        SessaoUsuario sessao = sessaoUsuarioRepository.findByTokenAndAtivoTrue(token)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Sessao invalida."));

        if (sessao.getExpiraEm() != null && sessao.getExpiraEm().isBefore(LocalDateTime.now())) {
            sessao.setAtivo(false);
            sessaoUsuarioRepository.save(sessao);
            throw new ResponseStatusException(UNAUTHORIZED, "Sessao expirada.");
        }

        if ("funcionario".equalsIgnoreCase(sessao.getPerfil())) {
            boolean ativo = funcionarioRepository.findByIdAndAtivoTrue(sessao.getIdUsuario()).isPresent();
            if (!ativo) {
                sessao.setAtivo(false);
                sessaoUsuarioRepository.save(sessao);
                throw new ResponseStatusException(UNAUTHORIZED, "Usuario inativo.");
            }
        }

        return sessao;
    }

    private String gerarToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    private SessaoResponse paraSessaoResponse(SessaoUsuario sessao) {
        return new SessaoResponse(
                sessao.getToken(),
                sessao.getNome(),
                sessao.getEmail(),
                sessao.getPerfil(),
                sessao.getExpiraEm()
        );
    }

    private ResponseStatusException credenciaisInvalidas() {
        return new ResponseStatusException(UNAUTHORIZED, "Credenciais invalidas.");
    }
}
