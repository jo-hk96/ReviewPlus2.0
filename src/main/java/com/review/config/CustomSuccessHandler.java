package com.review.config;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

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
	    		
	    		String email = cud.getUserEntity().getEmail();
	    		
	    		userRepository.findByEmail(email).ifPresent(userEntity -> {
	    			userEntity.setLastActivityAt(LocalDateTime.now());
	    			userRepository.save(userEntity);
	    		});
	    		
	    	
	    	boolean isDormant = authentication.getAuthorities().stream()
	    						.anyMatch(a -> a.getAuthority().equals("ROLE_DORMANT"));
	    	
	    	if(isDormant) {
	    		response.sendRedirect("/UserDormantAccess");
	    	} else {
	    		response.sendRedirect("/");
	    		
	    	}
	    } else {
	    	response.sendRedirect("/");
	    }
	  }
  }