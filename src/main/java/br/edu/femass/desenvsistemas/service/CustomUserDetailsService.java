package br.edu.femass.desenvsistemas.service;

import br.edu.femass.desenvsistemas.entity.Role;
import br.edu.femass.desenvsistemas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .map(user -> {
                    Set<String> roleNames = user.getRoles().stream()
                            .map(Enum::name)
                            .collect(Collectors.toCollection(LinkedHashSet::new));
                    if (user.isEffectiveAdmin()) {
                        roleNames.add(Role.ADMIN.name());
                    }
                    return org.springframework.security.core.userdetails.User.builder()
                            .username(user.getEmail())
                            .password(user.getSenha())
                            .roles(roleNames.toArray(new String[0]))
                            .build();
                })
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
    }
}
