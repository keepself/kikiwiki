package com.kikiwiki.backend.user;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    // BCrypt로 암호화된 값만 저장 (평문 비밀번호는 절대 저장하지 않음)
    @Column(nullable = false)
    private String passwordHash;

    // 신체스펙 - 키는 자주 안 바뀌니 현재값 하나만 (이력 관리 안 함)
    private Integer heightCm;

    // 프로필 사진 - "data:image/jpeg;base64,..." 형태로 그대로 저장 (파일 스토리지 없이 DB에만 저장,
    // 프론트에서 업로드 전에 작은 크기로 리사이즈해서 보내므로 용량 부담은 적음)
    @Column(columnDefinition = "TEXT")
    private String profileImageDataUrl;

    protected User() {
    }

    public User(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
    }

    public void updateHeight(Integer heightCm) {
        this.heightCm = heightCm;
    }

    public void updateProfileImage(String profileImageDataUrl) {
        this.profileImageDataUrl = profileImageDataUrl;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public String getProfileImageDataUrl() {
        return profileImageDataUrl;
    }
}
