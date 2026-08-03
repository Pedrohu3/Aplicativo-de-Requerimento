package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.CursoRequest;
import br.edu.femass.desenvsistemas.dto.CursoResponsavelRequest;
import br.edu.femass.desenvsistemas.dto.CursoResponse;
import br.edu.femass.desenvsistemas.entity.Curso;
import br.edu.femass.desenvsistemas.entity.CursoResponsavel;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.CursoRepository;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CursoResponse> listar() {
        return cursoRepository.findAll().stream()
                .map(CursoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CursoResponse buscarPorId(Long id) {
        return CursoResponse.fromEntity(getCurso(id));
    }

    @Transactional
    public CursoResponse criar(CursoRequest request) {
        Curso curso = Curso.builder()
                .nome(request.getNome())
                .build();
        return CursoResponse.fromEntity(cursoRepository.save(curso));
    }

    @Transactional
    public CursoResponse atualizar(Long id, CursoRequest request) {
        Curso curso = getCurso(id);
        curso.setNome(request.getNome());
        return CursoResponse.fromEntity(cursoRepository.save(curso));
    }

    @Transactional
    public void deletar(Long id) {
        if (!cursoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Curso não encontrado: " + id);
        }
        cursoRepository.deleteById(id);
    }

    @Transactional
    public CursoResponse atribuirResponsavel(Long cursoId, CursoResponsavelRequest request) {
        if (request.getRole() == Role.PROFESSOR) {
            throw new BusinessException(
                    "Professores não são mais atribuídos por curso — cadastre-os por disciplina na tela de Disciplinas");
        }

        Curso curso = getCurso(cursoId);
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + request.getUserId()));

        if (user.getRole() != request.getRole()) {
            throw new BusinessException("O usuário não possui a role " + request.getRole() + " necessária para esta etapa");
        }

        curso.getResponsaveis().removeIf(r -> r.getRole() == request.getRole());
        curso.getResponsaveis().add(CursoResponsavel.builder()
                .curso(curso)
                .role(request.getRole())
                .user(user)
                .build());

        return CursoResponse.fromEntity(cursoRepository.save(curso));
    }

    @Transactional
    public CursoResponse removerResponsavel(Long cursoId, br.edu.femass.desenvsistemas.entity.Role role) {
        Curso curso = getCurso(cursoId);
        boolean removed = curso.getResponsaveis().removeIf(r -> r.getRole() == role);
        if (!removed) {
            throw new ResourceNotFoundException("Responsável com role " + role + " não encontrado neste curso");
        }
        return CursoResponse.fromEntity(cursoRepository.save(curso));
    }

    public Curso getCurso(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + id));
    }
}
