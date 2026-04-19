package com.signuppage.service;

import com.signuppage.dto.AuthResponse;
import com.signuppage.dto.LoginRequest;
import com.signuppage.dto.RegisterRequest;
import com.signuppage.model.UserAccount;
import com.signuppage.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        String firstName = normalizeName(request.getFirstName());
        String lastName = normalizeName(request.getLastName());
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        if (!StringUtils.hasText(request.getConfirmPassword()) || !password.equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account already exists for this email");
        }

        UserAccount user = new UserAccount();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);

        return new AuthResponse(true, "Account created successfully.", firstName + " " + lastName, email);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return new AuthResponse(true, "Login successful.", user.getFirstName() + " " + user.getLastName(), user.getEmail());
    }

    private String normalizeName(String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Name fields cannot be blank");
        }
        return value.trim();
    }

    private String normalizeEmail(String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("Email cannot be blank");
        }
        return value.trim().toLowerCase();
    }
}
