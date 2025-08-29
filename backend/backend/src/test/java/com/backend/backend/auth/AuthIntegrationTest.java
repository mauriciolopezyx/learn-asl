package com.backend.backend.auth;

import com.backend.backend.app.SecurityConfigTest;
import com.backend.backend.auth.dto.RegisterUserDto;
import com.backend.backend.email.EmailConfigTest;
import com.backend.backend.email.EmailService;
import com.backend.backend.user.UserRepository;
import com.redis.testcontainers.RedisContainer;
import jakarta.mail.MessagingException;
import org.assertj.core.api.AssertionsForInterfaceTypes;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@Testcontainers
@ActiveProfiles("test")
@Import({EmailConfigTest.class, SecurityConfigTest.class})
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:latest");

    @Container
    static RedisContainer redis = new RedisContainer(DockerImageName.parse("redis:7.2.5"));

    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", redis::getFirstMappedPort);
    }

    @Autowired
    TestRestTemplate restTemplate;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @MockitoBean
    EmailService emailService;

    // since we can't really hit our OAuth endpoints, we'll need to mock

    @BeforeEach
    void setup() throws MessagingException {
        // Ensure clean state
        userRepository.deleteAll();

        // Setup email service mock to do nothing (avoid sending real emails)
        Mockito.doNothing().when(emailService).sendVerificationEmail(
                Mockito.anyString(),
                Mockito.anyString(),
                Mockito.anyString()
        );
    }

    @AfterEach
    void cleanup() {
        userRepository.deleteAll(); // need to clean up as using Transactional won't work when we need to selectively save users in various tests
    }

    @Test
    void shouldRegisterNewUser() {
        RegisterUserDto newUser = new RegisterUserDto("newuser", "password123", "newuser@email.com");

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "/auth/register",
                HttpMethod.POST,
                new HttpEntity<>(newUser),
                new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> body = response.getBody();
        AssertionsForInterfaceTypes.assertThat(body).containsKey("email");
        assertThat(body.get("email")).isEqualTo("newuser@email.com");
    }

}