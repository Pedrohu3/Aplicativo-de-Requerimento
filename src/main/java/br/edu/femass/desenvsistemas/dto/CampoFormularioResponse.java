package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.CampoFormulario;
import br.edu.femass.desenvsistemas.entity.CampoTipo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampoFormularioResponse {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long id;
    private CampoTipo tipo;
    private String label;
    private String placeholder;
    private List<String> opcoes;
    private Boolean obrigatorio;
    private Integer ordem;

    public static CampoFormularioResponse fromEntity(CampoFormulario campo) {
        return CampoFormularioResponse.builder()
                .id(campo.getId())
                .tipo(campo.getTipo())
                .label(campo.getLabel())
                .placeholder(campo.getPlaceholder())
                .opcoes(parseOpcoes(campo.getOpcoes()))
                .obrigatorio(campo.getObrigatorio())
                .ordem(campo.getOrdem())
                .build();
    }

    private static List<String> parseOpcoes(String opcoes) {
        if (opcoes == null || opcoes.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(opcoes, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of(opcoes.split(","));
        }
    }
}
