package br.edu.femass.desenvsistemas.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String from;

    @Async
    public void enviarConfirmacaoEnvio(String emailAluno, String nomeAluno, String tipoRequerimento, Long protocolo) {
        enviar(
                emailAluno,
                "Requerimento enviado – " + tipoRequerimento,
                html(
                        "Requerimento enviado com sucesso!",
                        nomeAluno,
                        "Seu requerimento de <strong>" + tipoRequerimento + "</strong> foi recebido e está aguardando aprovação.",
                        "Protocolo: <strong>#" + protocolo + "</strong>"
                )
        );
    }

    @Async
    public void enviarNotificacaoPendencia(String emailAprovador, String nomeAprovador,
                                           String nomeAluno, String tipoRequerimento, Long protocolo) {
        enviar(
                emailAprovador,
                "Novo requerimento para aprovar – " + tipoRequerimento,
                html(
                        "Requerimento aguardando sua aprovação",
                        nomeAprovador,
                        "O aluno <strong>" + nomeAluno + "</strong> enviou um requerimento de <strong>" + tipoRequerimento + "</strong>.",
                        "Protocolo <strong>#" + protocolo + "</strong>. Acesse o sistema para aprovar ou rejeitar."
                )
        );
    }

    @Async
    public void enviarResultadoFinal(String emailAluno, String nomeAluno,
                                     String tipoRequerimento, Long protocolo, boolean aprovado) {
        String resultado = aprovado ? "aprovado" : "rejeitado";
        enviar(
                emailAluno,
                "Requerimento " + resultado + " – " + tipoRequerimento,
                html(
                        aprovado ? "Requerimento aprovado!" : "Requerimento rejeitado",
                        nomeAluno,
                        "Seu requerimento de <strong>" + tipoRequerimento + "</strong> foi <strong>" + resultado + "</strong>.",
                        aprovado
                                ? "Acompanhe o andamento acessando o sistema."
                                : "Entre em contato com a secretaria para mais informações."
                )
        );
    }

    @Async
    public void enviarAjustesSolicitados(String emailAluno, String nomeAluno,
                                         String tipoRequerimento, Long protocolo, String observacao) {
        enviar(
                emailAluno,
                "Ajustes solicitados – " + tipoRequerimento,
                html(
                        "Seu requerimento precisa de ajustes",
                        nomeAluno,
                        "Seu requerimento de <strong>" + tipoRequerimento + "</strong> (protocolo #" + protocolo
                                + ") precisa de correções antes de continuar a aprovação.",
                        "O que precisa ser ajustado: <strong>" + observacao + "</strong>",
                        "Acesse o sistema, corrija o que foi apontado e reenvie o requerimento."
                )
        );
    }

    @Async
    public void enviarAvisoPrazo(String emailAprovador, String nomeAprovador,
                                 String nomeSolicitante, String tipoRequerimento,
                                 Long protocolo, LocalDateTime prazoEm) {
        enviar(
                emailAprovador,
                "Prazo de aprovação se aproximando – " + tipoRequerimento,
                html(
                        "Prazo de aprovação se aproximando",
                        nomeAprovador,
                        "O requerimento de <strong>" + tipoRequerimento + "</strong> do aluno <strong>" + nomeSolicitante + "</strong> ainda aguarda sua análise.",
                        "Protocolo <strong>#" + protocolo + "</strong>. Prazo para decisão: <strong>"
                                + prazoEm.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "</strong>."
                )
        );
    }

    private void enviar(String para, String assunto, String corpo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(para);
            helper.setSubject(assunto);
            helper.setText(corpo, true);
            mailSender.send(message);
            log.info("Email enviado para {}: {}", para, assunto);
        } catch (Exception e) {
            log.error("Falha ao enviar email para {}: {}", para, e.getMessage());
        }
    }

    private String html(String titulo, String nomeDestinatario, String... paragrafos) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;color:#333;margin:0;padding:0\">");
        sb.append("<div style=\"max-width:600px;margin:0 auto;padding:32px\">");
        sb.append("<div style=\"border-left:4px solid #2563eb;padding-left:16px;margin-bottom:24px\">");
        sb.append("<h2 style=\"margin:0;color:#1e40af\">").append(titulo).append("</h2>");
        sb.append("</div>");
        sb.append("<p>Olá, <strong>").append(nomeDestinatario).append("</strong>.</p>");
        for (String p : paragrafos) {
            sb.append("<p style=\"line-height:1.6\">").append(p).append("</p>");
        }
        sb.append("<hr style=\"border:none;border-top:1px solid #e2e8f0;margin:24px 0\">");
        sb.append("<p style=\"font-size:12px;color:#94a3b8\">FEMASS – Sistema de Requerimentos</p>");
        sb.append("</div></body></html>");
        return sb.toString();
    }
}
