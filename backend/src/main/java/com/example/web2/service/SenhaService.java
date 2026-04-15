package com.example.web2.service;

import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Service;

@Service
public class SenhaService {

    private static final int SALT_SIZE = 16;
    private static final int ITERATIONS = 65_536;
    private static final int KEY_LENGTH = 256;

    private final SecureRandom secureRandom = new SecureRandom();

    public String gerarSenhaTemporaria4Digitos() {
        return String.format("%04d", secureRandom.nextInt(10_000));
    }

    public HashComSalt gerarHashComSalt(String senhaPura) {
        try {
            byte[] salt = new byte[SALT_SIZE];
            secureRandom.nextBytes(salt);

            PBEKeySpec spec = new PBEKeySpec(
                    senhaPura.toCharArray(),
                    salt,
                    ITERATIONS,
                    KEY_LENGTH
            );

            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();

            return new HashComSalt(
                    Base64.getEncoder().encodeToString(hash),
                    Base64.getEncoder().encodeToString(salt)
            );
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Nao foi possivel gerar hash da senha.", ex);
        }
    }

    public boolean validarSenha(String senhaPura, String hashEsperadoBase64, String saltBase64) {
        if (senhaPura == null || hashEsperadoBase64 == null || saltBase64 == null) {
            return false;
        }

        try {
            byte[] salt = Base64.getDecoder().decode(saltBase64);

            PBEKeySpec spec = new PBEKeySpec(
                    senhaPura.toCharArray(),
                    salt,
                    ITERATIONS,
                    KEY_LENGTH
            );

            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hashCalculado = factory.generateSecret(spec).getEncoded();
            String hashCalculadoBase64 = Base64.getEncoder().encodeToString(hashCalculado);

            return hashCalculadoBase64.equals(hashEsperadoBase64);
        } catch (Exception ex) {
            return false;
        }
    }

    public record HashComSalt(String hash, String salt) {
    }
}
