package com.review.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.review.entity.userReviewEntity;
import com.review.entity.userReviewReplyEntity;

@Repository
public interface UserReviewReplyRepository extends JpaRepository<userReviewReplyEntity, Long> {
	
	
	
	
		
}
