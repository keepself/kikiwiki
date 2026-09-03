package com.kikiwiki.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<com.kikiwiki.backend.user.User, Long> {
    Optional<com.kikiwiki.backend.user.User> findByUsername(String username);

    // 계정이 하나뿐이라 프로필 조회 시 그냥 이걸로 가져옴
    Optional<com.kikiwiki.backend.user.User> findFirstByOrderByIdAsc();
}
