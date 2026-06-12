package br.edu.femass.desenvsistemas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TipoRequerimentoRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 200)
    private String nome;

    @Size(max = 1000)
    private String descricao;

    @NotEmpty(message = "Informe ao menos um campo no formulário")
    @Valid
    private List<CampoFormularioRequest> campos;

    @NotEmpty(message = "Informe ao menos uma etapa no fluxo de aprovação")
    @Valid
    private List<EtapaAprovacaoRequest> etapas;
}
