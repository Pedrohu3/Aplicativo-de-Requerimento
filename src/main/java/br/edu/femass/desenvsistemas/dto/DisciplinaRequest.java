package br.edu.femass.desenvsistemas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisciplinaRequest {

    @NotBlank(message = "O nome da disciplina é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String nome;

    @NotNull(message = "O curso é obrigatório")
    private Long cursoId;

    private Long professorId;
}
