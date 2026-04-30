package com.techshop.user.config;

import com.techshop.user.entity.User;
import com.techshop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class UserDataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDemoUser() {
        return args -> {
            if (userRepository.existsByEmail("demo@techshop.com")) {
                return;
            }

            userRepository.save(User.builder()
                    .email("demo@techshop.com")
                    .password(passwordEncoder.encode("Demo123!"))
                    .firstName("Demo")
                    .lastName("Customer")
                    .role(User.UserRole.CUSTOMER)
                    .status(User.UserStatus.ACTIVE)
                    .emailVerified(true)
                    .build());
        };
    }
}
