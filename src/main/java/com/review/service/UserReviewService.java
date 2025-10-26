package com.review.service;


import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.review.DTO.UserReviewDTO;
import com.review.DTO.movieDTO;
import com.review.entity.userEntity;
import com.review.entity.userReviewEntity;
import com.review.repository.UserRepository;
import com.review.repository.UserReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor //final 필드들을 주입(DI)하기 위한 Lombok 어노테이션
public class UserReviewService{
	private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository; 
    private final TmdbApiService tmdbApiService;
    
    
    
    // 데이터 변경 작업(저장)이므로 트랜잭션 관리 어노테이션 사용
    @Transactional
    public userReviewEntity saveReview(UserReviewDTO userReviewDTO , Long apiId ) {
    	//UserEntity에서 userId찾기
	    userEntity user = userRepository.findByNickname(userReviewDTO.getNickname())
	    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자 닉네임입니다."));
	    //api_id로 영화 제목 조회
	    String movieTitle = tmdbApiService.getMovieTitle(userReviewDTO.getApiId());
	    //userReviewEntity 에서 리뷰 정보를 저장
        userReviewEntity newReview = userReviewEntity.builder()
        		.userEntity(user)                    // 2번에서 찾은 User Entity
                .comment(userReviewDTO.getComment()) // DTO에서 받은 리뷰 내용
                .rating(userReviewDTO.getRating())   // DTO에서 받은 별점
                .apiId(userReviewDTO.getApiId())  	 //DTO에서 받은 영화 apiId
                .title(movieTitle)
                .build();
        return userReviewRepository.save(newReview);
    }
    
    
    //리뷰 평점 평균 계산
    public List<movieDTO> applyUserRatings (List<movieDTO> tmdbMovies) {
        if (tmdbMovies == null) {
            return Collections.emptyList();
        }
        // TMDB에서 받은 영화 목록을 하나씩 돔
        for (movieDTO movie : tmdbMovies) {
            // Tmdb의 영화고유 Id를 가져옴
            Long apiId = movie.getApiId(); 
            double userAvgRating = getAverageRatingByApiId(apiId); 
            movie.setOurAverageRating(userAvgRating);
        }
        return tmdbMovies;
    }
    
    
    //영화 리뷰 가져오기
    public List<userReviewEntity> getReviewsByMovieId(Long apiId) {
        //apiId를 조회해서 반환
        return userReviewRepository.findReviewsByApiIdNative(apiId);
    }
    
    
    
    //메인리뷰 최신순으로 5개 불러오기
    public List<UserReviewDTO> getRecentReviews(){
    	List<userReviewEntity> recentReview = userReviewRepository.findTop5ByOrderByRegDateDesc();
    	return recentReview.stream()
    			.map(UserReviewDTO::fromEntity)
    			.collect(Collectors.toList());
    }
    
    
    //메인리뷰 최신순으로 10개 불러오기
    public List<UserReviewDTO> getAllUserReviews(){
    	List<userReviewEntity> recentReview = userReviewRepository.findTop10ByOrderByRegDateDesc();
    	return recentReview.stream()
    			.map(UserReviewDTO::fromEntity)
    			.collect(Collectors.toList());
    }
    
    
    //회원 전체 리뷰 가져오기
    public List<UserReviewDTO> getAllRecentReviews(){
    	List<userReviewEntity> recentReview = userReviewRepository.findByOrderByRegDateDesc();
    	return recentReview.stream()
    			.map(UserReviewDTO::fromEntity)
    			.collect(Collectors.toList());
    }
    
    //회원 전체 유저 리뷰 검색
    public List<UserReviewDTO> getAllReviewsSearch(String RUS){
    	List<userReviewEntity> searchKeyword = userReviewRepository.findByUserEntity_NicknameContaining(RUS);
    	return searchKeyword.stream()
    			.map(UserReviewDTO::fromEntity)
    			.collect(Collectors.toList());
    }
    
    
    public List<UserReviewDTO> getReviewsByUserId(Long userId){
    	//Repository를 사용해 DB에서 userId로 리뷰 Entity목록을 조회
    	List<userReviewEntity> reviewsEntities = userReviewRepository.findByUserEntity_UserId(userId);
    	//entity목록을 DTO목록으로 바꿔 반환
    	return reviewsEntities.stream()
    			.map(UserReviewDTO::fromEntity)
    			.collect(Collectors.toList());
    }
    
    
    
    //영화 유저 리뷰 목록
	public List<UserReviewDTO> getReviewsByMovieApiId(Long apiId) {
	        List<userReviewEntity> reviewEntities = userReviewRepository.findByApiIdOrderByRegDateDesc(apiId);
	        return reviewEntities.stream()
	                .map(UserReviewDTO::fromEntity) // UserReviewDTO의 정적 팩토리 메서드(fromEntity) 사용 가정
	                .collect(Collectors.toList());
	    }
    
	
	
	// 1. 삭제 메서드: 권한 확인(Optional) 후 삭제
	@Transactional
	public void deleteReview(Long reviewId, Long userId) {
	    // 1. 리뷰 ID로 Entity를 찾고, 작성자가 userId와 일치하는지 확인
	    userReviewEntity review = userReviewRepository.findByReviewIdAndUserEntity_UserId(reviewId, userId)
	        .orElseThrow(() -> new IllegalArgumentException("삭제할 리뷰를 찾을 수 없거나 권한이 없습니다."));
	    userReviewRepository.delete(review);
	}

	// 2. 수정 메서드
	@Transactional
	public UserReviewDTO updateReview(Long reviewId, UserReviewDTO updateDto, Long userId) {
	    // 1. 리뷰 ID로 Entity를 찾고, 작성자가 userId와 일치하는지 확인
	    userReviewEntity review = userReviewRepository.findByReviewIdAndUserEntity_UserId(reviewId, userId)
	        .orElseThrow(() -> new IllegalArgumentException("수정할 리뷰를 찾을 수 없거나 권한이 없습니다."));
	    review.setComment(updateDto.getComment());
	    review.setRating(updateDto.getRating());
	    return UserReviewDTO.fromEntity(review);
	}
    
	
		//특정 영화에 대한(apiId)에 대한 평균평점을 계산
		public double getAverageRatingByApiId(Long apiId) {
			
			//특정 apiId에 해당하는 모든 리뷰를 DB에서 가져옴
			List<userReviewEntity> reviews = userReviewRepository.findByApiId(apiId);
			//영화리뷰에 평점이 없다면 0.0반환
			if(reviews == null) {
				return 0.0;
			}
			double totalRating = reviews.stream()
					.mapToDouble(userReviewEntity::getRating)
					.sum();
			//평균 = 리뷰 총 합계/리뷰들의 갯수
			double averageRating = totalRating/reviews.size();
			//평균 평점을 소수점 첫째 자리까지만 반환하도록 포맷
			return Math.round(averageRating * 10.0) /10.0;
				
	}
		
		
		
			//관리자 회원 리뷰 수정
			@Transactional
			public void userReviewUpdate(UserReviewDTO urd) {
			userReviewEntity reviewEntity = userReviewRepository.findByReviewId(urd.getReviewId())
									.orElseThrow(() -> new IllegalArgumentException("해당하는 리뷰가 없습니다"));
				reviewEntity.setTitle(urd.getTitle());
				reviewEntity.setRating(urd.getRating());
				reviewEntity.setComment(urd.getComment());
				//@Transactional 얘가 알아서 save해줌
			}
			
			//관리자 회원 리뷰 삭제
			@Transactional
			public void userReviewDelete(UserReviewDTO urd) {
				userReviewRepository.deleteByReviewId(urd.getReviewId());
			}
			
		
}
	    
	