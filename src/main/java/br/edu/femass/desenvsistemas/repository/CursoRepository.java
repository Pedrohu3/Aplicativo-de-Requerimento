package br.edu.femass.desenvsistemas.repository;

import br.edu.femass.desenvsistemas.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {
}
