package com.example.web2.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CepService {

    private final RestClient restClient;

    @Value("${app.viacep.base-url:https://viacep.com.br/ws}")
    private String viaCepBaseUrl;

    public CepService() {
        this.restClient = RestClient.create();
    }

    public EnderecoViaCep buscarEnderecoPorCep(String cep) {
        String cepLimpo = cep.replaceAll("\\D", "");
        ViaCepResponse response = restClient
                .get()
                .uri(viaCepBaseUrl + "/" + cepLimpo + "/json/")
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, result) -> {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao consultar CEP no servico externo.");
                })
                .body(ViaCepResponse.class);

        if (response == null || Boolean.TRUE.equals(response.erro())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP nao encontrado.");
        }

        return new EnderecoViaCep(
                cepLimpo,
                response.logradouro(),
                response.bairro(),
                response.localidade(),
                response.uf()
        );
    }

    public record EnderecoViaCep(String cep, String rua, String bairro, String cidade, String estado) {
    }

    private record ViaCepResponse(
            String cep,
            String logradouro,
            String bairro,
            String localidade,
            String uf,
            Boolean erro
    ) {
    }
}
