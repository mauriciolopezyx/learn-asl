package com.backend.backend.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name="users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(unique=true, nullable=false)
    private String username;

    @Column(unique=true, nullable=false)
    private String email;

    @Column(nullable=true)
    private String password;

    private boolean enabled;

    @Column(name="verification_code")
    private String verificationCode;

    @Column(name="verification_expiration")
    private LocalDateTime verificationCodeExpiresAt;

    // for OAuth2
    @Column(name="provider")
    private String provider;
    @Column(name="provider_id")
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role;

    // regular signups
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.provider = "local";
        this.role = Role.USER;
    }
    // signups through an OAuth2 provider
    public User(String username, String email, String provider, String providerId) {
        this.username = username;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
        this.enabled = true; // OAuth2 users are auto-enabled since Google verified them
        this.role = Role.USER;
    }
    public User() {}

    @Override
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public LocalDateTime getVerificationCodeExpiresAt() {
        return verificationCodeExpiresAt;
    }

    public String getProvider() {
        return provider;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public void setVerificationCodeExpiresAt(LocalDateTime verificationCodeExpiresAt) {
        this.verificationCodeExpiresAt = verificationCodeExpiresAt;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    // For simplification purposes, 3 of these 4 return naively
    @Override public boolean isAccountNonExpired() {
        return true;
    }
    @Override public boolean isAccountNonLocked() {
        return true;
    }
    @Override public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override public boolean isEnabled() {
        return enabled;
    }

    // For OAuth2
    public boolean isOAuth2User() {
        return !"local".equals(provider);
    }
    public boolean hasPassword() {
        return password != null && !password.isEmpty();
    }
}
