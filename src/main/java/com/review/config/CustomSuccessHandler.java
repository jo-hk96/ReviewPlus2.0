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

        if (principal instanceof CustomUserDetails cud) {
            userEntity user = cud.getUserEntity();

            // 필수 정보 누락 시 이동
            if (user.isRequiredInfoMissing()) {
                response.sendRedirect("/SocialUserEditForm");
                return;
            }

            // 최종 활동 시간 업데이트
            user.setLastActivityAt(LocalDateTime.now());
            userRepository.save(user);

            // 휴면 계정 여부 확인
            boolean isDormant = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_DORMANT"));

            if (isDormant) {
                boolean isSocialUser = user.getSocialType() != null
                        && user.getSocialType() != SocialType.LOCAL;

                if (isSocialUser) {
                    response.sendRedirect("/SocialUserDormantAccess");
                } else {
                    response.sendRedirect("/UserDormantAccess");
                }
                return;
            }

            // ⭐⭐⭐⭐⭐ WebView에서는 쿠키를 자동 저장하지 않기 때문에 직접 Set-Cookie 강제 삽입 ⭐⭐⭐⭐⭐
            String sessionId = request.getSession().getId();
            response.setHeader(
                    "Set-Cookie",
                    "JSESSIONID=" + sessionId
                            + "; Path=/"
                            + "; HttpOnly=false"
                            + "; Secure=false"
                            + "; SameSite=Lax"
            );
            // ----------------------------------------------------------------------------------

            // 5. 일반 사용자: 홈으로 이동
            response.sendRedirect("/");

        } else {
            response.sendRedirect("/");
        }
    }
}
