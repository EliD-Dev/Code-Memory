package com.memoiredecode.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class EncryptionService {

    private final SecretKeySpec secretKey;

    public EncryptionService(@Value("${app.encryption-key:default_key_must_be_32_bytes_long_12345}") String keyEnv) {
        byte[] keyBytes = new byte[32];
        byte[] envBytes = keyEnv.getBytes(StandardCharsets.UTF_8);
        System.arraycopy(envBytes, 0, keyBytes, 0, Math.min(envBytes.length, 32));
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plainText) throws Exception {
        if (plainText == null) return null;
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public String decrypt(String encryptedText) throws Exception {
        if (encryptedText == null) return null;
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}
