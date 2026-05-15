package com.example.web2.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.controller.dto.RelatorioReceitaCategoriaResponse;
import com.example.web2.repository.SolicitacaoRepository;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

@Service
public class RelatorioReceitaCategoriaService {

    @Autowired
    private SolicitacaoRepository repository;

    public List<RelatorioReceitaCategoriaResponse> buscarReceitaPorCategoria() {
        List<Object[]> dados = repository.somarReceitaPorCategoria();
        return dados.stream()
                .map(this::toReceitaCategoria)
                .toList();
    }

    public byte[] gerarPdf(){

        List<Object[]> dados = repository.somarReceitaPorCategoria();

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try{

            PdfWriter writer = new PdfWriter(out);

            PdfDocument pdf = new PdfDocument(writer);

            Document document = new Document(pdf);

            document.add(
                new Paragraph("RELATORIO DE RECEITAS POR CATEGORIA")
            );

            document.add(new Paragraph(" "));

            for(Object[] linha : dados){
                RelatorioReceitaCategoriaResponse item = toReceitaCategoria(linha);
                document.add(
                    new Paragraph(
                        "Categoria: " + item.categoria()
                        + " | Receita total: " + item.total().toString()
                    )
                );

            }

            document.close();

        }catch(Exception e){

            e.printStackTrace();

        }

        return out.toByteArray();

    }

    private RelatorioReceitaCategoriaResponse toReceitaCategoria(Object[] linha) {
        String categoria = String.valueOf(linha[0]);
        BigDecimal total = linha[1] instanceof BigDecimal
                ? (BigDecimal) linha[1]
                : new BigDecimal(String.valueOf(linha[1]));
        return new RelatorioReceitaCategoriaResponse(categoria, total);
    }

}
