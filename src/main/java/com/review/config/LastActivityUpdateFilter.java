package com.review.config;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.filter.OncePerRequestFilter;

import com.review.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LastActivityUpdateFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    @Transactional // DB 갱신 작업이므로 트랜잭션 필요
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
                                    throws ServletException, IOException {

        // 1. 현재 Security Context에서 인증 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 2. 인증된 사용자이고, 익명(Anonymous) 사용자가 아닌지 확인
        if (authentication != null && 
            authentication.isAuthenticated() && 
            !(authentication instanceof AnonymousAuthenticationToken)) {
        	String userEmail = authentication.getName();
        	try {
        		userRepository.findByEmail(userEmail).ifPresent(user -> {
                    // 3. 사용자가 존재하면 최종 활동 시간을 갱신합니다.
                    user.setLastActivityAt(LocalDateTime.now());
                    userRepository.save(user);
        		});
        		
        	}catch(NumberFormatException e) {
        		System.out.println("인증된 사용자의 Id 포맷 오류:" + authentication.getName());
        	}catch(Exception e) {
        		e.printStackTrace();
        	}

            
        }
        filterChain.doFilter(request, response);
    }
    
}