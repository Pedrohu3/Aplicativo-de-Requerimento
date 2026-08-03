package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.AcaoAprovacao;
import br.edu.femass.desenvsistemas.entity.HistoricoAprovacao;
import br.edu.femass.desenvsistemas.entity.MotivoRejeicao;
import br.edu.femass.desenvsistemas.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoAprovacaoResponse {

    private Long id;
    private String aprovadorNome;
    private Integer etapaOrdem;
    private Role roleEtapa;
    private AcaoAprovacao acao;
    private String observacao;
    private MotivoRejeicao motivoRejeicao;
    private LocalDateTime criadoEm;

    public static HistoricoAprovacaoResponse fromEntity(HistoricoAprovacao historico) {
        return HistoricoAprovacaoResponse.builder()
                .id(historico.getId())
                .aprovadorNome(historico.getAprovador().getNome())
                .etapaOrdem(historico.getEtapaOrdem())
                .roleEtapa(historico.getRoleEtapa())
                .acao(historico.getAcao())
                .observacao(historico.getObservacao())
                .motivoRejeicao(historico.getMotivoRejeicao())
                .criadoEm(historico.getCriadoEm())
                .build();
    }
}
