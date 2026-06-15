package br.edu.femass.desenvsistemas.repository;

import br.edu.femass.desenvsistemas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByMatricula(String matricula);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}
