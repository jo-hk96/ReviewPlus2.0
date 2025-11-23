package com.review.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.review.entity.userEntity;
import com.review.entity.userReviewEntity;
import com.review.entity.userReviewLikeEntity;
import com.review.repository.UserRepository;
import com.review.repository.UserReviewLikeRepository;
import com.review.repository.UserReviewRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewLikeService {
	
	private final UserReviewLikeRepository userReviewLikeRepository;
	private final UserReviewRepository reviewRepository;
	private final UserRepository userRepository;
	
	@Transactional
	public boolean toggleReviewLike(Long reviewId, Long userId) {
		
		//엔티티 조회
		userReviewEntity review = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new EntityNotFoundException("리뷰가 없습니다."));
		userEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("사용자가 없습니다."));
		
		//기존 좋아요 상태 확인
		Optional<userReviewLikeEntity> existingLike =
				userReviewLikeRepository.findByReviewEntityAndUserEntity(review, user);
		if(existingLike.isPresent()) {
			//좋아요 취소(delete)
			userReviewLikeRepository.delete(existingLike.get());
			
			//엔티티, 취소시 갯수 감소
			review.decreaseLikeCount();
			
			//자동으로 DB반영 (@Transactional)
			return false;
		}else {
			
			//좋아요 추가
			userReviewLikeEntity newLike = userReviewLikeEntity.builder()
					.reviewEntity(review)
					.userEntity(user)
					.build();
			userReviewLikeRepository.save(newLike);
			
			//엔티티, 좋아요 증가
			review.increaseLikeCount();
			return true;
		}
	}
}
