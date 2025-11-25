package com.review.DTO;


import java.util.List;
import java.util.Map;

import javax.swing.text.html.HTML.Attribute;

import com.review.Enum.SocialType;
import com.review.entity.userEntity;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class OAuth2Attributes {
	 	private final Map<String, Object> attributes; // 구글에서 받은 원본 정보
	    private final String nameAttributeKey; // 사용자 이름 키 (google은 "sub")
	    private final String name;
	    private final String email;
	    private final String birthdate;
	    private final SocialType socialType;
	    private final String picture;
	    private final String nickname;
	    
	    
	    
	    @Builder
	    public OAuth2Attributes(Map<String, Object> attributes, String nameAttributeKey, 
	                            String name, String email ,String birthdate ,String picture,String nickname,SocialType socialType) {
	        this.attributes = attributes;
	        this.nameAttributeKey = nameAttributeKey;
	        this.name = name;
	        this.email = email;
	        this.picture = picture;
	        this.birthdate = birthdate;
	        this.nickname = nickname;
	        this.socialType = socialType;
}
	    
	    // Google, Naver 등 서비스별로 다르게 넘어오는 정보를 처리하는 팩토리 메서드
	    public static OAuth2Attributes of(String registrationId, Map<String, Object> attributes) {
	        if ("naver".equals(registrationId)) {
	        	return ofNaver(attributes);
	        }
	        if("kakao".equals(registrationId)) {
	        	return ofKakao(attributes);
	        }
	        return ofGoogle(attributes); 
	    }
	    
	    
	    //구글
	    @SuppressWarnings("unchecked")
	    private static OAuth2Attributes ofGoogle(Map<String, Object> attributes) {
	    	String rawBirthdate = null;
	    	String picture = (String) attributes.get("picture");
	    	if (attributes.containsKey("birthdays")) {
	            List<Map<String, Object>> birthdays = (List<Map<String, Object>>) attributes.get("birthdays");
	            if (!birthdays.isEmpty()) {
	                Map<String, Object> dateMap = (Map<String, Object>) birthdays.get(0).get("date");
	                if (dateMap != null) {
	                    // 연-월-일 형식을 가정하고 포맷팅
	                    String year = dateMap.get("year") != null ? dateMap.get("year").toString() : "1900";
	                    String month = dateMap.get("month") != null ? dateMap.get("month").toString() : "01";
	                    String day = dateMap.get("day") != null ? dateMap.get("day").toString() : "01";
	                    rawBirthdate = String.format("%s-%s-%s", year, month, day);
	                }
	            }
	        }
	    	
	        return OAuth2Attributes.builder()
	                .name((String) attributes.get("name"))
	                .email((String) attributes.get("email"))
	                .nameAttributeKey("sub") // 구글 고유키
	                .attributes(attributes)
	                .birthdate(rawBirthdate)
	                .picture(picture)
	                .socialType(SocialType.GOOGLE)
	                .build();
	    }
	    
	    
	    
	    //네이버
	    @SuppressWarnings("unchecked")
	    private static OAuth2Attributes ofNaver(Map<String, Object> attributes) {
	    	Map<String, Object> response = (Map<String, Object>) attributes.get("response");
	        
	        // 필드 추출 및 포맷팅
	        String name = (String) response.get("name");
	        String email = (String) response.get("email");
	        String picture = (String) response.get("profile_image"); 
	        
	        // 생년월일 조합 
	        String rawBirthdate = null;
	        String birthyear = (String) response.get("birthyear"); 
	        String birthday = (String) response.get("birthday"); // 월-일 (예: 12-20)
	        
	        if (birthyear != null && birthday != null) {
	            // YYYY-MM-DD 형태로 조합
	            rawBirthdate = String.format("%s-%s", birthyear, birthday); 
	        }
	        
	        // 추출한 정보로 빌더를 사용하여 OAuth2Attributes 객체 생성
	        return OAuth2Attributes.builder()
	                .name(name)
	                .email(email)
	                .nameAttributeKey("id") 
	                .attributes(attributes)
	                .birthdate(rawBirthdate)
	                .picture(picture)
	                .socialType(SocialType.NAVER)
	                .build();
	    }
	    
	    
	    //카카오
	    @SuppressWarnings("unchecked")
	    private static OAuth2Attributes ofKakao(Map<String, Object> attributes) {
	    	
	    	Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
	    	Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
	    	
	        // 필드 추출 및 포맷팅
	    	String name = (String) kakaoAccount.get("name");
	    	String email = (String) kakaoAccount.get("email");
	    	String nickname = (String) profile.get("nickname");
	    	String picture = (String) profile.get("profile_image_url"); 
	        
	        // 생년월일 조합 
	        String rawBirthdate = null;
	        String birthyear = (String) kakaoAccount.get("birthyear"); 
	        String birthday = (String) kakaoAccount.get("birthday");
	        
	       if(birthyear != null && birthday != null && birthday.length() == 4) {
	    	   rawBirthdate = String.format("%s-%s-%s",
	    			   						birthyear,
	    			   						birthday.substring(0,2), //MM
	    			   						birthday.substring(2)); //DD
	       }
	        
	        
	        return OAuth2Attributes.builder()
	                .name(name)
	                .email(email)
	                .nameAttributeKey("id")
	                .attributes(attributes)
	                .birthdate(rawBirthdate)
	                .picture(picture)
	                .nickname(nickname)
	                .socialType(SocialType.KAKAO)
	                .build();
	    }
	    
	    	
	    
	    // DB에 저장할 UserEntity 객체를 생성하는 메서드
	    public userEntity toEntity() {
	        String finalBirthdate = (this.birthdate != null && !this.birthdate.isEmpty()) 
	                                 ? this.birthdate : "1900-01-01"; 
	        return userEntity.builder()
	                .pname(name) //name : 실제이름
	                .email(email) // email : 이메일
	                .nickname("reviewer_" + email.substring(0, email.indexOf('@'))) 
	                .role("ROLE_USER") // 최초 가입 시 권한은 ROLE_USER로 설정
	                .birthdate(finalBirthdate) //DTO에서 받은 값을 사용
	                .password("oauth2_temp_password")
	                .socialType(this.socialType)
	                .isRequiredInfoMissing(true)
	                .build();
	    }
	}
