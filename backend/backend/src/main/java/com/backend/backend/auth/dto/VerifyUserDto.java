package com.backend.backend.auth.dto;

public record VerifyUserDto(String email, String verificationCode) {}
