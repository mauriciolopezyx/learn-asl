package com.backend.backend.user;

import com.backend.backend.user.dto.ResetPasswordDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/user")
@RestController
class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/ok")
    public ResponseEntity<?> isAuthenticated() {
        System.out.println("Received ok request?");
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/me/password")
    public ResponseEntity<?> hasPassword() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of("hasPassword", currentUser.hasPassword()));
    }

    @PostMapping("/me/password")
    public ResponseEntity<?> resetPassword(
            @RequestBody @Valid ResetPasswordDto resetPasswordDto,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation failed");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        try {
            userService.resetPassword(currentUser, resetPasswordDto);
            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }




}
