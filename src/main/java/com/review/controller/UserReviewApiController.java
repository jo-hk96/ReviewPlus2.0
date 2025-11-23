package com.review.controller;

import java.util.List;

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

import com.review.DTO.ReplyResponseDTO;
import com.review.DTO.ReviewLikeResponse;
import com.review.DTO.UserReviewDTO;
import com.review.DTO.UserReviewReplyDTO;
import com.review.DTO.movieDTO;
import com.review.config.CustomUserDetails;
import com.review.entity.userEntity;
import com.review.entity.userReviewEntity;
import com.review.repository.UserRepository;
import com.review.repository.UserReviewRepository;
import com.review.service.MovieService;
import com.review.service.ReviewLikeService;
import com.review.service.UserReviewReplyService;
import com.review.service.UserReviewService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserReviewApiController {
	
	
	private final UserReviewService userReviewService;
	private final MovieService movieService;
	private final UserReviewReplyService userReviewReplyService;
	private final ReviewLikeService reviewLikeService;
	private final UserReviewRepository reviewRepository;
	private final UserRepository userRepository;
	
	
	//사용자 내정보 좋아요 목록
	@GetMapping("/api/user/likedMovies")
	public List<movieDTO> getLikedMovies(@AuthenticationPrincipal CustomUserDetails cud){
		Long userId = (cud.getUserId());
		return movieService.getLikeMoviesByUserId(userId);
	}
	
	
	
	//마이페이지 리뷰 작성 목록 불러오기
	@GetMapping("/api/user/ReviewMovie")
	public List<UserReviewDTO> getReviewMovies(@AuthenticationPrincipal CustomUserDetails cud){
		Long userId = cud.getUserId();
		return userReviewService.getReviewsByUserId(userId);
	}
	
	
	//회원 리뷰목록 불러오기
	@GetMapping("/api/reviews")
	public ResponseEntity<List<UserReviewDTO>> getReviewsByMovieId(@RequestParam("apiId") Long apiId ,
																   @AuthenticationPrincipal CustomUserDetails cud) {
		Long currentUserId = null;
	    if (cud != null && cud.getUserEntity() != null) {
	        // CustomUserDetails에서 User ID를 안전하게 가져옴
	        currentUserId = cud.getUserEntity().getUserId(); 
	    }
		List<UserReviewDTO> reviews = userReviewService.getReviewsByMovieApiId(apiId ,currentUserId);
	    return ResponseEntity.ok(reviews);
	}
	
	
	
	
	//영화 리뷰 등록
	@PostMapping("/api/userReview")
	public ResponseEntity<?> createReview(@RequestBody UserReviewDTO reviewDto,Long apiId ,
			@AuthenticationPrincipal CustomUserDetails customUserDetails){
		
		if (customUserDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }
		
		userEntity user = customUserDetails.getUserEntity();
		userReviewEntity newReview = userReviewService.saveReview(reviewDto, user);
		UserReviewDTO responseDto = UserReviewDTO.fromEntity(newReview);
		
		String latestProfileFileName = userRepository.findProfileImageUrlByUserId(user.getUserId())
                .orElse("default.png"); // UserRepository에 이 메소드가 있다고 가정
		
		String timeStamp = String.valueOf(System.currentTimeMillis());
	    String cacheBustingUrl = latestProfileFileName + "?t=" + timeStamp;
	    
	    responseDto.setProfileImageUrl(cacheBustingUrl);
	    return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
	}
	
	
	
	//리뷰수정
	@PatchMapping("api/userReview/{reviewId}")
	public ResponseEntity<UserReviewDTO> updateReview(
	        @PathVariable Long reviewId, 
	        @RequestBody UserReviewDTO updateDto,
	        @AuthenticationPrincipal CustomUserDetails cud) {
	    UserReviewDTO updatedReview = userReviewService.updateReview(reviewId, updateDto, cud.getUserId());
	    return ResponseEntity.ok(updatedReview);
	}
	
	
	//리뷰 삭제
	@DeleteMapping("api/userReview/{reviewId}")
	public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @AuthenticationPrincipal CustomUserDetails cud) {
		userReviewService.deleteReview(reviewId, cud.getUserId()); 
		return ResponseEntity.noContent().build();
	}
	
	//대댓글 등록
	@PostMapping("/api/replies")
	public ResponseEntity<ReplyResponseDTO> CreateReviewReply(@RequestBody UserReviewReplyDTO replyDTO,
												  @AuthenticationPrincipal CustomUserDetails userDetails
												  ){
		//코멘트 내용이 비어있으면 400 Bad Request
		if(replyDTO.getComment() == null || replyDTO.getComment().trim().isEmpty()) {
			return new ResponseEntity<>(null,HttpStatus.BAD_REQUEST);}
		Long loggedInUserId = userDetails.getUserId();
		ReplyResponseDTO responseDTO = userReviewReplyService.registerReply(replyDTO,loggedInUserId);
	   return new ResponseEntity<ReplyResponseDTO>(responseDTO,HttpStatus.CREATED);
	}
	
	//대댓글 목록 조회
	@GetMapping("/api/reviews/{reviewId}/replies")
	public ResponseEntity<List<ReplyResponseDTO>> getReplies(
				@PathVariable("reviewId")Long reviewId
			){
		//DTO 목록을 호출
		List<ReplyResponseDTO> replies = userReviewReplyService.getRepliesByReviewId(reviewId);
		return ResponseEntity.ok(replies);
	}
	
	//대댓글 삭제
	@DeleteMapping("/api/userReviewReply/{replyId}")
	public ResponseEntity<Void> deleteReviewReply(@PathVariable Long replyId, @AuthenticationPrincipal CustomUserDetails cud){
		userReviewReplyService.deleteReviewReply(replyId, cud.getUserId());
		return ResponseEntity.noContent().build();
	}
	
	
	//리뷰 좋아요
	@PostMapping("/api/reviews/{reviewId}/likes")
	public ResponseEntity<ReviewLikeResponse> toggleLike(
			@PathVariable Long reviewId,
			@AuthenticationPrincipal CustomUserDetails cud
			){
		//현재 로그인 된 사용자 ID 가져오기
		Long currentUserId = cud.getUserEntity().getUserId();
		
		//좋아요 상태 토글
		boolean isReviewLiked = reviewLikeService.toggleReviewLike(reviewId, currentUserId);
		//리뷰 엔티티를 조회해서 likeCount를 가져옴
		userReviewEntity updatedReview = reviewRepository.findById(reviewId)
				.orElseThrow(() -> new EntityNotFoundException("리뷰 없음"));
		
		ReviewLikeResponse response = new ReviewLikeResponse(isReviewLiked, updatedReview.getLikeCount());
		return ResponseEntity.ok(response);
	}
}
