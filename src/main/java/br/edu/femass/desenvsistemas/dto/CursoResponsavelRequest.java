package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CursoResponsavelRequest {

    @NotNull(message = "A role é obrigatória")
    private Role role;

    @NotNull(message = "O usuário é obrigatório")
    private Long userId;
}
