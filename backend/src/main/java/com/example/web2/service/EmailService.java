package com.example.web2.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void enviarSenhaTemporaria(String destino, String nomeCliente, String senhaTemporaria) {
        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(mailFrom);
            mensagem.setTo(destino);
            mensagem.setSubject("Senha de acesso - Web2");
            mensagem.setText(
                    "Ola, " + nomeCliente + "!"
                            + "Sua senha temporaria de acesso e: " + senhaTemporaria
                            + "No primeiro acesso, altere esta senha."
            );

            mailSender.send(mensagem);
        } catch (Exception ex) {
            LOGGER.error("Falha no envio de e-mail de senha para {}", destino, ex);
        }
    }
}
