package br.edu.femass.desenvsistemas.repository;

import br.edu.femass.desenvsistemas.entity.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    List<Disciplina> findByCursoIdOrderByNomeAsc(Long cursoId);

    List<Disciplina> findByProfessorId(Long professorId);
}
