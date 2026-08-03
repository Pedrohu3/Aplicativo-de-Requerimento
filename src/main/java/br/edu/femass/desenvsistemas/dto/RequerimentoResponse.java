package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.EtapaAprovacao;
import br.edu.femass.desenvsistemas.entity.Requerimento;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.StatusRequerimento;
import br.edu.femass.desenvsistemas.entity.ValorCampo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequerimentoResponse {

    private Long id;
    private Long tipoRequerimentoId;
    private String tipoRequerimentoNome;
    private String solicitanteNome;
    private String solicitanteEmail;
    private String cursoNome;
    private Long disciplinaId;
    private String disciplinaNome;
    private StatusRequerimento status;
    private Integer etapaAtual;
    private Role etapaAtualRole;
    private String etapaAtualDescricao;
    private boolean podeAprovarAtual;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    private LocalDateTime prazoEm;
    private Map<String, String> valores;
    private List<HistoricoAprovacaoResponse> historico;

    public static RequerimentoResponse fromEntity(Requerimento requerimento) {
        Map<String, String> valoresMap = new HashMap<>();
        for (ValorCampo valor : requerimento.getValores()) {
            valoresMap.put(String.valueOf(valor.getCampo().getId()), valor.getValor());
        }

        Role etapaRole = null;
        String etapaDescricao = null;
        if (requerimento.getStatus() == StatusRequerimento.EM_APROVACAO) {
            etapaRole = requerimento.getTipoRequerimento().getEtapas().stream()
                    .filter(e -> e.getOrdem().equals(requerimento.getEtapaAtual()))
                    .findFirst()
                    .map(EtapaAprovacao::getRole)
                    .orElse(null);
            etapaDescricao = requerimento.getTipoRequerimento().getEtapas().stream()
                    .filter(e -> e.getOrdem().equals(requerimento.getEtapaAtual()))
                    .findFirst()
                    .map(EtapaAprovacao::getDescricao)
                    .orElse(null);
        }

        return RequerimentoResponse.builder()
                .id(requerimento.getId())
                .tipoRequerimentoId(requerimento.getTipoRequerimento().getId())
                .tipoRequerimentoNome(requerimento.getTipoRequerimento().getNome())
                .solicitanteNome(requerimento.getSolicitante().getNome())
                .solicitanteEmail(requerimento.getSolicitante().getEmail())
                .cursoNome(requerimento.getCurso() != null ? requerimento.getCurso().getNome() : null)
                .disciplinaId(requerimento.getDisciplina() != null ? requerimento.getDisciplina().getId() : null)
                .disciplinaNome(requerimento.getDisciplina() != null ? requerimento.getDisciplina().getNome() : null)
                .status(requerimento.getStatus())
                .etapaAtual(requerimento.getEtapaAtual())
                .etapaAtualRole(etapaRole)
                .etapaAtualDescricao(etapaDescricao)
                .criadoEm(requerimento.getCriadoEm())
                .atualizadoEm(requerimento.getAtualizadoEm())
                .prazoEm(requerimento.getPrazoEm())
                .valores(valoresMap)
                .historico(requerimento.getHistorico().stream()
                        .map(HistoricoAprovacaoResponse::fromEntity)
                        .toList())
                .build();
    }
}
