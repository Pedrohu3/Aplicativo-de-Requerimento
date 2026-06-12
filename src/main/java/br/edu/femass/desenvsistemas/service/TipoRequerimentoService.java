package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.CampoFormularioRequest;
import br.edu.femass.desenvsistemas.dto.EtapaAprovacaoRequest;
import br.edu.femass.desenvsistemas.dto.TipoRequerimentoRequest;
import br.edu.femass.desenvsistemas.dto.TipoRequerimentoResponse;
import br.edu.femass.desenvsistemas.entity.CampoFormulario;
import br.edu.femass.desenvsistemas.entity.CampoTipo;
import br.edu.femass.desenvsistemas.entity.EtapaAprovacao;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.TipoRequerimento;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.ForbiddenException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.TipoRequerimentoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        TipoRequerimento tipo = TipoRequerimento.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .criador(criador)
                .build();

        request.getCampos().forEach(campoReq -> tipo.getCampos().add(buildCampo(campoReq, tipo)));
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
