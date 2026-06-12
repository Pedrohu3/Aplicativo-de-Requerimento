package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.dto.AprovacaoRequest;
import br.edu.femass.desenvsistemas.dto.RequerimentoRequest;
import br.edu.femass.desenvsistemas.dto.RequerimentoResponse;
import br.edu.femass.desenvsistemas.service.RequerimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/requerimentos")
@RequiredArgsConstructor
public class RequerimentoController {

    private final RequerimentoService requerimentoService;

    @GetMapping("/meus")
    public ResponseEntity<List<RequerimentoResponse>> meus() {
        return ResponseEntity.ok(requerimentoService.listarMeus());
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<RequerimentoResponse>> pendentes() {
        return ResponseEntity.ok(requerimentoService.listarPendentesAprovacao());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequerimentoResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(requerimentoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<RequerimentoResponse> criar(@Valid @RequestBody RequerimentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requerimentoService.criar(request));
    }

    @PostMapping("/{id}/enviar")
    public ResponseEntity<RequerimentoResponse> enviar(@PathVariable Long id) {
        return ResponseEntity.ok(requerimentoService.enviar(id));
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<RequerimentoResponse> aprovar(
            @PathVariable Long id,
            @Valid @RequestBody AprovacaoRequest request
    ) {
        return ResponseEntity.ok(requerimentoService.aprovar(id, request));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<RequerimentoResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(requerimentoService.cancelar(id));
    }
}
