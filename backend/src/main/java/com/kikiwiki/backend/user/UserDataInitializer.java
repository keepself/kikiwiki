package com.kikiwiki.backend.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// 앱 시작 시 한 번 실행되어, 계정이 하나도 없으면 초기 관리자 계정을 만듦
// application-local.yml의 평문 비밀번호를 받아 그 자리에서 즉시 암호화하고, DB에는 암호화된 값만 저장함
@Component
public class UserDataInitializer implements CommandLineRunner {

    private final com.kikiwiki.backend.user.UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminRawPassword;

    public UserDataInitializer(
            com.kikiwiki.backend.user.UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.password}") String adminRawPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminRawPassword = adminRawPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // 이미 계정이 있으면 아무것도 안 함
        }

        String hashed = passwordEncoder.encode(adminRawPassword);
        userRepository.save(new User(adminUsername, hashed));
    }
}
