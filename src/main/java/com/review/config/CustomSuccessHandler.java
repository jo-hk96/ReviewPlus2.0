package com.review.config;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomSuccessHandler implements AuthenticationSuccessHandler{
	    @Override
	    public void onAuthenticationSuccess(
	        HttpServletRequest request, 
	        HttpServletResponse response, 
	        Authentication authentication 
	    ) throws IOException {
	        SimpleGrantedAuthority dormantAuthority = new SimpleGrantedAuthority("ROLE_DORMANT");
	        if (authentication.getAuthorities().contains(dormantAuthority)) {
	            response.sendRedirect("/UserDormant");
	        } else {
	            response.sendRedirect("/"); 
	        }
	    }
	}
