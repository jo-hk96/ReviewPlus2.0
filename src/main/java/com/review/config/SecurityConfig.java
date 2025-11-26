package com.review.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

import com.review.service.CustomOAuth2UserService;
import com.review.service.UserService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomSuccessHandler successHandler;
    private final LastActivityUpdateFilter lastActivityUpdateFilter;

    @Value("${security.rememberme.key}")
    private String rememberMeKey;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, UserService userService) throws Exception {

        http.csrf(csrf -> csrf.disable());

        http.authorizeHttpRequests(auth -> auth
                // ✅ 로그인 폼 & 처리 URL 허용
                .requestMatchers("/UserLoginForm", "/UserLogin").permitAll()

                // ✅ 프로필 업로드는 로그인 필요
                .requestMatchers(HttpMethod.POST, "/api/profile/upload").authenticated()

                // ✅ 나머지 공개 경로
                .requestMatchers("/",
                        "/css/**", "/js/**", "/images/**",
                        "/UserJoinForm", "/UserLoginMain",
                        "/UserJoin", "/MoviesList", "/TopRate",
                        "/api/profile/image/**",
                        "/api/**",
                        "/detail/**",
                        "/check/nickname", "/check/email"
                ).permitAll()

                // 관리자/마이페이지 접근 권한
                .requestMatchers("/Admin/**").hasAnyRole("ADMIN")
                .requestMatchers("/UserMypage", "/detail/**").hasAnyRole("USER", "ADMIN")

                .anyRequest().authenticated()
        );

        // ✅ 폼 로그인
        http.formLogin(login -> login
                .loginPage("/UserLoginForm")
                .loginProcessingUrl("/UserLogin")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler(successHandler)             // 로그인 성공 시 CustomSuccessHandler 사용
                .failureUrl("/UserLoginForm?error=true")
                .permitAll()
        );

        // ✅ Remember-me
        http.rememberMe(remember -> remember
                .key(rememberMeKey)
                .rememberMeParameter("remember-me")
                .tokenValiditySeconds(60 * 60 * 24 * 7)
                .userDetailsService(userService)
        );

        // ✅ OAuth2 로그인
        http.oauth2Login(oauth2 -> oauth2
                .loginPage("/UserLoginForm")
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(successHandler)
        );

        // ✅ 로그아웃 (Flutter에서 /api/user/logout 호출 시 JSON 응답)
        http.logout(logout -> logout
                .logoutUrl("/api/user/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json; charset=UTF-8");
                    response.getWriter()
                            .write("{\"success\": true, \"message\": \"Logout successful\"}");
                })
                .deleteCookies("JSESSIONID", "SESSION")
                .invalidateHttpSession(true)
        );

        http.addFilterAfter(lastActivityUpdateFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CommonsRequestLoggingFilter logFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeHeaders(true);
        filter.setIncludePayload(false);
        filter.setIncludeQueryString(true);
        filter.setIncludeClientInfo(true);
        return filter;
    }

    @Bean
    public FilterRegistrationBean<LastActivityUpdateFilter> registration(
            LastActivityUpdateFilter filter) {
        FilterRegistrationBean<LastActivityUpdateFilter> registration =
                new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
