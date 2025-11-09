package com.review.DTO;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReviewReplyDTO {
	private Long replyId; //대댓글 리뷰ID
	private Long reviewId;
	private String comment;//내용
	private String nickname; //작성자 닉네임
	private Long userId; //유저ID
	private String profileImageUrl; //유저 프로필 Url
	
}
