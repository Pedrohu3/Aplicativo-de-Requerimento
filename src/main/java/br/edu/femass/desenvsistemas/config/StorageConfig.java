package br.edu.femass.desenvsistemas.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

/**
 * Cliente S3 genérico para o bucket de anexos. Funciona com qualquer provedor
 * compatível com a API do S3 (hoje: Supabase Storage; também funcionaria com
 * Cloudflare R2, MinIO etc. — só troca endpoint/região/credenciais).
 */
@Configuration
public class StorageConfig {

    @Value("${storage.endpoint:}")
    private String endpoint;

    @Value("${storage.region:us-east-1}")
    private String region;

    @Value("${storage.access-key-id:}")
    private String accessKeyId;

    @Value("${storage.secret-access-key:}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(region))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());

        if (!endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }
        if (!accessKeyId.isBlank()) {
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)));
        }
        return builder.build();
    }
}
