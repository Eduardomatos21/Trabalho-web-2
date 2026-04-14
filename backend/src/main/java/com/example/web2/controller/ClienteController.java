package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.web2.controller.dto.AutocadastroClienteRequest;
import com.example.web2.controller.dto.AutocadastroClienteResponse;
import com.example.web2.entity.Cliente;
import com.example.web2.service.ClienteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/clientes")
@Validated
@CrossOrigin(origins = "http://localhost:4200")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public List<Cliente> listar() {
        return clienteService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente adicionar(@RequestBody Cliente cliente) {
        return clienteService.salvar(cliente);
    }

    @PostMapping("/autocadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public AutocadastroClienteResponse autocadastro(@Valid @RequestBody AutocadastroClienteRequest request) {
        return clienteService.autocadastrarCliente(request);
    }
}