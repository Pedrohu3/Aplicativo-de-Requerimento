package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.CampoFormularioRequest;
import br.edu.femass.desenvsistemas.dto.EtapaAprovacaoRequest;
import br.edu.femass.desenvsistemas.dto.TipoRequerimentoRequest;
import br.edu.femass.desenvsistemas.dto.TipoRequerimentoResponse;
import br.edu.femass.desenvsistemas.entity.CampoFormulario;
import br.edu.femass.desenvsistemas.entity.CampoTipo;
import br.edu.femass.desenvsistemas.entity.EscopoRequerimento;
import br.edu.femass.desenvsistemas.entity.EtapaAprovacao;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.TipoRequerimento;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.ForbiddenException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.RequerimentoRepository;
import br.edu.femass.desenvsistemas.repository.TipoRequerimentoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TipoRequerimentoService {

    private static final Set<Role> ROLES_CRIACAO = EnumSet.of(
            Role.ADMIN, Role.SECRETARIO, Role.COORDENADOR, Role.DIRETOR
    );

    private static final Set<CampoTipo> TIPOS_COM_OPCOES = EnumSet.of(
            CampoTipo.SELECAO, CampoTipo.OPCAO_UNICA, CampoTipo.CHECKBOX
    );

    private final TipoRequerimentoRepository tipoRequerimentoRepository;
    private final RequerimentoRepository requerimentoRepository;
    private final AuthHelper authHelper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<TipoRequerimentoResponse> listarAtivos() {
        return tipoRequerimentoRepository.findByAtivoTrueOrderByNomeAsc().stream()
                .map(TipoRequerimentoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TipoRequerimentoResponse> listarTodos() {
        return tipoRequerimentoRepository.findAll().stream()
                .map(TipoRequerimentoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TipoRequerimentoResponse buscarPorId(Long id) {
        return TipoRequerimentoResponse.fromEntity(getTipo(id));
    }

    @Transactional
    public TipoRequerimentoResponse criar(TipoRequerimentoRequest request) {
        User criador = authHelper.getCurrentUser();
        validarPermissaoCriacao(criador);
        validarCampos(request.getCampos());
        validarEtapas(request.getEtapas());
        validarEscopo(request.getEscopo(), request.getEtapas());

        TipoRequerimento tipo = TipoRequerimento.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .escopo(request.getEscopo())
                .criador(criador)
                .build();

        adicionarCamposFixos(tipo);
        int ordemBase = tipo.getCampos().size();
        for (int i = 0; i < request.getCampos().size(); i++) {
            CampoFormulario campo = buildCampo(request.getCampos().get(i), tipo);
            campo.setOrdem(i + ordemBase);
            tipo.getCampos().add(campo);
        }
        request.getEtapas().forEach(etapaReq -> tipo.getEtapas().add(buildEtapa(etapaReq, tipo)));

        return TipoRequerimentoResponse.fromEntity(tipoRequerimentoRepository.save(tipo));
    }

    @Transactional
    public TipoRequerimentoResponse atualizar(Long id, TipoRequerimentoRequest request) {
        User usuario = authHelper.getCurrentUser();
        validarPermissaoCriacao(usuario);
        validarCampos(request.getCampos());
        validarEtapas(request.getEtapas());
        validarEscopo(request.getEscopo(), request.getEtapas());

        TipoRequerimento tipo = getTipo(id);
        tipo.setNome(request.getNome());
        tipo.setDescricao(request.getDescricao());
        tipo.setEscopo(request.getEscopo());

        // Recria os campos fixos se o conjunto esperado mudou (ex.: escopo trocou para/de
        // ADMINISTRATIVO ou DISCIPLINA) — só é permitido enquanto o tipo não tiver requerimentos.
        Set<String> labelsAtuais = tipo.getCampos().stream()
                .filter(c -> Boolean.TRUE.equals(c.getFixo()))
                .map(CampoFormulario::getLabel)
                .collect(java.util.stream.Collectors.toSet());
        Set<String> labelsEsperados = labelsCamposFixos(request.getEscopo());
        if (!labelsAtuais.equals(labelsEsperados)) {
            if (requerimentoRepository.existsByTipoRequerimentoId(id)) {
                throw new BusinessException(
                        "Não é possível alterar os campos fixos de um tipo que já possui requerimentos");
            }
            tipo.getCampos().removeIf(c -> Boolean.TRUE.equals(c.getFixo()));
            adicionarCamposFixos(tipo);
        }

        // Atualiza apenas campos customizados in-place para preservar IDs (FK de ValorCampo)
        List<CampoFormulario> existentesCustom = new ArrayList<>(
                tipo.getCampos().stream().filter(c -> !Boolean.TRUE.equals(c.getFixo())).toList());
        List<CampoFormularioRequest> novos = request.getCampos();
        int ordemBase = tipo.getCampos().size() - existentesCustom.size();

        for (int i = 0; i < novos.size(); i++) {
            CampoFormularioRequest campoReq = novos.get(i);
            if (i < existentesCustom.size()) {
                CampoFormulario campo = existentesCustom.get(i);
                campo.setTipo(campoReq.getTipo());
                campo.setLabel(campoReq.getLabel());
                campo.setPlaceholder(campoReq.getPlaceholder());
                campo.setOpcoes(serializeOpcoes(campoReq.getOpcoes()));
                campo.setObrigatorio(campoReq.getObrigatorio());
                campo.setOrdem(i + ordemBase);
            } else {
                CampoFormulario campo = buildCampo(campoReq, tipo);
                campo.setOrdem(i + ordemBase);
                tipo.getCampos().add(campo);
            }
        }

        if (novos.size() < existentesCustom.size()) {
            if (requerimentoRepository.existsByTipoRequerimentoId(id)) {
                throw new BusinessException("Não é possível remover campos de um tipo que já possui requerimentos");
            }
            for (int i = existentesCustom.size() - 1; i >= novos.size(); i--) {
                tipo.getCampos().remove(existentesCustom.get(i));
            }
        }

        // Etapas podem ser recriadas livremente (histórico armazena ordem/role, sem FK)
        tipo.getEtapas().clear();
        request.getEtapas().forEach(etapaReq -> tipo.getEtapas().add(buildEtapa(etapaReq, tipo)));

        return TipoRequerimentoResponse.fromEntity(tipoRequerimentoRepository.save(tipo));
    }

    @Transactional
    public void desativar(Long id) {
        User usuario = authHelper.getCurrentUser();
        validarPermissaoCriacao(usuario);
        TipoRequerimento tipo = getTipo(id);
        tipo.setAtivo(false);
        tipoRequerimentoRepository.save(tipo);
    }

    public TipoRequerimento getTipo(Long id) {
        return tipoRequerimentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de requerimento não encontrado: " + id));
    }

    private void validarPermissaoCriacao(User usuario) {
        if (!ROLES_CRIACAO.contains(usuario.getRole())) {
            throw new ForbiddenException("Sem permissão para gerenciar tipos de requerimento");
        }
    }

    private void validarCampos(List<CampoFormularioRequest> campos) {
        for (CampoFormularioRequest campo : campos) {
            if (TIPOS_COM_OPCOES.contains(campo.getTipo())
                    && (campo.getOpcoes() == null || campo.getOpcoes().isEmpty())) {
                throw new BusinessException("O campo '" + campo.getLabel() + "' exige opções");
            }
        }
    }

    private void validarEtapas(List<EtapaAprovacaoRequest> etapas) {
        long ordensDistintas = etapas.stream().map(EtapaAprovacaoRequest::getOrdem).distinct().count();
        if (ordensDistintas != etapas.size()) {
            throw new BusinessException("As etapas do fluxo devem ter ordens únicas");
        }
    }

    private void validarEscopo(EscopoRequerimento escopo, List<EtapaAprovacaoRequest> etapas) {
        boolean temEtapaProfessor = etapas.stream().anyMatch(e -> e.getRole() == Role.PROFESSOR);

        if (escopo == EscopoRequerimento.DISCIPLINA && !temEtapaProfessor) {
            throw new BusinessException("O escopo Disciplina exige ao menos uma etapa com a role PROFESSOR");
        }
        if (escopo != EscopoRequerimento.DISCIPLINA && temEtapaProfessor) {
            throw new BusinessException(
                    "Etapas com a role PROFESSOR só são permitidas em tipos com escopo Disciplina");
        }
    }

    /**
     * Campos fixos por escopo: Nome e Matrícula sempre existem; Curso sai para tipos
     * ADMINISTRATIVO (solicitados por servidores, que podem não ter curso vinculado);
     * Disciplina só existe para tipos DISCIPLINA (o aluno escolhe, define o professor aprovador).
     */
    private Set<String> labelsCamposFixos(EscopoRequerimento escopo) {
        Set<String> labels = new java.util.LinkedHashSet<>(List.of("Nome", "Matrícula"));
        if (escopo != EscopoRequerimento.ADMINISTRATIVO) {
            labels.add("Curso");
        }
        if (escopo == EscopoRequerimento.DISCIPLINA) {
            labels.add("Disciplina");
        }
        return labels;
    }

    private void adicionarCamposFixos(TipoRequerimento tipo) {
        int ordem = 0;
        tipo.getCampos().add(CampoFormulario.builder()
                .tipoRequerimento(tipo).tipo(CampoTipo.TEXTO).label("Nome")
                .fixo(true).obrigatorio(true).ordem(ordem++).build());
        tipo.getCampos().add(CampoFormulario.builder()
                .tipoRequerimento(tipo).tipo(CampoTipo.TEXTO).label("Matrícula")
                .fixo(true).obrigatorio(true).ordem(ordem++).build());
        if (tipo.getEscopo() != EscopoRequerimento.ADMINISTRATIVO) {
            tipo.getCampos().add(CampoFormulario.builder()
                    .tipoRequerimento(tipo).tipo(CampoTipo.TEXTO).label("Curso")
                    .fixo(true).obrigatorio(true).ordem(ordem++).build());
        }
        if (tipo.getEscopo() == EscopoRequerimento.DISCIPLINA) {
            tipo.getCampos().add(CampoFormulario.builder()
                    .tipoRequerimento(tipo).tipo(CampoTipo.SELECAO).label("Disciplina")
                    .fixo(true).obrigatorio(true).ordem(ordem++).build());
        }
    }

    private CampoFormulario buildCampo(CampoFormularioRequest request, TipoRequerimento tipo) {
        return CampoFormulario.builder()
                .tipoRequerimento(tipo)
                .tipo(request.getTipo())
                .label(request.getLabel())
                .placeholder(request.getPlaceholder())
                .opcoes(serializeOpcoes(request.getOpcoes()))
                .obrigatorio(request.getObrigatorio())
                .ordem(request.getOrdem())
                .build();
    }

    private EtapaAprovacao buildEtapa(EtapaAprovacaoRequest request, TipoRequerimento tipo) {
        return EtapaAprovacao.builder()
                .tipoRequerimento(tipo)
                .ordem(request.getOrdem())
                .role(request.getRole())
                .descricao(request.getDescricao())
                .diasLimite(request.getDiasLimite())
                .build();
    }

    private String serializeOpcoes(List<String> opcoes) {
        if (opcoes == null || opcoes.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(opcoes);
        } catch (Exception e) {
            throw new BusinessException("Erro ao serializar opções do campo");
        }
    }
}
