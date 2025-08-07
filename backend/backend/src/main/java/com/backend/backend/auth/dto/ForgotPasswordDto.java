package com.backend.backend.auth.dto;

import jakarta.validation.constraints.Email;

public record ForgotPasswordDto(
        @Email String email
) {}