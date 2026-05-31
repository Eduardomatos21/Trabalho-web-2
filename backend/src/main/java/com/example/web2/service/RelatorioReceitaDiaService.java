package com.example.web2.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.web2.controller.dto.RelatorioReceitaDiaResponse;
import com.example.web2.repository.SolicitacaoRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

@Service
public class RelatorioReceitaDiaService {

    private static final DateTimeFormatter DIA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Autowired
    private SolicitacaoRepository solicitacaoRepository;

    public List<RelatorioReceitaDiaResponse> buscarReceitaPorDia(LocalDate dataInicial, LocalDate dataFinal) {
        List<Object[]> dados = buscarDados(dataInicial, dataFinal);

        return dados.stream()
                .map(this::toReceitaDia)
                .toList();
    }

    public byte[] gerarPdf(LocalDate dataInicial, LocalDate dataFinal){

        List<Object[]> dados = buscarDados(dataInicial, dataFinal);

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try{

            PdfWriter writer = new PdfWriter(output);

            PdfDocument pdf = new PdfDocument(writer);

            Document documento = new Document(pdf);

            documento.add(new Paragraph("Relatório de Receita por Dia"));
            documento.add(new Paragraph("Período: " + formatarPeriodo(dataInicial, dataFinal)));
            documento.add(new Paragraph(" "));

            BigDecimal totalGeral = BigDecimal.ZERO;
            for(Object[] linha : dados){

                RelatorioReceitaDiaResponse item = toReceitaDia(linha);
                totalGeral = totalGeral.add(item.total());
                documento.add(new Paragraph("Data: " + item.dia() + " | Receita: " + item.total()));

            }

            documento.add(new Paragraph(" "));
            documento.add(new Paragraph("Total geral: " + totalGeral));

            documento.close();

        }catch(Exception e){

            e.printStackTrace();

        }

        return output.toByteArray();

    }

    private List<Object[]> buscarDados(LocalDate dataInicial, LocalDate dataFinal) {
        if (dataInicial != null && dataFinal != null) {
            return solicitacaoRepository.somarReceitaPorDiaPeriodo(
                    dataInicial.atStartOfDay(),
                    dataFinal.atTime(23, 59, 59)
            );
        }

        if (dataInicial != null) {
            return solicitacaoRepository.somarReceitaPorDiaApartir(dataInicial.atStartOfDay());
        }

        if (dataFinal != null) {
            return solicitacaoRepository.somarReceitaPorDiaAte(dataFinal.atTime(23, 59, 59));
        }

        return solicitacaoRepository.somarReceitaPorDia();
    }

    private RelatorioReceitaDiaResponse toReceitaDia(Object[] linha) {
        LocalDate dia = null;
        if (linha[0] instanceof LocalDate) {
            dia = (LocalDate) linha[0];
        } else if (linha[0] instanceof java.sql.Date) {
            dia = ((java.sql.Date) linha[0]).toLocalDate();
        } else if (linha[0] instanceof LocalDateTime) {
            dia = ((LocalDateTime) linha[0]).toLocalDate();
        }

        String diaFormatado = dia != null ? dia.format(DIA_FORMATTER) : "-";
        BigDecimal total = linha[1] instanceof BigDecimal
                ? (BigDecimal) linha[1]
                : new BigDecimal(String.valueOf(linha[1]));

        return new RelatorioReceitaDiaResponse(diaFormatado, total);
    }

    private String formatarPeriodo(LocalDate dataInicial, LocalDate dataFinal) {
        if (dataInicial == null && dataFinal == null) {
            return "Desde sempre";
        }
        if (dataInicial != null && dataFinal == null) {
            return "A partir de " + dataInicial.format(DIA_FORMATTER);
        }
        if (dataInicial == null) {
            return "Até " + dataFinal.format(DIA_FORMATTER);
        }
        return dataInicial.format(DIA_FORMATTER) + " a " + dataFinal.format(DIA_FORMATTER);
    }

}