package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.entity.Requerimento;
import br.edu.femass.desenvsistemas.entity.StatusRequerimento;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.repository.RequerimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PrazoAprovacaoScheduler {

    private final RequerimentoRepository requerimentoRepository;
    private final RequerimentoService requerimentoService;
    private final EmailService emailService;

    @Value("${app.prazo.aviso-dias-antes:2}")
    private int avisoDiasAntes;

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void avisarPrazosProximos() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusDays(avisoDiasAntes);
        List<Requerimento> proximos = requerimentoRepository.findByStatusAndPrazoEmBetweenAndLembreteEnviadoFalse(
                StatusRequerimento.EM_APROVACAO, agora, limite);

        for (Requerimento requerimento : proximos) {
            User aprovador = requerimentoService.buscarAprovadorAtual(requerimento);
            if (aprovador == null) {
                continue;
            }
            emailService.enviarAvisoPrazo(
                    aprovador.getEmail(), aprovador.getNome(),
                    requerimento.getSolicitante().getNome(),
                    requerimento.getTipoRequerimento().getNome(),
                    requerimento.getId(), requerimento.getPrazoEm());
            requerimento.setLembreteEnviado(true);
            requerimentoRepository.save(requerimento);
        }
    }
}
