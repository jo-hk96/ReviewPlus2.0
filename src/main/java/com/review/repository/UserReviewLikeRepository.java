package com.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.review.entity.userEntity;
import com.review.entity.userReviewEntity;
import com.review.entity.userReviewLikeEntity;

public interface UserReviewLikeRepository extends JpaRepository<userReviewLikeEntity, userReviewLikeEntity.UserReviewLikeId> {
	
	
	//좋아요 상태 확인
	//리뷰에 유저가 좋아요를 눌렀는지 찾음
	Optional<userReviewLikeEntity> findByReviewEntityAndUserEntity(
			userReviewEntity reviewEntity,
			userEntity userEntity
			);
	
	
	//좋아요 갯수 조회
	
	
}
