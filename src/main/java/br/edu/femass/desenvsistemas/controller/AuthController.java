package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.dto.UserResponse;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        Map<String, Object> response = userRepository.findByEmail(authentication.getName())
                .map(user -> {
                    UserResponse dto = UserResponse.fromEntity(user);
                    Map<String, Object> body = new HashMap<>();
                    body.put("name", dto.getNome());
                    body.put("email", dto.getEmail());
                    body.put("roles", dto.getRoles());
                    body.put("admin", dto.isAdmin());
                    return body;
                })
                .orElseGet(() -> {
                    Map<String, Object> body = new HashMap<>();
                    body.put("name", authentication.getName());
                    body.put("email", authentication.getName());
                    return body;
                });

        return ResponseEntity.ok(response);
    }
}
