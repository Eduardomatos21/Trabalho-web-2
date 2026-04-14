package com.example.web2.service;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.repository.SolicitacaoRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

@Service
public class RelatorioReceitaDiaService {

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    public byte[] gerarPdf(){

        List<Object[]> dados = solicitacaoRepository.somarReceitaPorDia();

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try{

            PdfWriter writer = new PdfWriter(output);

            PdfDocument pdf = new PdfDocument(writer);

            Document documento = new Document(pdf);

            documento.add(new Paragraph("Relatório de Receita por Dia"));
            documento.add(new Paragraph(" "));

            for(Object[] linha : dados){

                String data = linha[0].toString();
                String valor = linha[1].toString();

                documento.add(
                    new Paragraph("Data: " + data + " | Receita: " + valor)
                );

            }

            documento.close();

        }catch(Exception e){

            e.printStackTrace();

        }

        return output.toByteArray();

    }

}