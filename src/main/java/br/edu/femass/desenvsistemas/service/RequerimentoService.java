package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.AprovacaoRequest;
import br.edu.femass.desenvsistemas.dto.RequerimentoRequest;
import br.edu.femass.desenvsistemas.dto.RequerimentoResponse;
import br.edu.femass.desenvsistemas.entity.AcaoAprovacao;
import br.edu.femass.desenvsistemas.entity.CampoFormulario;
import br.edu.femass.desenvsistemas.entity.EtapaAprovacao;
import br.edu.femass.desenvsistemas.entity.HistoricoAprovacao;
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
    private final AuthHelper authHelper;

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
            throw new ForbiddenException("Alunos não possuem fila de aprovação");
        }

        List<Requerimento> pendentes = requerimentoRepository.findPendentesPorRole(
                StatusRequerimento.EM_APROVACAO,
                usuario.getRole()
        );

        if (usuario.getRole() == Role.ADMIN) {
            pendentes = requerimentoRepository.findAll().stream()
                    .filter(r -> r.getStatus() == StatusRequerimento.EM_APROVACAO)
                    .toList();
        }

        return pendentes.stream()
                .map(RequerimentoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public RequerimentoResponse buscarPorId(Long id) {
        return RequerimentoResponse.fromEntity(getRequerimento(id));
    }

    @Transactional
    public RequerimentoResponse criar(RequerimentoRequest request) {
        User solicitante = authHelper.getCurrentUser();
        TipoRequerimento tipo = tipoRequerimentoService.getTipo(request.getTipoRequerimentoId());

        if (!Boolean.TRUE.equals(tipo.getAtivo())) {
            throw new BusinessException("Este tipo de requerimento está inativo");
        }

        validarValores(tipo, request.getValores(), Boolean.TRUE.equals(request.getEnviar()));

        Requerimento requerimento = Requerimento.builder()
                .tipoRequerimento(tipo)
                .solicitante(solicitante)
                .status(Boolean.TRUE.equals(request.getEnviar())
                        ? StatusRequerimento.EM_APROVACAO
                        : StatusRequerimento.RASCUNHO)
                .etapaAtual(0)
                .build();

        if (Boolean.TRUE.equals(request.getEnviar())) {
            finalizarEnvio(requerimento, tipo);
        }

        salvarValores(requerimento, tipo, request.getValores());
        return RequerimentoResponse.fromEntity(requerimentoRepository.save(requerimento));
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
        requerimento.setAtualizadoEm(LocalDateTime.now());
        finalizarEnvio(requerimento, requerimento.getTipoRequerimento());

        return RequerimentoResponse.fromEntity(requerimentoRepository.save(requerimento));
    }

    @Transactional
    public RequerimentoResponse aprovar(Long id, AprovacaoRequest request) {
        Requerimento requerimento = getRequerimento(id);
        User aprovador = authHelper.getCurrentUser();

        if (requerimento.getStatus() != StatusRequerimento.EM_APROVACAO) {
            throw new BusinessException("Este requerimento não está em aprovação");
        }

        EtapaAprovacao etapaAtual = getEtapaAtual(requerimento);
        validarPermissaoAprovacao(aprovador, etapaAtual);

        if (request.getAcao() == AcaoAprovacao.REJEITADO) {
            requerimento.setStatus(StatusRequerimento.REJEITADO);
            requerimento.setAtualizadoEm(LocalDateTime.now());
            registrarHistorico(requerimento, aprovador, etapaAtual, request);
            return RequerimentoResponse.fromEntity(requerimentoRepository.save(requerimento));
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
        return RequerimentoResponse.fromEntity(requerimentoRepository.save(requerimento));
    }

    @Transactional
    public RequerimentoResponse cancelar(Long id) {
        Requerimento requerimento = getRequerimento(id);
        User usuario = authHelper.getCurrentUser();

        if (!requerimento.getSolicitante().getId().equals(usuario.getId())
                && usuario.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Sem permissão para cancelar este requerimento");
        }

        if (requerimento.getStatus() == StatusRequerimento.APROVADO
                || requerimento.getStatus() == StatusRequerimento.REJEITADO) {
            throw new BusinessException("Requerimentos finalizados não podem ser cancelados");
        }

        requerimento.setStatus(StatusRequerimento.CANCELADO);
        requerimento.setAtualizadoEm(LocalDateTime.now());
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
        }
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

    private void validarPermissaoAprovacao(User aprovador, EtapaAprovacao etapa) {
        if (aprovador.getRole() == Role.ADMIN) {
            return;
        }
        if (aprovador.getRole() != etapa.getRole()) {
            throw new ForbiddenException("Seu perfil não pode aprovar a etapa atual");
        }
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
                .build());
    }
}
