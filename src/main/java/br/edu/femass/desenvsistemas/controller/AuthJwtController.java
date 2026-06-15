package br.edu.femass.desenvsistemas.controller;

import br.edu.femass.desenvsistemas.config.JwtService;
import br.edu.femass.desenvsistemas.dto.UserRequest;
import br.edu.femass.desenvsistemas.dto.UserResponse;
import br.edu.femass.desenvsistemas.entity.User;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import br.edu.femass.desenvsistemas.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthJwtController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRequest request) {
        request.setRole(br.edu.femass.desenvsistemas.entity.Role.ALUNO);

        UserResponse created = userService.create(request);

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        java.util.Map<String, Object> userMap = new java.util.HashMap<>();
        userMap.put("id", created.getId());
        userMap.put("nome", created.getNome());
        userMap.put("matricula", created.getMatricula());
        userMap.put("email", created.getEmail());
        userMap.put("role", created.getRole().name());
        userMap.put("admin", created.isAdmin());
        userMap.put("cursoId", created.getCursoId());
        userMap.put("cursoNome", created.getCursoNome());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("token", token, "user", userMap));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        String identifier = payload.get("email");
        String password = payload.get("senha");

        String email;
        if (identifier != null && identifier.contains("@")) {
            email = identifier;
        } else {
            email = userRepository.findByMatricula(identifier)
                    .map(User::getEmail)
                    .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Credenciais inválidas"));
        }

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        User user = userRepository.findByEmail(email).orElseThrow();

        String token = jwtService.generateToken(userDetails);

        UserResponse userResp = UserResponse.fromEntity(user);

        java.util.Map<String, Object> userMap = new java.util.HashMap<>();
        userMap.put("id", userResp.getId());
        userMap.put("nome", userResp.getNome());
        userMap.put("matricula", userResp.getMatricula());
        userMap.put("email", userResp.getEmail());
        userMap.put("role", userResp.getRole().name());
        userMap.put("admin", userResp.isAdmin());
        userMap.put("cursoId", userResp.getCursoId());
        userMap.put("cursoNome", userResp.getCursoNome());

        return ResponseEntity.ok(Map.of("token", token, "user", userMap));
    }
}
