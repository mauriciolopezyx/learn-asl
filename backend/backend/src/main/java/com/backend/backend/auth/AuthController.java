package com.backend.backend.auth;

import com.backend.backend.auth.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/auth")
@RestController
class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody @Valid RegisterUserDto registerUserDto,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        try {
            return authService.register(registerUserDto);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(
            @RequestBody @Valid LoginUserDto loginUserDto,
            HttpServletRequest request,
            HttpServletResponse response,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        System.out.println("Received login request " + System.currentTimeMillis());
        try {
            return authService.authenticate(loginUserDto, request, response);
        } catch (RuntimeException e) {
            System.out.println("Login attempt failed~");
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Create a cookie that expires immediately to clear it
        return ResponseEntity.badRequest().body("fix this later");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(
            @RequestBody @Valid VerifyUserDto verifyUserDto,
            HttpServletRequest request,
            HttpServletResponse response,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        System.out.println("received verify");
        try {
            return authService.verifyUser(verifyUserDto, request, response);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(
            @RequestBody @Valid ForgotPasswordDto forgotPasswordDto,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        try {
            authService.resendVerificationCode(forgotPasswordDto.email());
            return ResponseEntity.ok("Verification code resent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody @Valid ForgotPasswordDto forgotPasswordDto,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        try {
            return authService.forgotPasswordInitiate(forgotPasswordDto.email());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/forgot-password/code")
    public ResponseEntity<?> forgotPasswordCodeValidate(
            @RequestBody @Valid VerifyUserDto verifyUserDto,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        try {
            return authService.forgotPasswordCodeValidate(verifyUserDto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/forgot-password/code/resend")
    public ResponseEntity<?> forgotPasswordCodeResend(
            @RequestBody @Valid ForgotPasswordDto forgotPasswordDto,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        try {
            return authService.resendVerificationCode(forgotPasswordDto.email());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPasswordReset(
            @RequestBody @Valid ForgotPasswordResetDto forgotPasswordResetDto,
            HttpServletRequest request,
            HttpServletResponse response,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }
        try {
            return authService.forgotPasswordFullValidate(forgotPasswordResetDto, request, response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



}