package com.review.DTO;


import java.util.List;
import java.util.Map;

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
	    
	    @Builder
	    public OAuth2Attributes(Map<String, Object> attributes, String nameAttributeKey, 
	                            String name, String email ,String birthdate ,SocialType socialType) {
	        this.attributes = attributes;
	        this.nameAttributeKey = nameAttributeKey;
	        this.name = name;
	        this.email = email;
	        this.birthdate = birthdate;
	        this.socialType = socialType;
}
	    
	 // Google, Naver 등 서비스별로 다르게 넘어오는 정보를 처리하는 팩토리 메서드
	    public static OAuth2Attributes of(String registrationId, Map<String, Object> attributes) {
	        if ("naver".equals(registrationId)) {
	        }
	        return ofGoogle(attributes); 
	    }
	    
	    @SuppressWarnings("unchecked")
	    private static OAuth2Attributes ofGoogle(Map<String, Object> attributes) {
	    	String rawBirthdate = null;
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
	                .build();
	    }
	    
	    
	    
	    // DB에 저장할 UserEntity 객체를 생성하는 메서드
	    public userEntity toEntity() {
	    	// birthdate가 null이면 임시값("1900-01-01")을 사용하도록 처리합니다.
	        String finalBirthdate = (this.birthdate != null && !this.birthdate.isEmpty()) 
	                                 ? this.birthdate : "1900-01-01"; 
	        return userEntity.builder()
	                .pname(name) //name : 실제이름
	                .email(email) // email : 이메일
	                .nickname("reviewer_" + email.substring(0, email.indexOf('@'))) 
	                .role("ROLE_USER") // 최초 가입 시 권한은 ROLE_USER로 설정
	                .birthdate(finalBirthdate) //DTO에서 받은 값을 사용
	                .password("oauth2_temp_password")
	                .socialType(SocialType.GOOGLE)
	                .isRequiredInfoMissing(true)
	                .build();
	    }
	}
