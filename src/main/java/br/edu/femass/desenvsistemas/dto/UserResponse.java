package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String nome;
    private String matricula;
    private String email;
    private Set<Role> roles;
    private boolean admin;
    private Long cursoId;
    private String cursoNome;
    private List<String> cursosVinculados;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .nome(user.getNome())
                .matricula(user.getMatricula())
                .email(user.getEmail())
                .roles(user.getRoles())
                .admin(user.isAdmin())
                .cursoId(user.getCurso() != null ? user.getCurso().getId() : null)
                .cursoNome(user.getCurso() != null ? user.getCurso().getNome() : null)
                .build();
    }
}
