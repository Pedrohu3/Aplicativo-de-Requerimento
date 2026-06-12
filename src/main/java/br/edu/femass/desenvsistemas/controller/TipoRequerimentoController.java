package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.dto.TipoRequerimentoRequest;
import br.edu.femass.desenvsistemas.dto.TipoRequerimentoResponse;
import br.edu.femass.desenvsistemas.service.TipoRequerimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-requerimento")
@RequiredArgsConstructor
public class TipoRequerimentoController {

    private final TipoRequerimentoService tipoRequerimentoService;

    @GetMapping
    public ResponseEntity<List<TipoRequerimentoResponse>> listarAtivos() {
        return ResponseEntity.ok(tipoRequerimentoService.listarAtivos());
    }

    @GetMapping("/todos")
    public ResponseEntity<List<TipoRequerimentoResponse>> listarTodos() {
        return ResponseEntity.ok(tipoRequerimentoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoRequerimentoResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(tipoRequerimentoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<TipoRequerimentoResponse> criar(@Valid @RequestBody TipoRequerimentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoRequerimentoService.criar(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        tipoRequerimentoService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
