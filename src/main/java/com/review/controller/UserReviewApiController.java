package com.review.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.review.DTO.UserReviewDTO;
import com.review.DTO.movieDTO;
import com.review.config.CustomUserDetails;
import com.review.entity.userReviewEntity;
import com.review.service.MovieService;
import com.review.service.UserReviewService;

@RestController
public class UserReviewApiController {
	
	
	@Autowired
	private UserReviewService userReviewService;
	
	@Autowired
	private MovieService movieService;
	
	//사용자 내정보 좋아요 목록
	@GetMapping("/api/user/likedMovies")
	public List<movieDTO> getLikedMovies(@AuthenticationPrincipal CustomUserDetails cud){
		Long userId = (cud.getUserId());
		return movieService.getLikeMoviesByUserId(userId);
	}
	
	
	
	//사용자 리뷰 작성 목록
	@GetMapping("/api/user/ReviewMovie")
	public List<UserReviewDTO> getReviewMovies(@AuthenticationPrincipal CustomUserDetails cud){
		Long userId = cud.getUserId();
		return userReviewService.getReviewsByUserId(userId);
	}
	
	
	//리뷰목록
	@GetMapping("/api/reviews")
	public ResponseEntity<List<UserReviewDTO>> getReviewsByMovieId(@RequestParam("apiId") Long apiId) {
	    List<UserReviewDTO> reviews = userReviewService.getReviewsByMovieApiId(apiId); 
	    return ResponseEntity.ok(reviews);
	}
	
	
	//영화 리뷰 등록
	@PostMapping("/api/userReview")
	public ResponseEntity<?> createReview (@RequestBody UserReviewDTO reviewDto,Long apiId){
	    userReviewEntity newReview = userReviewService.saveReview(reviewDto,apiId);
	    UserReviewDTO responseDto = UserReviewDTO.fromEntity(newReview); 
	    return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
	}
	
	
	//리뷰 삭제
	@DeleteMapping("api/userReview/{reviewId}")
	public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @AuthenticationPrincipal CustomUserDetails cud) {
	    userReviewService.deleteReview(reviewId, cud.getUserId()); 
	    return ResponseEntity.noContent().build();
	}
	
	//리뷰수정
	@PatchMapping("api/userReview/{reviewId}")
	public ResponseEntity<UserReviewDTO> updateReview(
	        @PathVariable Long reviewId, 
	        @RequestBody UserReviewDTO updateDto, // 클라이언트가 보낸 원본 DTO
	        @AuthenticationPrincipal CustomUserDetails cud) {
	    UserReviewDTO updatedReview = userReviewService.updateReview(reviewId, updateDto, cud.getUserId());
	    return ResponseEntity.ok(updatedReview);
	}

	
}
