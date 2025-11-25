package com.review.config;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.review.Enum.SocialType;
import com.review.entity.userEntity;
import com.review.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomSuccessHandler implements AuthenticationSuccessHandler{
		
		@Autowired
		private UserRepository userRepository;
	
		
		@Override
	    public void onAuthenticationSuccess(
	        HttpServletRequest request, 
	        HttpServletResponse response, 
	        Authentication authentication 
	    ) throws IOException {
	        
	        Object principal = authentication.getPrincipal();
	        
	        if(principal instanceof CustomUserDetails) {
	            CustomUserDetails cud = (CustomUserDetails) principal; 
	            userEntity user = cud.getUserEntity();
	            
	            // 1. 최종 활동 시간 업데이트
	            if (user.isRequiredInfoMissing()) {
	                // ⭐ 필수 정보가 누락되었다면 편집 폼으로 리다이렉트
	                response.sendRedirect("/SocialUserEditForm"); 
	                return; // 여기서 처리 종료
	            }
	            
	            // 2. 최종 활동 시간 업데이트
	            user.setLastActivityAt(LocalDateTime.now());
	            userRepository.save(user); 
	            
	            // 3. 휴면 계정 여부 확인
	            boolean isDormant = authentication.getAuthorities().stream()
	                                .anyMatch(a -> a.getAuthority().equals("ROLE_DORMANT"));
	            
	            if(isDormant) {
	                // 4. 휴면 계정인 경우, 로컬/소셜 타입에 따라 리다이렉트 분기
	                boolean isSocialUser = user.getSocialType() != null && user.getSocialType() != SocialType.LOCAL; 

	                if (isSocialUser) {
	                    response.sendRedirect("/SocialUserDormantAccess"); 
	                } else {
	                    response.sendRedirect("/UserDormantAccess");
	                }
	                return; // 여기서 처리 종료
	            }
	            
	            // 5. 모든 검사를 통과한 일반 사용자: 홈으로 이동
	            response.sendRedirect("/");
	        } else {
	            // ... (예외 처리)
	            response.sendRedirect("/");
	        }
	    }
	}