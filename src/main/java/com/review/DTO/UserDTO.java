package com.review.DTO;

import java.time.LocalDateTime;

import com.review.Enum.SocialType;
import com.review.entity.userEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
		private Long userId; //유저 고유 ID
	    private String email; //로그인 할 Email
	    private String password; //비번
	    private String nickname; //닉네임
		private String birthdate; // 생일
		private String pname; // 이름
		private LocalDateTime createdAt; // 가입 날짜 및 시간
		private String role; // 관리자 권한 //예: "ROLE_USER", "ROLE_ADMIN" 등의 문자열 저장 
		
	    
		
		
		public UserDTO(userEntity entity) {
			this.userId = entity.getUserId();
			this.email = entity.getEmail();
			this.birthdate = entity.getBirthdate();
			this.nickname = entity.getNickname();
			this.pname = entity.getPname();
			this.createdAt = entity.getCreatedAt();
			this.role = entity.getRole();	
			
			}
		
		
	    public userEntity toEntity() {
	        return userEntity.builder()
	        	.email(this.email) // userEntity의 email 필드로 매핑
                .password(this.password)
                .nickname(this.nickname)
                .birthdate(this.birthdate)
                .socialType(SocialType.LOCAL)
                .pname(this.pname)
                .role(this.role)
                // ID는 DB가 시퀀스로 자동 생성하므로 여기선 제외
                .isRequiredInfoMissing(false) //LOCAL가입시 DB에 정보가 있다고 가정
                .build();
	    }
}
