package com.backend.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterUserDto(
        @NotBlank String username,
        @NotBlank String password,
        @Email String email
) {}