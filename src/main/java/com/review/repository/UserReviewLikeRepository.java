package com.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
	
	@Query(value = "SELECT COUNT(*) FROM USER_REVIEW_LIKE WHERE USER_ID = :userId AND REVIEWID = :reviewId", nativeQuery = true)
	int countByReviewIdAndUserId(@Param("reviewId") Long reviewId, @Param("userId") Long userId);
}
