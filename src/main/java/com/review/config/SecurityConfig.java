package com.review.config;

import java.util.List;

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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
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

        // =====================================================================
        // CORS 설정
        // =====================================================================
        http.cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOriginPatterns(List.of("*"));
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("*"));
            config.setAllowCredentials(true);
            return config;
        }));


        // =====================================================================
        // CSRF OFF (Flutter WebView + HTML POST 대비 필수)
        // =====================================================================
        http.csrf(csrf -> csrf.disable());


        // =====================================================================
        // URL 권한 설정
        // =====================================================================
        http.authorizeHttpRequests(auth -> auth

                // 로그인 없이 허용되는 URL
                .requestMatchers(
                		 "/", "/css/**", "/js/**", "/images/**",
                	        "/UserLoginForm", "/UserLogin", "/UserLoginMain",
                	        "/UserJoinForm", "/UserJoin",
                	        "/MoviesList", "/TopRate",
                	        "/detail/**","/api/detail/**",
                	        "/check/nickname", "/check/email",
                	        "/api/profile/image/**",

                	        // ⭐ 영화 상세 API 허용
                	        "/api/movies/**",
                	        "/api/movie/**",

                	        // ⭐ 리뷰 조회 허용
                	        "/api/reviews/**",

                	        // ⭐ 뉴스 허용
                	        "/api/news/**"
                ).permitAll()

                // ★ 소셜 사용자 정보 변경은 로그인 필요
                .requestMatchers("/SocialUserEdit").authenticated()
                
                // 마이페이지
                .requestMatchers("/UserMypage").hasAnyRole("USER", "ADMIN")

                // 프로필 업로드는 로그인 사용자만
                .requestMatchers(HttpMethod.POST, "/api/profile/upload").authenticated()

                // 관리자 페이지
                .requestMatchers("/Admin/**").hasRole("ADMIN")

                // 나머지 요청은 인증 필요
                .anyRequest().authenticated()
        );


        // =====================================================================
        // 일반 로그인 설정
        // =====================================================================
        http.formLogin(login -> login
                .loginPage("/UserLoginForm")
                .loginProcessingUrl("/UserLogin")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler(successHandler)
                .failureUrl("/UserLoginForm?error=true")
                .permitAll()
        );


        // =====================================================================
        // Remember-Me
        // =====================================================================
        http.rememberMe(remember -> remember
                .key(rememberMeKey)
                .rememberMeParameter("remember-me")
                .tokenValiditySeconds(60 * 60 * 24 * 7)
                .userDetailsService(userService)
        );


        // =====================================================================
        // OAuth2 로그인
        // =====================================================================
        http.oauth2Login(oauth2 -> oauth2
                .loginPage("/UserLoginForm")
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(successHandler)
        );


        // =====================================================================
        // 로그아웃 (Flutter WebView friendly)
        // =====================================================================
        http.logout(logout -> logout
                .logoutUrl("/api/user/logout")

                // GET 방식 로그아웃 허용 (WebView 에서 필수)
                .logoutRequestMatcher(new AntPathRequestMatcher("/api/user/logout", "GET"))

                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.sendRedirect("/"); // 홈으로 이동
                })

                .deleteCookies("JSESSIONID", "SESSION")
                .invalidateHttpSession(true)
        );


        // =====================================================================
        // 기타 보안 헤더 (iframe 허용)
        // =====================================================================
        http.headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
        );


        // =====================================================================
        // 유저 활동 기록 필터
        // =====================================================================
        http.addFilterAfter(lastActivityUpdateFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    // =====================================================================
    // 요청 로깅 필터
    // =====================================================================
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

        // 중복 등록 방지
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
