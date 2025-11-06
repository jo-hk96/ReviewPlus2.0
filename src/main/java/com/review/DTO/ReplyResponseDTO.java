package com.review.DTO;

import java.time.LocalDateTime;

import com.review.entity.userReviewReplyEntity;

import lombok.Data;


@Data
public class ReplyResponseDTO {
	private final Long replyId;
	private final Long userId;
	private final String nickname;
	private final String comment;
	private final LocalDateTime regDate;

	
	public ReplyResponseDTO(userReviewReplyEntity reply) {
		this.replyId = reply.getReplyId();
		this.userId = reply.getUserEntity().getUserId();
		this.nickname = reply.getUserEntity().getNickname();
		this.comment = reply.getComment();
		this.regDate = reply.getRegDate();
	}
}
