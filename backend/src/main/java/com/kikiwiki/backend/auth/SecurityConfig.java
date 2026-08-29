package com.kikiwiki.backend.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CorsConfig의 설정을 Security 필터 단에도 명시적으로 연결 (401/403 응답에도 CORS 헤더가 붙도록)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // JWT를 쓰므로 세션 기반 CSRF 보호는 필요 없음
                .csrf(csrf -> csrf.disable())
                // 서버가 세션을 만들지 않도록 함 (매 요청을 토큰으로만 인증)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 브라우저가 CORS 확인을 위해 먼저 보내는 사전 요청(preflight)은 인증 없이 통과시켜야 함
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // 로그인 API는 누구나 접근 가능해야 함 (로그인하기 전이니까)
                        .requestMatchers("/api/auth/login").permitAll()
                        // 나머지 API는 전부 인증 필요
                        .anyRequest().authenticated()
                )
                // Spring Security의 기본 로그인 화면(폼 로그인)과 HTTP Basic 인증을 끔 - 우리는 JWT만 씀
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                // 우리가 만든 JWT 필터를 Spring Security의 인증 처리 앞단에 끼워넣음
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
