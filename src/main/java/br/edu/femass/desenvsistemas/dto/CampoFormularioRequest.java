package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.CampoTipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CampoFormularioRequest {

    @NotNull(message = "O tipo do campo é obrigatório")
    private CampoTipo tipo;

    @NotBlank(message = "O label é obrigatório")
    private String label;

    private String placeholder;

    private List<String> opcoes;

    @NotNull(message = "Informe se o campo é obrigatório")
    private Boolean obrigatorio;

    @NotNull(message = "A ordem é obrigatória")
    private Integer ordem;
}
