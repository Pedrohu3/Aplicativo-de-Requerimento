package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.DisciplinaRequest;
import br.edu.femass.desenvsistemas.dto.DisciplinaResponse;
import br.edu.femass.desenvsistemas.entity.Curso;
import br.edu.femass.desenvsistemas.entity.Disciplina;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.DisciplinaRepository;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final UserRepository userRepository;
    private final CursoService cursoService;

    @Transactional(readOnly = true)
    public List<DisciplinaResponse> listar() {
        return disciplinaRepository.findAll().stream()
                .map(DisciplinaResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DisciplinaResponse> listarPorCurso(Long cursoId) {
        return disciplinaRepository.findByCursoIdOrderByNomeAsc(cursoId).stream()
                .map(DisciplinaResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DisciplinaResponse buscarPorId(Long id) {
        return DisciplinaResponse.fromEntity(getDisciplina(id));
    }

    // FUTURA IMPLEMENTAÇÃO — disciplinas (e a matrícula do aluno nelas) vindas do WebAcademico:
    // Hoje disciplinas são cadastradas manualmente aqui, e QUALQUER aluno do curso pode abrir
    // requerimento pra QUALQUER disciplina do curso (não existe o conceito de matrícula por
    // disciplina/período). Na integração real, as disciplinas em si deveriam vir sincronizadas do
    // WebAcademico (mesmo padrão sugerido em UserService.create()), e — mais importante — seria
    // preciso introduzir a matrícula do aluno por disciplina/período (nova entidade
    // `MatriculaDisciplina`, populada pela mesma sincronização) para restringir corretamente quais
    // disciplinas cada aluno pode selecionar. Ver o comentário detalhado em
    // RequerimentoService.vincularDisciplina() para o desenho dessa validação.
    @Transactional
    public DisciplinaResponse criar(DisciplinaRequest request) {
        Curso curso = cursoService.getCurso(request.getCursoId());
        Disciplina disciplina = Disciplina.builder()
                .nome(request.getNome())
                .curso(curso)
                .professor(resolverProfessor(request.getProfessorId()))
                .build();
        return DisciplinaResponse.fromEntity(disciplinaRepository.save(disciplina));
    }

    @Transactional
    public DisciplinaResponse atualizar(Long id, DisciplinaRequest request) {
        Disciplina disciplina = getDisciplina(id);
        Curso curso = cursoService.getCurso(request.getCursoId());
        disciplina.setNome(request.getNome());
        disciplina.setCurso(curso);
        disciplina.setProfessor(resolverProfessor(request.getProfessorId()));
        return DisciplinaResponse.fromEntity(disciplinaRepository.save(disciplina));
    }

    @Transactional
    public void deletar(Long id) {
        if (!disciplinaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Disciplina não encontrada: " + id);
        }
        disciplinaRepository.deleteById(id);
    }

    public Disciplina getDisciplina(Long id) {
        return disciplinaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada: " + id));
    }

    private User resolverProfessor(Long professorId) {
        if (professorId == null) {
            return null;
        }
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + professorId));
        if (!professor.getRoles().contains(Role.PROFESSOR)) {
            throw new BusinessException("O usuário não possui a role PROFESSOR necessária para esta disciplina");
        }
        return professor;
    }
}
