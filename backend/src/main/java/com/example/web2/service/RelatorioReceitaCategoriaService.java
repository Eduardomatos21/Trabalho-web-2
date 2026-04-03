package com.example.web2.service;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.repository.SolicitacaoRepository;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

@Service
public class RelatorioReceitaCategoriaService {

    @Autowired
    private SolicitacaoRepository repository;

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

                String categoria = (String) linha[0];

                Double total = (Double) linha[1];

                document.add(
                    new Paragraph(
                        "Categoria: " + categoria
                        + " | Receita total: " + total
                    )
                );

            }

            document.close();

        }catch(Exception e){

            e.printStackTrace();

        }

        return out.toByteArray();

    }

}
