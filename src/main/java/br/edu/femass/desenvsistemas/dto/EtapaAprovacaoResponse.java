package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.EtapaAprovacao;
import br.edu.femass.desenvsistemas.entity.Role;
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
public class EtapaAprovacaoResponse {

    private Long id;
    private Integer ordem;
    private Role role;
    private String descricao;

    public static EtapaAprovacaoResponse fromEntity(EtapaAprovacao etapa) {
        return EtapaAprovacaoResponse.builder()
                .id(etapa.getId())
                .ordem(etapa.getOrdem())
                .role(etapa.getRole())
                .descricao(etapa.getDescricao())
                .build();
    }
}
