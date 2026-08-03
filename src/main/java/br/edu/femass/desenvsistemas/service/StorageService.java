package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;

    @Value("${storage.bucket-name:}")
    private String bucketName;

    @Value("${storage.public-url:}")
    private String publicUrl;

    public String upload(MultipartFile file) {
        if (bucketName.isBlank() || publicUrl.isBlank()) {
            throw new BusinessException(
                    "Armazenamento de anexos não configurado. Peça ao administrador para configurar o storage.");
        }

        String key = UUID.randomUUID() + extensao(file.getOriginalFilename());
        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new BusinessException("Erro ao enviar o arquivo");
        }

        return publicUrl.replaceAll("/+$", "") + "/" + key;
    }

    private String extensao(String nomeOriginal) {
        if (nomeOriginal == null) {
            return "";
        }
        int idx = nomeOriginal.lastIndexOf('.');
        return idx >= 0 ? nomeOriginal.substring(idx) : "";
    }
}
