package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EtapaAprovacaoRequest {

    @NotNull(message = "A ordem da etapa é obrigatória")
    private Integer ordem;

    @NotNull(message = "A role da etapa é obrigatória")
    private Role role;

    private String descricao;
}
