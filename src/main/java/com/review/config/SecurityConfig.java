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

import com.review.entity.userEntity;
import com.review.service.CustomOAuth2UserService;
import com.review.service.UserService;

import lombok.RequiredArgsConstructor;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
	
	private final CustomOAuth2UserService customOAuth2UserService; 
	private final CustomSuccessHandler successHandler;
	
	
	private final LastActivityUpdateFilter lastActivityUpdateFilter;
	
	
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
		            	.requestMatchers(HttpMethod.POST, "/api/profile/upload").authenticated()
		            	//관리자
			            .requestMatchers("/Admin/**").hasAnyRole("ADMIN")
			            //로그인시 이용 경로(일반,관리자)
			            .requestMatchers("/UserMypage" , "/detail/**").hasAnyRole("USER","ADMIN")
			            //로그인 없이 모두 허용할 경로
		                .requestMatchers("/",
		                		"/css/**","/js/**","images/**",
		                		"/detail/**",
				                "/UserJoinForm","/UserLoginMain","/api/profile/image/**",
		                        "/UserJoin","/MoviesList","/TopRate","/api/**","/check/nickname","/check/email"
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
		        .loginPage("/UserLoginForm")
		        .userInfoEndpoint(userInfo -> userInfo
		            .userService(customOAuth2UserService)) //DB저장등 후처리 서비스 담당
		        .successHandler(successHandler) // ⭐ 오직 이 핸들러 하나만 사용! ⭐
		    );
		    
		    //로그아웃 처리
		    http
	            .logout(logout -> logout
	                    .logoutUrl("/logout") //로그아웃 경로
	                    .logoutSuccessUrl("/") //로그아웃 후 이동할 페이지
	                    .invalidateHttpSession(true)
	                    .deleteCookies("JSESSIONID")
	              );
		    
		    http.addFilterAfter(lastActivityUpdateFilter, UsernamePasswordAuthenticationFilter.class);
		// http.build()를 붙여서 SecurityFilterChain 빈으로 반환
	    return http.build();
	  }
	
	
	@Bean
    public FilterRegistrationBean<LastActivityUpdateFilter> registration(
        LastActivityUpdateFilter filter) {
        FilterRegistrationBean<LastActivityUpdateFilter> registration = 
            new FilterRegistrationBean<>(filter);
        registration.setEnabled(false); 
        return registration;
    }
	
	
	//BCrypt패스워드 암호화
	  @Bean
	  public PasswordEncoder getPasswordEncoder() {
		return new BCryptPasswordEncoder();
	  }
	 
	}