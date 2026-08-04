package br.edu.femass.desenvsistemas;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthJwtIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerShouldReturnJwtToken() throws Exception {
        String email = "teste.jwt+" + System.nanoTime() + "@femass.edu.br";

        String payload = """
                {
                  "nome": "Usuário Teste",
                  "email": "%s",
                  "senha": "senha123",
                  "roles": ["ALUNO"]
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email));
    }
}
