package com.example.web2.controller;

import com.example.web2.entity.Estado;
import com.example.web2.entity.Funcionario;
import com.example.web2.entity.Solicitacao;
import com.example.web2.repository.FuncionarioRepository;
import com.example.web2.repository.SolicitacaoRepository;
import com.example.web2.repository.HistoricoRepository;
import com.example.web2.service.AutenticacaoService;
import com.example.web2.controller.dto.FuncionarioAlterarStatusRequest;
import com.example.web2.controller.dto.SessaoResponse;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SolicitacaoFuncionarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AutenticacaoService autenticacaoService;

    @MockitoBean
    private FuncionarioRepository funcionarioRepository;

    @MockitoBean
    private SolicitacaoRepository solicitacaoRepository;

    @MockitoBean
    private HistoricoRepository historicoRepository;

    private String tokenValido;
    private String codigoSolicitacao;
    private Funcionario funcionario;
    private Solicitacao solicitacao;
    private SessaoResponse sessaoFuncionario;

    @BeforeEach
    void setUp() {
        tokenValido = "token_valido_123456";
        codigoSolicitacao = "SOL-0001";

        funcionario = new Funcionario();
        funcionario.setId(1);
        funcionario.setNome("João Silva");
        funcionario.setEmail("joao@empresa.com");

        solicitacao = new Solicitacao();
        solicitacao.setId(100);
        solicitacao.setCodigo(codigoSolicitacao);
        solicitacao.setEstado(Estado.ABERTA);

        sessaoFuncionario = new SessaoResponse(
            tokenValido,
            "João Silva",
            "joao@empresa.com",
            "funcionario",
            LocalDateTime.now().plusHours(12)
        );
    }

    @Test
    void deveAlterarStatusComSucesso_QuandoFuncionarioValido() throws Exception {
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.of(funcionario));
        when(solicitacaoRepository.findByCodigo(codigoSolicitacao)).thenReturn(Optional.of(solicitacao));

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(solicitacaoRepository, times(1)).save(solicitacao);
        verify(historicoRepository, times(1)).save(any());
    }

    @Test
    void deveRetornar401_QuandoTokenNaoInformado() throws Exception {
        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar401_QuandoTokenFormatoInvalido() throws Exception {
        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "TokenInvalido abc")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar401_QuandoTokenVazio() throws Exception {
        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer ")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar403_QuandoUsuarioNaoFuncionario() throws Exception {
        SessaoResponse sessaoCliente = new SessaoResponse(
            tokenValido,
            "Maria Cliente",
            "maria@cliente.com",
            "cliente",
            LocalDateTime.now().plusHours(12)
        );

        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoCliente);

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveRetornar404_QuandoFuncionarioNaoEncontrado() throws Exception {
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.empty());

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornar404_QuandoSolicitacaoNaoEncontrada() throws Exception {
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.of(funcionario));
        when(solicitacaoRepository.findByCodigo(codigoSolicitacao)).thenReturn(Optional.empty());

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ORCADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveSalvarHistoricoComDataHoraAtual() throws Exception {
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.of(funcionario));
        when(solicitacaoRepository.findByCodigo(codigoSolicitacao)).thenReturn(Optional.of(solicitacao));

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.APROVADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(historicoRepository, times(1)).save(any());
    }

    @Test
    void deveSalvarEstadoAnteriorECorreto() throws Exception {
        solicitacao.setEstado(Estado.REJEITADA);
        
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.of(funcionario));
        when(solicitacaoRepository.findByCodigo(codigoSolicitacao)).thenReturn(Optional.of(solicitacao));

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.REDIRECIONADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(historicoRepository, times(1)).save(any());
    }

    @Test
    void deveAlterarStatusParaCadaEstadoPossivel() throws Exception {
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.of(funcionario));
        when(solicitacaoRepository.findByCodigo(codigoSolicitacao)).thenReturn(Optional.of(solicitacao));

        Estado[] todosEstados = Estado.values();
        
        for (Estado novoEstado : todosEstados) {
            solicitacao.setEstado(Estado.ABERTA);
            
            FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(novoEstado);

            mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                    .header("Authorization", "Bearer " + tokenValido)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNoContent());
        }

        verify(historicoRepository, times(todosEstados.length)).save(any());
    }

    @Test
    void deveManterDadosDoHistoricoCompleto() throws Exception {
        when(autenticacaoService.sessaoAtual(tokenValido)).thenReturn(sessaoFuncionario);
        when(funcionarioRepository.findById(1)).thenReturn(Optional.of(funcionario));
        when(solicitacaoRepository.findByCodigo(codigoSolicitacao)).thenReturn(Optional.of(solicitacao));

        FuncionarioAlterarStatusRequest request = new FuncionarioAlterarStatusRequest(Estado.ARRUMADA);

        mockMvc.perform(patch("/funcionario/solicitacoes/" + codigoSolicitacao + "/status")
                .header("Authorization", "Bearer " + tokenValido)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());

        verify(historicoRepository, times(1)).save(any());

    }

}