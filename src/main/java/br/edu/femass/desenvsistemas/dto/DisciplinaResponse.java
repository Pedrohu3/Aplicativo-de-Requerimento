package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.Disciplina;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisciplinaResponse {

    private Long id;
    private String nome;
    private Long cursoId;
    private String cursoNome;
    private Long professorId;
    private String professorNome;

    public static DisciplinaResponse fromEntity(Disciplina disciplina) {
        return DisciplinaResponse.builder()
                .id(disciplina.getId())
                .nome(disciplina.getNome())
                .cursoId(disciplina.getCurso().getId())
                .cursoNome(disciplina.getCurso().getNome())
                .professorId(disciplina.getProfessor() != null ? disciplina.getProfessor().getId() : null)
                .professorNome(disciplina.getProfessor() != null ? disciplina.getProfessor().getNome() : null)
                .build();
    }
}
