package com.backend.backend.app;

import com.backend.backend.auth.OAuth2Handler;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Mock any other beans that might cause issues in tests
    @Bean
    @Primary
    public OAuth2Handler oAuth2Handler() {
        return Mockito.mock(OAuth2Handler.class);
    }

    @Bean
    @Primary
    public AuthenticationProvider authenticationProvider() {
        return Mockito.mock(AuthenticationProvider.class);
    }
}