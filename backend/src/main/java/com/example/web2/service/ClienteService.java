package com.example.web2.service;

import static org.springframework.http.HttpStatus.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.web2.controller.dto.AutocadastroClienteRequest;
import com.example.web2.controller.dto.AutocadastroClienteResponse;
import com.example.web2.entity.Cliente;
import com.example.web2.entity.Endereco;
import com.example.web2.repository.ClienteRepository;
import com.example.web2.repository.EnderecoRepository;
import com.example.web2.repository.FuncionarioRepository;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    public Cliente salvar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private CepService cepService;

    @Autowired
    private SenhaService senhaService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public AutocadastroClienteResponse autocadastrarCliente(AutocadastroClienteRequest request) {
        String cpfNormalizado = normalizarCpf(request.cpf());
        String emailNormalizado = request.email().trim().toLowerCase();

        validarUnicidade(cpfNormalizado, emailNormalizado);

        CepService.EnderecoViaCep enderecoViaCep = cepService.buscarEnderecoPorCep(request.endereco().cep());

        Endereco endereco = new Endereco();
        endereco.setCep(enderecoViaCep.cep());
        endereco.setRua(enderecoViaCep.rua());
        endereco.setBairro(enderecoViaCep.bairro());
        endereco.setNumero(parseNumero(request.endereco().numero()));
        endereco.setComplemento(normalizarTextoOpcional(request.endereco().complemento()));
        endereco.setCidade(enderecoViaCep.cidade());
        endereco.setEstado(enderecoViaCep.estado());
        endereco.setPais("Brasil");
        Endereco enderecoSalvo = enderecoRepository.save(endereco);

        String senhaTemporaria = senhaService.gerarSenhaTemporaria4Digitos();
        SenhaService.HashComSalt hashComSalt = senhaService.gerarHashComSalt(senhaTemporaria);

        Cliente cliente = new Cliente();
        cliente.setCpf(cpfNormalizado);
        cliente.setNome(request.nome().trim());
        cliente.setEmail(emailNormalizado);
        cliente.setTelefone(normalizarTelefone(request.telefone()));
        cliente.setEndereco(enderecoSalvo);
        cliente.setSenhaHash(hashComSalt.hash());
        cliente.setSenhaSalt(hashComSalt.salt());
        Cliente clienteSalvo = clienteRepository.save(cliente);

        emailService.enviarSenhaTemporaria(clienteSalvo.getEmail(), clienteSalvo.getNome(), senhaTemporaria);

        return new AutocadastroClienteResponse(
                clienteSalvo.getId(),
                clienteSalvo.getEmail(),
                "Cadastro concluido. A senha temporaria foi enviada por e-mail."
        );
    }

    private void validarUnicidade(String cpfNormalizado, String emailNormalizado) {
        boolean cpfDuplicado = clienteRepository.existsByCpf(cpfNormalizado)
                || funcionarioRepository.existsByCpf(cpfNormalizado);

        if (cpfDuplicado) {
            throw new ResponseStatusException(CONFLICT, "CPF ja cadastrado.");
        }

        boolean emailDuplicado = clienteRepository.existsByEmailIgnoreCase(emailNormalizado)
                || funcionarioRepository.existsByEmailIgnoreCase(emailNormalizado);

        if (emailDuplicado) {
            throw new ResponseStatusException(CONFLICT, "E-mail ja cadastrado.");
        }
    }

    private String normalizarCpf(String cpf) {
        String normalizado = cpf.replaceAll("\\D", "");
        if (normalizado.length() != 11) {
            throw new ResponseStatusException(BAD_REQUEST, "CPF invalido.");
        }
        return normalizado;
    }

    private String normalizarTelefone(String telefone) {
        String normalizado = telefone.replaceAll("\\D", "");
        if (normalizado.length() < 10 || normalizado.length() > 11) {
            throw new ResponseStatusException(BAD_REQUEST, "Telefone invalido.");
        }
        return normalizado;
    }

    private Integer parseNumero(String numero) {
        try {
            return Integer.valueOf(numero.trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Numero do endereco invalido.");
        }
    }

    private String normalizarTextoOpcional(String valor) {
        if (valor == null) {
            return null;
        }

        String texto = valor.trim();
        return texto.isEmpty() ? null : texto;
    }
}