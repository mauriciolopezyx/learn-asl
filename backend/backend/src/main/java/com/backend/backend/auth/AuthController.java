package com.backend.backend.auth;

import com.backend.backend.auth.dto.LoginUserDto;
import com.backend.backend.auth.dto.RegisterUserDto;
import com.backend.backend.auth.dto.VerifyUserDto;
import com.backend.backend.user.User;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/auth")
@RestController
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterUserDto registerUserDto) {
        try {
            User registeredUser = authService.register(registerUserDto);
            return ResponseEntity.ok(Map.of("email", registeredUser.getEmail()));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginUserDto loginUserDto) {
        System.out.println("Received login request " + System.currentTimeMillis());
        try {
            return authService.authenticate(loginUserDto);
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
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDto verifyUserDto) {
        System.out.println("received verify");
        try {
            return authService.verifyUser(verifyUserDto);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
