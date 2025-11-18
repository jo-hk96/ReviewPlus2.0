package com.review.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.review.entity.userReviewReplyEntity;

@Repository
public interface UserReviewReplyRepository extends JpaRepository<userReviewReplyEntity, Long> {
	
	
	
	
	
	//reviewId에 해당하는 모든 대댓글 목록을 조회
	// Entity(userReviewReplyEntity) -> reviewEntity -> reviewId
	List<userReviewReplyEntity> findAllByReviewEntity_ReviewIdOrderByRegDateDesc(Long reviewId);	
	
	Optional<userReviewReplyEntity> findByReplyIdAndUserEntity_UserId(Long replyId, Long userId);	
}
