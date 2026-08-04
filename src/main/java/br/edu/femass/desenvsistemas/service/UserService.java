package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.UserRequest;
import br.edu.femass.desenvsistemas.dto.UserResponse;
import br.edu.femass.desenvsistemas.dto.UserUpdateRequest;
import br.edu.femass.desenvsistemas.entity.Curso;
import br.edu.femass.desenvsistemas.entity.CursoResponsavel;
import br.edu.femass.desenvsistemas.entity.Disciplina;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.DuplicateResourceException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.CursoRepository;
import br.edu.femass.desenvsistemas.repository.CursoResponsavelRepository;
import br.edu.femass.desenvsistemas.repository.DisciplinaRepository;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.TreeSet;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final CursoResponsavelRepository cursoResponsavelRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
        return toResponse(user);
    }

    // FUTURA IMPLEMENTAÇÃO — provisionamento de usuários via WebAcademico:
    //
    // Hoje todo usuário (aluno, professor, secretário etc.) é cadastrado manualmente por um
    // admin nesta tela. Para uso real pela universidade, alunos e professores deveriam ser
    // importados/sincronizados a partir do sistema acadêmico oficial (WebAcademico), que é a
    // fonte de verdade de matrícula, vínculo com curso e dados pessoais — este CRUD manual
    // deveria sobrar só para contas "internas" (secretário, coordenador, diretor, admin).
    //
    // Passos sugeridos:
    // 1. Job agendado (@Scheduled, como o PrazoAprovacaoScheduler) ou endpoint de importação que
    //    consome a API/extrato do WebAcademico e faz upsert de usuários por e-mail/RA — criando
    //    quem não existe e atualizando nome/curso/role de quem já existe.
    // 2. Ao sincronizar, NÃO sobrescrever a senha de quem já tem login local; e definir alguma
    //    estratégia de senha inicial pra quem é criado pela sincronização (ex.: exigir "primeiro
    //    acesso" via e-mail, já que hoje o cadastro manual sempre define a senha na hora).
    // 3. Este método `create()` continua existindo para os casos manuais (contas internas), mas
    //    o fluxo de aluno/professor passa a ser predominantemente automático.
    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Já existe um usuário com o e-mail: " + request.getEmail());
        }

        boolean admin = Boolean.TRUE.equals(request.getAdmin());
        validarRolesEAdmin(request.getRoles(), admin);

        User user = User.builder()
                .nome(request.getNome())
                .matricula(request.getMatricula())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .roles(request.getRoles())
                .admin(admin)
                .build();

        if (request.getCursoId() != null) {
            Curso curso = cursoRepository.findById(request.getCursoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + request.getCursoId()));
            user.setCurso(curso);
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new DuplicateResourceException("Já existe um usuário com o e-mail: " + request.getEmail());
        }

        boolean admin = Boolean.TRUE.equals(request.getAdmin());
        validarRolesEAdmin(request.getRoles(), admin);

        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        user.setRoles(request.getRoles());
        user.setAdmin(admin);

        if (request.getCursoId() != null) {
            Curso curso = cursoRepository.findById(request.getCursoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + request.getCursoId()));
            user.setCurso(curso);
        } else {
            user.setCurso(null);
        }

        if (StringUtils.hasText(request.getSenha())) {
            user.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        return toResponse(userRepository.save(user));
    }

    private void validarRolesEAdmin(Set<Role> roles, boolean admin) {
        boolean isAluno = roles.contains(Role.ALUNO);
        if (isAluno && roles.size() > 1) {
            throw new BusinessException("A role ALUNO não pode ser combinada com outras roles");
        }
        if (isAluno && admin) {
            throw new BusinessException("Usuários com role ALUNO não podem receber a flag de administrador");
        }
    }

    private UserResponse toResponse(User user) {
        UserResponse response = UserResponse.fromEntity(user);
        response.setCursosVinculados(resolverCursosVinculados(user));
        return response;
    }

    private List<String> resolverCursosVinculados(User user) {
        Set<String> nomes = new TreeSet<>();
        if (user.getRoles().contains(Role.PROFESSOR)) {
            disciplinaRepository.findByProfessorId(user.getId()).stream()
                    .map(Disciplina::getCurso)
                    .filter(java.util.Objects::nonNull)
                    .map(Curso::getNome)
                    .forEach(nomes::add);
        }
        if (user.getRoles().contains(Role.SECRETARIO)
                || user.getRoles().contains(Role.COORDENADOR)
                || user.getRoles().contains(Role.DIRETOR)) {
            cursoResponsavelRepository.findByUserId(user.getId()).stream()
                    .map(CursoResponsavel::getCurso)
                    .filter(java.util.Objects::nonNull)
                    .map(Curso::getNome)
                    .forEach(nomes::add);
        }
        return List.copyOf(nomes);
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com id: " + id);
        }
        userRepository.deleteById(id);
    }
}
