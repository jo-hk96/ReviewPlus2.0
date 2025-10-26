package com.review.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.review.entity.userEntity;
import com.review.service.CustomOAuth2UserService;
import com.review.service.UserService;

import lombok.RequiredArgsConstructor;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
	
	private final CustomOAuth2UserService customOAuth2UserService; 
	private final CustomSuccessHandler successHandler; 
	@Value("${security.rememberme.key}")
	 private String rememberMekey;
	
	@Bean
	  public SecurityFilterChain filterChain(HttpSecurity http ,UserService userService) throws Exception {
			
			//CSRF
		    http
		        .csrf((csrfConfig) ->
		            csrfConfig.disable()
		        )
		        //인가 설정
		        .authorizeHttpRequests(authorizeRequests ->
		            authorizeRequests
		            	//관리자
			            .requestMatchers("/Admin/**").hasAnyRole("ADMIN")
		            	//로그인 없이 모두 허용할 경로
			            .requestMatchers("/UserMypage" , "/detail/**").hasAnyRole("USER","ADMIN")
		                .requestMatchers("/",
		                		"/css/**","/js/**","images/**",
		                		"/detail/**",
				                "/UserJoinForm","/UserLoginMain",
		                        "/UserJoin","/MoviesList","/TopRate","/api/**"
				                ).permitAll()
		                .anyRequest().authenticated()
		        ) 
		        
		        //권한 없이 접근시
		        .exceptionHandling(exception -> exception
		        .accessDeniedPage("/access-error") 
		       );
		 
		    
		    
		    //로그인 페이지 처리
		    http
		        .formLogin(login -> login
		          .loginPage("/UserLoginForm") // 로그인 페이지
		          .loginProcessingUrl("/UserLogin") //로그인 데이터 처리할 경로
		          .usernameParameter("email")
		          .passwordParameter("password")
		          .successHandler(successHandler) //회원 상태에 따라 페이지 이동 (관리자,일반,휴면)
		          .failureUrl("/UserLoginForm?error=true") // 로그인 실패시
		          .permitAll()
		        );
		    
		    
		    //사용자 쿠키 등록
		    http
		    	.rememberMe(remember -> remember
		    			.userDetailsService(userService)
		    			.rememberMeParameter("remember-me") //로그인폼에서 사용할 체크박스 name
		    			.tokenValiditySeconds(60 * 60 * 24 * 7) // 토큰 유효 기간( 7일)
		    			.userDetailsService(userService)//사용자 정보를 로드할 서비스 지정
		    			.key(rememberMekey)
		    			);
		    
		    
		    //OAuth2로그인
		    http
		    	.oauth2Login(oauth2 -> oauth2
		    			.loginPage("/UserLoginForm")// 소셜 로그인 버튼을 보여줄 페이지
		    			//사용자 정보 처리 서비스 지정
		    			.userInfoEndpoint(userInfo -> userInfo
		    			.userService(customOAuth2UserService)) //DB저장등 후처리 서비스 담당
		    			
		    			//SuccessHandler 람다함수
		    			.successHandler((request , response , authentication) ->{
		    			    Object principal = authentication.getPrincipal();
		    			    if(principal instanceof CustomUserDetails) {
		    			        CustomUserDetails CustomUser = (CustomUserDetails) principal;
		    			        userEntity user = CustomUser.getUserEntity();
		    			        if(user.isRequiredInfoMissing()) {
		    			            response.sendRedirect("/SocialUserEditForm"); 
		    			            return;
		    			        }
		    			    }
		    			     response.sendRedirect("/"); // 정보가 모두 있다면 홈으로 이동
		    			})
		    		);
		    
		    //로그아웃 처리
		    http
	            .logout(logout -> logout
	                    .logoutUrl("/logout") //로그아웃 경로
	                    .logoutSuccessUrl("/") //로그아웃 후 이동할 페이지
	                    .invalidateHttpSession(true)
	                    .deleteCookies("JSESSIONID")
	              );
		    
		// http.build()를 붙여서 SecurityFilterChain 빈으로 반환
	    return http.build();
	  }


	//BCrypt패스워드 암호화
	  @Bean
	  public PasswordEncoder getPasswordEncoder() {
		return new BCryptPasswordEncoder();
	  }
	 
	}