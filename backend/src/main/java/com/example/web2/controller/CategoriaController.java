package com.example.web2.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.web2.entity.Categoria;
import com.example.web2.controller.dto.CategoriaRequest;
import com.example.web2.service.CategoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/categoria")
@Validated
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public List<Categoria> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public Categoria buscar(@PathVariable Integer id) {
        return categoriaService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria adicionar(@Valid @RequestBody CategoriaRequest request) {
        return categoriaService.salvar(request.nome());
    }

    @PutMapping("/{id}")
    public Categoria atualizar(@PathVariable Integer id, @Valid @RequestBody CategoriaRequest request) {
        return categoriaService.atualizar(id, request.nome());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Integer id) {
        categoriaService.desativar(id);
    }
}