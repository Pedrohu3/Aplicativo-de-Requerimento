package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.dto.DisciplinaRequest;
import br.edu.femass.desenvsistemas.dto.DisciplinaResponse;
import br.edu.femass.desenvsistemas.service.DisciplinaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/disciplinas")
@RequiredArgsConstructor
public class DisciplinaController {

    private final DisciplinaService disciplinaService;

    @GetMapping
    public List<DisciplinaResponse> listar(@RequestParam(required = false) Long cursoId) {
        return cursoId != null ? disciplinaService.listarPorCurso(cursoId) : disciplinaService.listar();
    }

    @GetMapping("/{id}")
    public DisciplinaResponse buscarPorId(@PathVariable Long id) {
        return disciplinaService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public DisciplinaResponse criar(@Valid @RequestBody DisciplinaRequest request) {
        return disciplinaService.criar(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DisciplinaResponse atualizar(@PathVariable Long id, @Valid @RequestBody DisciplinaRequest request) {
        return disciplinaService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
        disciplinaService.deletar(id);
    }
}
