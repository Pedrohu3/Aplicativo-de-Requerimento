package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.EscopoRequerimento;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.TipoRequerimento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoRequerimentoResponse {

    private Long id;
    private String nome;
    private String descricao;
    private String criadorNome;
    private Boolean ativo;
    private EscopoRequerimento escopo;
    private LocalDateTime criadoEm;
    private List<CampoFormularioResponse> campos;
    private List<EtapaAprovacaoResponse> etapas;
    private Set<Role> rolesPermitidas;

    public static TipoRequerimentoResponse fromEntity(TipoRequerimento tipo) {
        return TipoRequerimentoResponse.builder()
                .id(tipo.getId())
                .nome(tipo.getNome())
                .descricao(tipo.getDescricao())
                .criadorNome(tipo.getCriador().getNome())
                .ativo(tipo.getAtivo())
                .escopo(tipo.getEscopo())
                .criadoEm(tipo.getCriadoEm())
                .campos(tipo.getCampos().stream().map(CampoFormularioResponse::fromEntity).toList())
                .etapas(tipo.getEtapas().stream().map(EtapaAprovacaoResponse::fromEntity).toList())
                .rolesPermitidas(tipo.getRolesPermitidas())
                .build();
    }
}
