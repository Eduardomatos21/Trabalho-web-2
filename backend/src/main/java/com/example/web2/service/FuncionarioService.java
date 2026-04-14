package com.example.web2.service;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.repository.SolicitacaoRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class FuncionarioService {

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    public byte[] gerarPdf(){

        List<Object[]> dados = solicitacaoRepository.somarReceitaPorDia();

        Document documento = new Document();

        try{

            ByteArrayOutputStream output = new ByteArrayOutputStream();

            PdfWriter.getInstance(documento, output);

            documento.open();

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

            return output.toByteArray();

        }catch(Exception e){

            e.printStackTrace();
            return null;

        }

        try{

            ByteArrayOutputStream output = new ByteArrayOutputStream();

            PdfWriter.getInstance(documento, output);

            documento.open();

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

            return output.toByteArray();

        }catch(Exception e){

            e.printStackTrace();
            return null;

        }

    }

}