package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.dto.CursoRequest;
import br.edu.femass.desenvsistemas.dto.CursoResponsavelRequest;
import br.edu.femass.desenvsistemas.dto.CursoResponse;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.service.CursoService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    @GetMapping
    public List<CursoResponse> listar() {
        return cursoService.listar();
    }

    @GetMapping("/{id}")
    public CursoResponse buscarPorId(@PathVariable Long id) {
        return cursoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public CursoResponse criar(@Valid @RequestBody CursoRequest request) {
        return cursoService.criar(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CursoResponse atualizar(@PathVariable Long id, @Valid @RequestBody CursoRequest request) {
        return cursoService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
        cursoService.deletar(id);
    }

    @PutMapping("/{id}/responsaveis")
    @PreAuthorize("hasRole('ADMIN')")
    public CursoResponse atribuirResponsavel(@PathVariable Long id, @Valid @RequestBody CursoResponsavelRequest request) {
        return cursoService.atribuirResponsavel(id, request);
    }

    @DeleteMapping("/{id}/responsaveis/{role}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void removerResponsavel(@PathVariable Long id, @PathVariable Role role) {
        cursoService.removerResponsavel(id, role);
    }
}
