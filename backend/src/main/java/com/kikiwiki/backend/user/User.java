package com.kikiwiki.backend.user;
import jakarta.persistence.*;

import java.math.BigDecimal;

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

    // 절약모드에서 쓰는 예산. 계정이 1개뿐이라 별도 테이블 없이 여기 저장 (null이면 미설정)
    private BigDecimal monthlyBudget;

    protected User() {
    }

    public User(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
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

    public BigDecimal getMonthlyBudget() {
        return monthlyBudget;
    }

    public void setMonthlyBudget(BigDecimal monthlyBudget) {
        this.monthlyBudget = monthlyBudget;
    }
}
