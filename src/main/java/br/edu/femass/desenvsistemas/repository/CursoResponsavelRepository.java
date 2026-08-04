package br.edu.femass.desenvsistemas.repository;

import br.edu.femass.desenvsistemas.entity.CursoResponsavel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoResponsavelRepository extends JpaRepository<CursoResponsavel, Long> {

    List<CursoResponsavel> findByUserId(Long userId);
}
