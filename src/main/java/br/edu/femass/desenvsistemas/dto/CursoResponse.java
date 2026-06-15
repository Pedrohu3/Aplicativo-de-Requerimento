package br.edu.femass.desenvsistemas.dto;

import br.edu.femass.desenvsistemas.entity.Curso;
import br.edu.femass.desenvsistemas.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoResponse {

    private Long id;
    private String nome;
    private List<ResponsavelResponse> responsaveis;

    @Getter
    @Builder
    public static class ResponsavelResponse {
        private Role role;
        private Long userId;
        private String userName;
        private String userEmail;
    }

    public static CursoResponse fromEntity(Curso curso) {
        return CursoResponse.builder()
                .id(curso.getId())
                .nome(curso.getNome())
                .responsaveis(curso.getResponsaveis().stream()
                        .map(r -> ResponsavelResponse.builder()
                                .role(r.getRole())
                                .userId(r.getUser().getId())
                                .userName(r.getUser().getNome())
                                .userEmail(r.getUser().getEmail())
                                .build())
                        .toList())
                .build();
    }
}
