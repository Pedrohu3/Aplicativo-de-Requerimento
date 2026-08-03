package br.edu.femass.desenvsistemas.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class RequerimentoRequest {

    @NotNull(message = "O tipo de requerimento é obrigatório")
    private Long tipoRequerimentoId;

    @NotEmpty(message = "Preencha os valores do formulário")
    private Map<String, String> valores;

    private Boolean enviar;

    private Long disciplinaId;
}
