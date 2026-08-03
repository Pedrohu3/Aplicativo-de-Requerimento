package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/anexos")
@RequiredArgsConstructor
public class AnexoController {

    private final StorageService storageService;

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Selecione um arquivo para enviar");
        }
        String url = storageService.upload(file);
        return ResponseEntity.ok(Map.of("url", url, "nome", file.getOriginalFilename()));
    }
}
