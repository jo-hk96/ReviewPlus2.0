package com.review.service;



import org.springframework.stereotype.Service;


import com.review.DTO.ReplyResponseDTO;
import com.review.DTO.UserReviewReplyDTO;
import com.review.entity.userEntity;
import com.review.entity.userReviewEntity;
import com.review.entity.userReviewReplyEntity;
import com.review.repository.UserRepository;
import com.review.repository.UserReviewReplyRepository;
import com.review.repository.UserReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserReviewReplyService{
	
	private final UserReviewReplyRepository userReviewReplyRepository;
	private final UserRepository userRepository;
	private final UserReviewRepository userReviewRepository;
	
	public ReplyResponseDTO registerReply(UserReviewReplyDTO replyDTO, Long loggedInUserId) {
		//replyDTO에서 들고온 객체 참조
		userReviewEntity reviewEntity = userReviewRepository.getReferenceById(replyDTO.getReviewId());
		//외래키 참조컬럼
		userEntity userEntity = userRepository.getReferenceById(loggedInUserId);
		userReviewReplyEntity replyEntity = userReviewReplyEntity.builder()
			.comment(replyDTO.getComment())
			.userEntity(userEntity)
			.reviewEntity(reviewEntity)
			.build();
		userReviewReplyEntity savedReply = userReviewReplyRepository.save(replyEntity);
		return new ReplyResponseDTO(savedReply);
	}
    	
  }
