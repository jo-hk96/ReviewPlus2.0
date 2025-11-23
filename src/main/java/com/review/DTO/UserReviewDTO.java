package com.review.DTO;


import java.time.format.DateTimeFormatter;

import com.review.entity.userReviewEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReviewDTO {
		private Long reviewId;      // DB에서 생성된 ID (응답에 필수)
	    private String nickname;    // 작성자 닉네임
	    private String comment;     
	    private int rating;
		private Long apiId;
		private String title;
		private String regDate;     
		private Long userId;
		private String profileImageUrl; //프로필 사진 주소
		private boolean isReviewLiked;
		private int likeCount;
		
		
		
	    public static UserReviewDTO fromEntity(userReviewEntity entity) {
	    	  Long userId = null;
	          
	          if (entity.getUserEntity() != null) {
	              // UserEntity 객체 대신 Long 타입의 ID 값만 가져와서 저장
	              userId = entity.getUserEntity().getUserId(); 
	          }
	          
	        // userReviewEntity 를 UserReviewDTO로 담아서 변환하는 로직
	        return UserReviewDTO.builder()
	        		.apiId(entity.getApiId())
	                .reviewId(entity.getReviewId())
	                .nickname(entity.getUserEntity().getNickname()) 
	                .comment(entity.getComment())
	                .rating(entity.getRating())
	                .title(entity.getTitle())
	                .userId(userId)
	                .regDate(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(entity.getRegDate()))
	                .build();
	    }
}
