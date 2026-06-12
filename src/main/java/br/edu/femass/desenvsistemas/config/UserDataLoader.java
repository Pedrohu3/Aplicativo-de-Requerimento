package br.edu.femass.desenvsistemas.config;

import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        criarSeNaoExistir("Administrador", "admin@femass.edu.br", "admin123", Role.ADMIN);
        criarSeNaoExistir("Ana Aluno", "aluno@femass.edu.br", "senha123", Role.ALUNO);
        criarSeNaoExistir("Carlos Professor", "professor@femass.edu.br", "senha123", Role.PROFESSOR);
        criarSeNaoExistir("Maria Coordenadora", "coordenador@femass.edu.br", "senha123", Role.COORDENADOR);
        criarSeNaoExistir("João Diretor", "diretor@femass.edu.br", "senha123", Role.DIRETOR);
        criarSeNaoExistir("Paula Secretária", "secretario@femass.edu.br", "senha123", Role.SECRETARIO);
    }

    private void criarSeNaoExistir(String nome, String email, String senha, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            userRepository.save(User.builder()
                    .nome(nome)
                    .email(email)
                    .senha(passwordEncoder.encode(senha))
                    .role(role)
                    .build());
        }
    }
}
