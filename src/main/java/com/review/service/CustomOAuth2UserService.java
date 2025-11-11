package com.review.service;


import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.review.DTO.OAuth2Attributes;
import com.review.config.CustomUserDetails;
import com.review.entity.userEntity;
import com.review.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
	
	private final UserRepository userRepository;
	
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException{
			OAuth2User oauth2User =  super.loadUser(userRequest);
			String registrationId = userRequest.getClientRegistration().getRegistrationId();
			OAuth2Attributes attributes = OAuth2Attributes.of(registrationId, oauth2User.getAttributes());
			
			//DB에 사용자가 있으면 업데이트 없으면 저장
	        userEntity user = saveOrUpdate(attributes);

	        return new CustomUserDetails(
	                user,oauth2User.getAttributes()      
	                );
	    }
		    private userEntity saveOrUpdate(OAuth2Attributes attributes) {
		        userEntity user = userRepository.findByEmail(attributes.getEmail())
		                .map(entity -> entity.update(attributes.getName())) // 이름 업데이트만 한다고 가정
		                .orElse(attributes.toEntity());
		        return userRepository.save(user);
	}
}
