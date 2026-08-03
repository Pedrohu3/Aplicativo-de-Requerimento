package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.AprovacaoRequest;
import br.edu.femass.desenvsistemas.dto.RequerimentoRequest;
import br.edu.femass.desenvsistemas.dto.RequerimentoResponse;
import br.edu.femass.desenvsistemas.entity.AcaoAprovacao;
import br.edu.femass.desenvsistemas.entity.CampoFormulario;
import br.edu.femass.desenvsistemas.entity.Curso;
import br.edu.femass.desenvsistemas.entity.Disciplina;
import br.edu.femass.desenvsistemas.entity.EscopoRequerimento;
import br.edu.femass.desenvsistemas.entity.EtapaAprovacao;
import br.edu.femass.desenvsistemas.entity.HistoricoAprovacao;
import br.edu.femass.desenvsistemas.entity.MotivoRejeicao;
import br.edu.femass.desenvsistemas.entity.Requerimento;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.StatusRequerimento;
import br.edu.femass.desenvsistemas.entity.TipoRequerimento;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.entity.ValorCampo;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.ForbiddenException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.RequerimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RequerimentoService {

    private final RequerimentoRepository requerimentoRepository;
    private final TipoRequerimentoService tipoRequerimentoService;
    private final DisciplinaService disciplinaService;
    private final AuthHelper authHelper;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<RequerimentoResponse> listarMeus() {
        User usuario = authHelper.getCurrentUser();
        return requerimentoRepository.findBySolicitanteIdOrderByCriadoEmDesc(usuario.getId()).stream()
                .map(RequerimentoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequerimentoResponse> listarPendentesAprovacao() {
        User usuario = authHelper.getCurrentUser();
        if (usuario.getRole() == Role.ALUNO) {
            return List.of();
        }

        List<Requerimento> pendentes;

        if (isAdmin(usuario)) {
            pendentes = requerimentoRepository.findAll().stream()
                    .filter(r -> r.getStatus() == StatusRequerimento.EM_APROVACAO)
                    .toList();
        } else {
            pendentes = requerimentoRepository.findPendentesPorRole(
                    StatusRequerimento.EM_APROVACAO,
                    usuario.getRole()
            ).stream()
                    .filter(r -> calcularPodeAprovar(r, usuario))
                    .toList();
        }

        return pendentes.stream()
                .map(RequerimentoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequerimentoResponse buscarPorId(Long id) {
        Requerimento req = getRequerimento(id);
        User usuario = authHelper.getCurrentUser();
        if (!podeVisualizar(req, usuario)) {
            throw new ForbiddenException("Você não tem permissão para visualizar este requerimento");
        }
        RequerimentoResponse response = RequerimentoResponse.fromEntity(req);
        response.setPodeAprovarAtual(calcularPodeAprovar(req, usuario));
        return response;
    }

    @Transactional
    public RequerimentoResponse criar(RequerimentoRequest request) {
        User solicitante = authHelper.getCurrentUser();
        TipoRequerimento tipo = tipoRequerimentoService.getTipo(request.getTipoRequerimentoId());

        if (!Boolean.TRUE.equals(tipo.getAtivo())) {
            throw new BusinessException("Este tipo de requerimento está inativo");
        }

        validarValores(tipo, request.getValores(), Boolean.TRUE.equals(request.getEnviar()));
        Disciplina disciplina = vincularDisciplina(tipo, solicitante, request.getDisciplinaId());

        Requerimento requerimento = Requerimento.builder()
                .tipoRequerimento(tipo)
                .solicitante(solicitante)
                .curso(resolverCurso(tipo, solicitante))
                .disciplina(disciplina)
                .status(Boolean.TRUE.equals(request.getEnviar())
                        ? StatusRequerimento.EM_APROVACAO
                        : StatusRequerimento.RASCUNHO)
                .etapaAtual(0)
                .build();

        if (Boolean.TRUE.equals(request.getEnviar())) {
            finalizarEnvio(requerimento, tipo);
        }

        salvarValores(requerimento, tipo, request.getValores());
        Requerimento saved = requerimentoRepository.save(requerimento);
        if (Boolean.TRUE.equals(request.getEnviar()) && saved.getStatus() == StatusRequerimento.EM_APROVACAO) {
            emailService.enviarConfirmacaoEnvio(
                    saved.getSolicitante().getEmail(), saved.getSolicitante().getNome(),
                    saved.getTipoRequerimento().getNome(), saved.getId());
            notificarProximoAprovador(saved);
        }
        return RequerimentoResponse.fromEntity(saved);
    }

    @Transactional
    public RequerimentoResponse enviar(Long id) {
        Requerimento requerimento = getRequerimento(id);
        User usuario = authHelper.getCurrentUser();

        if (!requerimento.getSolicitante().getId().equals(usuario.getId())) {
            throw new ForbiddenException("Apenas o solicitante pode enviar este requerimento");
        }
        if (requerimento.getStatus() != StatusRequerimento.RASCUNHO) {
            throw new BusinessException("Somente requerimentos em rascunho podem ser enviados");
        }

        Map<String, String> valores = requerimento.getValores().stream()
                .collect(java.util.stream.Collectors.toMap(
                        v -> String.valueOf(v.getCampo().getId()),
                        ValorCampo::getValor
                ));

        validarValores(requerimento.getTipoRequerimento(), valores, true);
        requerimento.setStatus(StatusRequerimento.EM_APROVACAO);
        requerimento.setEtapaAtual(0);
        requerimento.setCurso(resolverCurso(requerimento.getTipoRequerimento(), requerimento.getSolicitante()));
        requerimento.setAtualizadoEm(LocalDateTime.now());
        finalizarEnvio(requerimento, requerimento.getTipoRequerimento());

        Requerimento saved = requerimentoRepository.save(requerimento);
        emailService.enviarConfirmacaoEnvio(
                saved.getSolicitante().getEmail(), saved.getSolicitante().getNome(),
                saved.getTipoRequerimento().getNome(), saved.getId());
        notificarProximoAprovador(saved);
        return RequerimentoResponse.fromEntity(saved);
    }

    @Transactional
    public RequerimentoResponse aprovar(Long id, AprovacaoRequest request) {
        Requerimento requerimento = getRequerimento(id);
        User aprovador = authHelper.getCurrentUser();

        if (requerimento.getStatus() != StatusRequerimento.EM_APROVACAO) {
            throw new BusinessException("Este requerimento não está em aprovação");
        }

        EtapaAprovacao etapaAtual = getEtapaAtual(requerimento);
        validarPermissaoAprovacao(aprovador, etapaAtual, requerimento);

        if (request.getAcao() == AcaoAprovacao.REJEITADO) {
            validarJustificativaRejeicao(request);
            requerimento.setStatus(StatusRequerimento.REJEITADO);
            requerimento.setAtualizadoEm(LocalDateTime.now());
            registrarHistorico(requerimento, aprovador, etapaAtual, request);
            atualizarPrazo(requerimento, requerimento.getTipoRequerimento());
            Requerimento rejeitado = requerimentoRepository.save(requerimento);
            emailService.enviarResultadoFinal(
                    rejeitado.getSolicitante().getEmail(), rejeitado.getSolicitante().getNome(),
                    rejeitado.getTipoRequerimento().getNome(), rejeitado.getId(), false);
            return RequerimentoResponse.fromEntity(rejeitado);
        }

        int proximaEtapa = requerimento.getEtapaAtual() + 1;
        List<EtapaAprovacao> etapas = etapasOrdenadas(requerimento.getTipoRequerimento());
        boolean ultimaEtapa = proximaEtapa >= etapas.size();

        registrarHistorico(requerimento, aprovador, etapaAtual, request);

        if (ultimaEtapa) {
            requerimento.setStatus(StatusRequerimento.APROVADO);
        } else {
            requerimento.setEtapaAtual(proximaEtapa);
        }

        requerimento.setAtualizadoEm(LocalDateTime.now());
        atualizarPrazo(requerimento, requerimento.getTipoRequerimento());
        Requerimento saved = requerimentoRepository.save(requerimento);

        if (ultimaEtapa) {
            emailService.enviarResultadoFinal(
                    saved.getSolicitante().getEmail(), saved.getSolicitante().getNome(),
                    saved.getTipoRequerimento().getNome(), saved.getId(), true);
        } else {
            notificarProximoAprovador(saved);
        }

        return RequerimentoResponse.fromEntity(saved);
    }

    @Transactional
    public RequerimentoResponse atualizar(Long id, RequerimentoRequest request) {
        User usuario = authHelper.getCurrentUser();
        if (!isAdmin(usuario)) {
            throw new ForbiddenException("Apenas administradores podem editar requerimentos");
        }

        Requerimento requerimento = getRequerimento(id);
        TipoRequerimento tipo = requerimento.getTipoRequerimento();

        requerimento.getValores().clear();
        salvarValores(requerimento, tipo, request.getValores());
        requerimento.setAtualizadoEm(LocalDateTime.now());

        return RequerimentoResponse.fromEntity(requerimentoRepository.save(requerimento));
    }

    @Transactional
    public RequerimentoResponse cancelar(Long id) {
        Requerimento requerimento = getRequerimento(id);
        User usuario = authHelper.getCurrentUser();

        if (!requerimento.getSolicitante().getId().equals(usuario.getId())
                && !isAdmin(usuario)) {
            throw new ForbiddenException("Sem permissão para cancelar este requerimento");
        }

        if (requerimento.getStatus() == StatusRequerimento.APROVADO
                || requerimento.getStatus() == StatusRequerimento.REJEITADO) {
            throw new BusinessException("Requerimentos finalizados não podem ser cancelados");
        }

        requerimento.setStatus(StatusRequerimento.CANCELADO);
        requerimento.setAtualizadoEm(LocalDateTime.now());
        atualizarPrazo(requerimento, requerimento.getTipoRequerimento());
        return RequerimentoResponse.fromEntity(requerimentoRepository.save(requerimento));
    }

    private Requerimento getRequerimento(Long id) {
        return requerimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requerimento não encontrado: " + id));
    }

    private void validarValores(TipoRequerimento tipo, Map<String, String> valores, boolean enviar) {
        if (!enviar) {
            return;
        }
        for (CampoFormulario campo : tipo.getCampos()) {
            String valor = valores.get(String.valueOf(campo.getId()));
            if (Boolean.TRUE.equals(campo.getObrigatorio()) && !StringUtils.hasText(valor)) {
                throw new BusinessException("O campo '" + campo.getLabel() + "' é obrigatório");
            }
        }
    }

    private void validarJustificativaRejeicao(AprovacaoRequest request) {
        if (request.getMotivoRejeicao() == null) {
            throw new BusinessException("É obrigatório selecionar um motivo para rejeitar o requerimento");
        }
        if (request.getMotivoRejeicao() == MotivoRejeicao.OUTRO && !StringUtils.hasText(request.getObservacao())) {
            throw new BusinessException("Descreva o motivo da rejeição no campo de observação");
        }
    }

    private void salvarValores(Requerimento requerimento, TipoRequerimento tipo, Map<String, String> valores) {
        for (CampoFormulario campo : tipo.getCampos()) {
            String valor = valores.get(String.valueOf(campo.getId()));
            if (valor != null) {
                requerimento.getValores().add(ValorCampo.builder()
                        .requerimento(requerimento)
                        .campo(campo)
                        .valor(valor)
                        .build());
            }
        }
    }

    private void finalizarEnvio(Requerimento requerimento, TipoRequerimento tipo) {
        if (tipo.getEtapas().isEmpty()) {
            requerimento.setStatus(StatusRequerimento.APROVADO);
        } else if (exigeDisciplina(tipo) && requerimento.getDisciplina() == null) {
            throw new BusinessException("Selecione a disciplina para este requerimento");
        }
        atualizarPrazo(requerimento, tipo);
    }

    private boolean exigeDisciplina(TipoRequerimento tipo) {
        return tipo.getEscopo() == EscopoRequerimento.DISCIPLINA;
    }

    /**
     * Requerimentos ADMINISTRATIVOS não são escopados a um curso: a aprovação vale para
     * qualquer usuário com a role da etapa (papel fixo institucional), independente do curso
     * do solicitante.
     */
    private Curso resolverCurso(TipoRequerimento tipo, User solicitante) {
        return tipo.getEscopo() == EscopoRequerimento.ADMINISTRATIVO ? null : solicitante.getCurso();
    }

    private Disciplina vincularDisciplina(TipoRequerimento tipo, User solicitante, Long disciplinaId) {
        if (disciplinaId == null || !exigeDisciplina(tipo)) {
            return null;
        }
        Disciplina disciplina = disciplinaService.getDisciplina(disciplinaId);
        Curso cursoSolicitante = solicitante.getCurso();
        if (cursoSolicitante == null || !disciplina.getCurso().getId().equals(cursoSolicitante.getId())) {
            throw new BusinessException("A disciplina selecionada não pertence ao seu curso");
        }
        return disciplina;
    }

    private void atualizarPrazo(Requerimento requerimento, TipoRequerimento tipo) {
        if (requerimento.getStatus() != StatusRequerimento.EM_APROVACAO) {
            requerimento.setPrazoEm(null);
            requerimento.setLembreteEnviado(false);
            return;
        }
        EtapaAprovacao etapa = etapasOrdenadas(tipo).stream()
                .filter(e -> e.getOrdem().equals(requerimento.getEtapaAtual()))
                .findFirst()
                .orElse(null);
        requerimento.setPrazoEm(etapa != null && etapa.getDiasLimite() != null
                ? LocalDateTime.now().plusDays(etapa.getDiasLimite())
                : null);
        requerimento.setLembreteEnviado(false);
    }

    private EtapaAprovacao getEtapaAtual(Requerimento requerimento) {
        return etapasOrdenadas(requerimento.getTipoRequerimento()).stream()
                .filter(e -> e.getOrdem().equals(requerimento.getEtapaAtual()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Etapa de aprovação inválida"));
    }

    private List<EtapaAprovacao> etapasOrdenadas(TipoRequerimento tipo) {
        return tipo.getEtapas().stream()
                .sorted(Comparator.comparing(EtapaAprovacao::getOrdem))
                .toList();
    }

    /**
     * Aprovador designado para a etapa: para a role PROFESSOR, sempre o professor da disciplina
     * vinculada ao requerimento (nunca um responsável de curso); para as demais roles, o
     * responsável do curso para a role da etapa. Retorna null quando não há um responsável
     * específico designado.
     */
    User buscarAprovadorDaEtapa(Requerimento requerimento, EtapaAprovacao etapa) {
        if (etapa.getRole() == Role.PROFESSOR) {
            return requerimento.getDisciplina() != null ? requerimento.getDisciplina().getProfessor() : null;
        }
        Curso curso = requerimento.getCurso();
        if (curso == null) {
            return null;
        }
        return curso.getResponsaveis().stream()
                .filter(r -> r.getRole() == etapa.getRole())
                .map(br.edu.femass.desenvsistemas.entity.CursoResponsavel::getUser)
                .findFirst()
                .orElse(null);
    }

    /** Usado pelo agendador de avisos de prazo para achar quem deve ser notificado. */
    User buscarAprovadorAtual(Requerimento requerimento) {
        return etapasOrdenadas(requerimento.getTipoRequerimento()).stream()
                .filter(e -> e.getOrdem().equals(requerimento.getEtapaAtual()))
                .findFirst()
                .map(etapa -> buscarAprovadorDaEtapa(requerimento, etapa))
                .orElse(null);
    }

    private void validarPermissaoAprovacao(User aprovador, EtapaAprovacao etapa, Requerimento requerimento) {
        if (isAdmin(aprovador)) return;
        if (aprovador.getRole() != etapa.getRole()) {
            throw new ForbiddenException("Seu perfil não pode aprovar a etapa atual");
        }

        if (etapa.getRole() == Role.PROFESSOR) {
            User professor = requerimento.getDisciplina() != null ? requerimento.getDisciplina().getProfessor() : null;
            if (professor == null || !professor.getId().equals(aprovador.getId())) {
                throw new ForbiddenException("Você não é o professor responsável pela disciplina deste requerimento");
            }
            return;
        }

        Curso curso = requerimento.getCurso();
        if (curso != null) {
            boolean isDesignado = curso.getResponsaveis().stream()
                    .anyMatch(r -> r.getRole() == etapa.getRole()
                            && r.getUser().getId().equals(aprovador.getId()));
            if (!isDesignado) {
                throw new ForbiddenException("Você não é o responsável por esta etapa para o curso do solicitante");
            }
        }
    }

    private boolean calcularPodeAprovar(Requerimento req, User usuario) {
        if (req.getStatus() != StatusRequerimento.EM_APROVACAO) return false;
        if (isAdmin(usuario)) return true;
        EtapaAprovacao etapa;
        try {
            etapa = getEtapaAtual(req);
        } catch (Exception e) {
            return false;
        }
        if (usuario.getRole() != etapa.getRole()) return false;

        if (etapa.getRole() == Role.PROFESSOR) {
            User professor = req.getDisciplina() != null ? req.getDisciplina().getProfessor() : null;
            return professor != null && professor.getId().equals(usuario.getId());
        }

        Curso curso = req.getCurso();
        if (curso == null) return true;
        return curso.getResponsaveis().stream()
                .anyMatch(r -> r.getRole() == etapa.getRole()
                        && r.getUser().getId().equals(usuario.getId()));
    }

    /**
     * Quem pode visualizar o requerimento: o próprio solicitante, administradores, e usuários
     * cuja role participa de alguma etapa do fluxo do tipo (aprovadores passados/futuros).
     */
    private boolean podeVisualizar(Requerimento requerimento, User usuario) {
        if (isAdmin(usuario)) return true;
        if (requerimento.getSolicitante().getId().equals(usuario.getId())) return true;
        return etapasOrdenadas(requerimento.getTipoRequerimento()).stream()
                .anyMatch(e -> e.getRole() == usuario.getRole());
    }

    private void notificarProximoAprovador(Requerimento requerimento) {
        if (requerimento.getStatus() != StatusRequerimento.EM_APROVACAO) return;
        List<EtapaAprovacao> etapas = etapasOrdenadas(requerimento.getTipoRequerimento());
        etapas.stream()
                .filter(e -> e.getOrdem().equals(requerimento.getEtapaAtual()))
                .findFirst()
                .ifPresent(etapa -> {
                    User aprovador = buscarAprovadorDaEtapa(requerimento, etapa);
                    if (aprovador == null) return;
                    emailService.enviarNotificacaoPendencia(
                            aprovador.getEmail(), aprovador.getNome(),
                            requerimento.getSolicitante().getNome(),
                            requerimento.getTipoRequerimento().getNome(),
                            requerimento.getId());
                });
    }

    private boolean isAdmin(User usuario) {
        return usuario.isAdmin() || usuario.getRole() == Role.ADMIN;
    }

    private void registrarHistorico(
            Requerimento requerimento,
            User aprovador,
            EtapaAprovacao etapa,
            AprovacaoRequest request
    ) {
        requerimento.getHistorico().add(HistoricoAprovacao.builder()
                .requerimento(requerimento)
                .aprovador(aprovador)
                .etapaOrdem(etapa.getOrdem())
                .roleEtapa(etapa.getRole())
                .acao(request.getAcao())
                .observacao(request.getObservacao())
                .motivoRejeicao(request.getAcao() == AcaoAprovacao.REJEITADO ? request.getMotivoRejeicao() : null)
                .build());
    }
}
