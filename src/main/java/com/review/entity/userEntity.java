package com.review.entity;


import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.Check;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.review.Enum.SocialType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity //DB 테이블과 매핑
@Table(name = "MOVIE_USER") //DB테이블 이름
@Data //class에 필요한 기본적이 java 코드 생성
@Builder //DTO -> Entity변환시 빌드패턴으로 사용
@NoArgsConstructor //매개변수가 전혀 없는 기본 생성자
@AllArgsConstructor // 모든 필드를 매개변수로 받는 생성자
public class userEntity implements Serializable{
	 	private static final long serialVersionUID = 1L; 
		@SequenceGenerator(
		    name = "USER_SEQ_GENERATOR", 
		    sequenceName = "USER_SEQ",
		    allocationSize = 1
		)
		@GeneratedValue(
			    strategy = GenerationType.SEQUENCE, 
			    generator = "USER_SEQ_GENERATOR"
			)
	   	@Id // 이 필드를 기본 키(PK)로 지정
	    @Column(name = "USER_ID")
	   	private Long userId; //유저 고유 ID
		
		@Column(name = "EMAIL" , nullable = false) 
	    private String email; //로그인 할 Email
		
		@Column(name = "PNAME" , nullable = false) 
		private String pname; //실제 이름
		
		@Column(name = "PASSWORD" , nullable = false) 
	    private String password; //비번
		
		@Column(name = "NICKNAME" , nullable = false)
	    private String nickname; //닉네임
		
		@Column(name = "BIRTHDATE" , nullable = false)
		private String birthdate; // 생일
		
		@Column(name = "PROFILE_IMAGE_URL" ,nullable = true)
		private String profileImageUrl; //프로필 이미지 URL
		
		@Column(name = "LAST_ACTIVITY_AT" , nullable = true)
		private LocalDateTime lastActivityAt; //회원 마지막 활동시간
		
		//사용자가 최초로그인시 회원수정을 했는지 true false 로 확인
		@Column(name = "IRIM",nullable = false)
		@Builder.Default // boolean의 기본값인 false로 만들지않기 위해 true를 초기값을 로둠
		private boolean isRequiredInfoMissing = true;
		
		//소셜 로그인시 SocialType에 해당하는 문자열을 DB에 저장
		@Enumerated(EnumType.STRING)
		@Check(constraints = "SOCIAL_TYPE IN ('LOCAL','GOOGLE','NAVER','KAKAO')")
		@Column(name = "SOCIAL_TYPE" , nullable = false)
		private SocialType socialType;
		
		@Column(name = "ROLE") //관리자 권한
		private String role; //"ROLE_USER", "ROLE_ADMIN"문자열 저장
		
		
		//DB에 최초 저장(INSERT)될 때 현재 시간을 자동으로 기록
		@CreationTimestamp
		@JsonFormat(pattern = "yy/MM/dd HH:mm:ss")
		@Column(name = "CREATED_AT", nullable = false, updatable = false) //updatable = false 설정
		private LocalDateTime createdAt; // 가입 날짜 및 시간
		
		//회원이 하나면 리뷰는 여러개 [일대다]
		@Builder.Default
		@OneToMany(mappedBy = "userEntity", // ReviewEntity에서 UserEntity를 참조하는 필드 이름
		           cascade = CascadeType.REMOVE, //회원 삭제 시, 이 회원의 리뷰도 함께 삭제
		           orphanRemoval = true)
		private List<userReviewEntity> reviews = new ArrayList<>(); 
		
		
		//소셜 로그인시 성함 , 생일이  DB업데이트
		 public userEntity update(String name) {
			 this.pname = name;
			return this;
		    }
		 
		 //유저 프로필 사진 DB업데이트
		 public void updateProfileImage(String profileImageUrl) {
			 this.profileImageUrl = profileImageUrl;
		 }


}
