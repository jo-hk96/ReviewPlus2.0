package com.review.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.review.config.CustomUserDetails;
import com.review.service.UserService;

import lombok.RequiredArgsConstructor;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalControllerAdvice {

	private final UserService userService;

    @ModelAttribute
    public void addGlobalAttributes(@AuthenticationPrincipal CustomUserDetails customUserDetails, Model model) {
        
        Long currentUserId = customUserDetails != null ? customUserDetails.getUserId() : null;
        String storedFileName = "default.png";
        
        if (currentUserId != null) {
            String dbFileName = userService.getProfileImageUrl(currentUserId);
            
            if (dbFileName != null && !dbFileName.isEmpty()) {
                storedFileName = dbFileName;
            }
        }
        
        model.addAttribute("profileFileName", storedFileName); 
        model.addAttribute("currentUserId", currentUserId);
    }
}

