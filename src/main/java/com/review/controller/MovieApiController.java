package com.review.controller;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.review.DTO.TmdbResponseDTO;
import com.review.DTO.movieDTO;
import com.review.config.CustomUserDetails;
import com.review.service.MovieLikeService;
import com.review.service.TmdbApiService;
import com.review.service.UserReviewService;

import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
public class MovieApiController {

		private final MovieLikeService movieLikeService;
		private final TmdbApiService tmdbApiService;
		private final UserReviewService userReviewService;
		
		//영화정보 좋아요 비동기API
		@PostMapping("/api/MovieLike/{apiId}")
		public ResponseEntity<Boolean> toggleLike(@PathVariable Long apiId,
				@AuthenticationPrincipal CustomUserDetails userDetails){
			Long cuUserId = userDetails.getUserId();
			boolean isLiked = movieLikeService.toggleLike(cuUserId,apiId);
			return ResponseEntity.ok(isLiked);
		}
	

	    // 영화 비동기 검색
	    @GetMapping("/api/movies/search") 
	    public List<movieDTO> searchMovieByApi(@RequestParam("query") String query) {
	        List<movieDTO> searchResults = tmdbApiService.searchMovies(query); 
	        //공통메서드호출
	        return userReviewService.applyUserRatings(searchResults); 
	    }
	    
	    
	    @GetMapping("/api/movies/list")
	    public TmdbResponseDTO getMoviesListApi(
	            @RequestParam("category") String category, 
	            @RequestParam("page") int page) {
	        
	        TmdbResponseDTO tmdbResponse = tmdbApiService.getMoviesByCategory(category, page); 
	        List<movieDTO> tmdbMovies = tmdbResponse.getResults(); 
	        List<movieDTO> moviesWithRatings = userReviewService.applyUserRatings(tmdbMovies); 
	        tmdbResponse.setResults(moviesWithRatings);
	        return tmdbResponse;
	    }
	    
	    
	    @GetMapping("/api/detail/{apiId}")
	    public ResponseEntity<Map<String, Object>> getMovieDetailData(@PathVariable("apiId") Long id) { // userDetails도 제거
	        //영화 사이트내 평균 평점 가져오기
	        double averageRating = userReviewService.getAverageRatingByApiId(id);
	        // 2. 데이터를 Map에 담아 JSON으로 반환
	        Map<String, Object> data = new HashMap<>();
	        data.put("apiId", id);
	        data.put("averageRating", averageRating); 
	        return ResponseEntity.ok(data); // JSON 응답: {"apiId": 12345, "averageRating": 4.2}
	    }
}