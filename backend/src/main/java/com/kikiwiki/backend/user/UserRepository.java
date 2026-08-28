package com.kikiwiki.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<com.kikiwiki.backend.user.User, Long> {
    Optional<com.kikiwiki.backend.user.User> findByUsername(String username);
}
