package com.backend.backend.user;

import com.backend.backend.user.dto.ResetPasswordDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void resetPassword(User currentUser, ResetPasswordDto input) {
        System.out.println("Received reset password request");

        if (currentUser.hasPassword() && input.oldPassword() == null) {
            throw new RuntimeException("Expected old password in addition to new password");
        }
        if (currentUser.hasPassword() && !passwordEncoder.matches(input.oldPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        currentUser.setPassword(passwordEncoder.encode(input.newPassword()));
        userRepository.save(currentUser);
    }

}
