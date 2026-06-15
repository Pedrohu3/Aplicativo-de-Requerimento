package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.dto.UserRequest;
import br.edu.femass.desenvsistemas.dto.UserResponse;
import br.edu.femass.desenvsistemas.dto.UserUpdateRequest;
import br.edu.femass.desenvsistemas.entity.Curso;
import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.exception.BusinessException;
import br.edu.femass.desenvsistemas.exception.DuplicateResourceException;
import br.edu.femass.desenvsistemas.exception.ResourceNotFoundException;
import br.edu.femass.desenvsistemas.repository.CursoRepository;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CursoRepository cursoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userRepository.findById(id)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Já existe um usuário com o e-mail: " + request.getEmail());
        }

        if (Boolean.TRUE.equals(request.getAdmin()) && request.getRole() == Role.ALUNO) {
            throw new BusinessException("Usuários com role ALUNO não podem receber a flag de administrador");
        }

        User user = User.builder()
                .nome(request.getNome())
                .matricula(request.getMatricula())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .role(request.getRole())
                .admin(Boolean.TRUE.equals(request.getAdmin()))
                .build();

        if (request.getCursoId() != null) {
            Curso curso = cursoRepository.findById(request.getCursoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + request.getCursoId()));
            user.setCurso(curso);
        }

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new DuplicateResourceException("Já existe um usuário com o e-mail: " + request.getEmail());
        }

        if (Boolean.TRUE.equals(request.getAdmin()) && request.getRole() == Role.ALUNO) {
            throw new BusinessException("Usuários com role ALUNO não podem receber a flag de administrador");
        }

        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setAdmin(Boolean.TRUE.equals(request.getAdmin()));

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

        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com id: " + id);
        }
        userRepository.deleteById(id);
    }
}
