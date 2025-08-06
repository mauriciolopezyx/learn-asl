package com.backend.backend.auth;

import com.backend.backend.auth.dto.LoginResponseDto;
import com.backend.backend.auth.dto.LoginUserDto;
import com.backend.backend.auth.dto.RegisterUserDto;
import com.backend.backend.auth.dto.VerifyUserDto;
import com.backend.backend.email.EmailService;
import com.backend.backend.user.User;
import com.backend.backend.user.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public User register(RegisterUserDto input) {
        System.out.println(input.email());
        Optional<User> userFromEmail = userRepository.findByEmail(input.email());
        if (userFromEmail.isPresent()) {
            throw new RuntimeException("An account with the given email already exists");
        }
        Optional<User> userFromName = userRepository.findByUsername(input.username());
        if (userFromName.isPresent()) {
            throw new RuntimeException("An account with the given username already exists");
        }
        User user = new User(input.username(), input.email(), passwordEncoder.encode(input.password()));
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        sendVerificationEmail(user);
        return userRepository.save(user);
    }

    public ResponseEntity<?> authenticate(LoginUserDto input) {
        User user = userRepository.findByEmail(input.email())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.isEnabled()) {
            throw new RuntimeException("User is not verified - please verify to continue");
        }

        if (!user.hasPassword()) {
            throw new RuntimeException("This account uses " + user.getProvider() + " login. Please login with " + user.getProvider() + " and then reset your password after.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.email(),
                        input.password()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        LoginResponseDto loginResponse = new LoginResponseDto(true);

        return ResponseEntity.ok().body(loginResponse);
    }

    public ResponseEntity<?> verifyUser(VerifyUserDto input) {
        Optional<User> optionalUser = userRepository.findByEmail(input.email());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.isEnabled()) {
                throw new RuntimeException("Account already verified");
            }
            if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code has expired");
            }
            if (user.getVerificationCode().equals(input.verificationCode())) {
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            } else {
                throw new RuntimeException("Invalid verification code");
            }

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    input.email(),
                    null,
                    user.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            LoginResponseDto loginResponse = new LoginResponseDto(true);

            return ResponseEntity.ok().body(loginResponse);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void resendVerificationCode(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.isEnabled()) {
                throw new RuntimeException("User is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            sendVerificationEmail(user);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to Code Collab</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the following verification code in the website to continue!</p>"
                + "<div style=\"background-color: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

}
