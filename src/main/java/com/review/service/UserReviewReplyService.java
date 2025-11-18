package com.review.service;



import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
@Transactional
public class UserReviewReplyService{
	
	private final UserReviewReplyRepository userReviewReplyRepository;
	private final UserRepository userRepository;
	private final UserReviewRepository userReviewRepository;
	
	
	//전체 대댓글 갯수
	public long getTotlaReplyCount() {
		return userReviewReplyRepository.count();
		
	}
	
	//대댓글 등록 서비스
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
	
	
	
	//대댓글 목록 조회
	@Transactional(readOnly = true) //트랜잭셔널 읽기 전용
	public List<ReplyResponseDTO> getRepliesByReviewId(Long reviewId){
		//Entity 목록을 가져옴
		List<userReviewReplyEntity> replies = userReviewReplyRepository.findAllByReviewEntity_ReviewIdOrderByRegDateDesc(reviewId);
		
		//Entity 목록을 DTO 목록으로 변환
		return replies.stream()
				.map(ReplyResponseDTO::new)
				.collect(Collectors.toList());
	}
	
	
	//대댓글 삭제
	@Transactional
	public void deleteReviewReply(Long replyId, Long userId) {
	    userReviewReplyEntity reply = userReviewReplyRepository.findByReplyIdAndUserEntity_UserId(replyId, userId)
	        .orElseThrow(() -> new IllegalArgumentException("삭제할 리뷰를 찾을 수 없거나 권한이 없습니다."));
	    userReviewReplyRepository.delete(reply);
	}



}
