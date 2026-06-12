package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.AcaoAprovacao;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AprovacaoRequest {

    @NotNull(message = "A ação é obrigatória")
    private AcaoAprovacao acao;

    private String observacao;
}
